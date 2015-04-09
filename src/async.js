import Prom from 'any-promise'
import {Transducer, protocols, isReduced, unreduced, identity, compose as comp} from './util'
import {transformer, iterable, transduceImpl, reduceImpl, intoImpl} from './_internal'

const {init: tInit, step: tStep, result: tResult} = protocols.transducer

// Transduce, reduce, into
export const reduce = reduceImpl(_reduce)
export const transduce = transduceImpl(_reduce)
export const into = intoImpl(_reduce)

const _iterator = coll => iterable(coll)[protocols.iterator]()
const _iteratorValue = item => ({done: false, value: item})

function _reduce(xf, init, coll){
  if(coll === void 0){
    coll = init
    init = xf[tInit]()
  }
  return Prom
    .all([xf, init, coll])
    .then(([xf, init, coll]) => new Reduce(_iterator(coll), init, xf).iterate())
}

class Reduce {
  constructor(iter, init, xf){
    this.xf = xf
    this.iter = iter
    this.value = init
    this._step = this.__step.bind(this)
    this._loop = this.__loop.bind(this)
  }
  iterate(){
    return Prom
      .resolve(this.next())
      .then(this._step)
  }
  next(){
    return new Prom((resolve, reject) => {
      try {
        var item = this.iter.next()
        if(!item.done){
          item = Prom
            .resolve(item.value)
            .then(_iteratorValue)
        }
        resolve(item)
      } catch(e){
        reject(e)
      }
    })
  }
  __step(item){
    return new Prom((resolve, reject) => {
      try {
        var result
        if(item.done){
          result = this.xf[tResult](this.value)
        } else {
          result = Prom
            .resolve(this.xf[tStep](this.value, item.value))
            .then(this._loop)
        }
        resolve(result)
      } catch(e){
        reject(e)
      }
    })
  }
  __loop(value){
    this.value = value
    return new Prom((resolve, reject) => {
      try {
        var result
        if(isReduced(value)){
          result = this.xf[tResult](unreduced(value))
        } else {
          result = this.iterate()
        }
        resolve(result)
      } catch(e){
        reject(e)
      }
    })
  }
}

// Defer, delay compose
export function compose(...fromArgs){
  var toArgs = [],
      len = fromArgs.length,
      i = 0
  for(; i < len; i++){
    toArgs.push(fromArgs[i])
    toArgs.push(defer())
  }
  return comp.apply(null, toArgs)
}

export const defer = () => delay()
export const delay = wait => xf => new Delay(wait, xf)
class Delay {
  constructor(wait, xf) {
    const task = new DelayTask(wait, xf)
    this.xf = xf
    this.task = task
    this._step = task.step.bind(task)
    this._result = task.result.bind(task)
  }
  [tInit](){
    if(this.task.resolved){
      return this.task.resolved
    }

    return Prom
      .resolve(this.xf[tInit]())
  }
  [tStep](value, input) {
    if(this.task.resolved){
      return this.task.resolved
    }

    return Prom
      .all([value, input])
      .then(this._step)
  }
  [tResult](value){
    if(this.task.resolved){
      return this.task.resolved
    }

    return Prom
      .resolve(value)
      .then(this._result)
  }
}

class DelayTask {
  constructor(wait, xf){
    this.wait = wait
    this.xf = xf
    this.q = []
  }
  call(){
    var next = this.q[0]
    if(next && !next.processing){
      next.processing = true

      var wait = next.wait
      if(wait > 0){
        setTimeout(next.fn, wait)
      } else {
        next.fn()
      }
    }
  }
  step([value, input]){
    var task = this
    return new Prom((resolve, reject) => {
      task.q.push({fn: taskStep, wait: task.wait})
      task.call()

      function taskStep(){
        try {
          resolve(task.xf[tStep](value, input))
          task.q.shift()
          if(task.q.length > 0){
            task.call()
          }
        } catch(e){
          reject(e)
        }
      }
    })
  }
  result(value){
    var task = this
    task.resolved = new Prom((resolve, reject) => {
      task.q.push({fn: taskResult})
      task.call()
      function taskResult(){
        try {
          task.q = []
          resolve(task.xf[tResult](value))
        } catch(e){
          reject(e)
        }
      }
    })
    return task.resolved
  }
}

// Promises and callbacks
export const when = (promiseOrValue, t) => Prom.resolve(promiseOrValue).then(promiseTransform(t))
export const promiseTransform = (t) => (item) => {
  return new Prom((resolve, reject) => {
    var cb = callback(t, null, (err, result) => {
      if(err) reject(err)
      else resolve(result)
    })
    cb(null, item)
    cb()
  })
}

export function callback(t, init, continuation){
  var done = false, stepper, value,
      xf = transformer(init)

  stepper = t(xf)
  value = stepper[tInit]()

  function checkDone(err, item){
    if(done){
      return true
    }

    err = err || null

    // check if exhausted
    if(isReduced(value)){
      value = unreduced(value)
      done = true
    }

    if(err || done || item === void 0){
      value = stepper[tResult](value)
      done = true
    }

    // notify if done
    if(done){
      if(continuation){
        continuation(err, value)
        continuation = null
        value = null
      } else if(err){
        value = null
        throw err
      }
    }

    return done
  }

  return function(err, item){
    if(!checkDone(err, item)){
      try {
        // step to next result.
        value = stepper[tStep](value, item)
        checkDone(err, item)
      } catch(err2){
        checkDone(err2, item)
      }
    }
    if(done) return value
  }
}

export function emitInto(to, t, from){
  var cb
  t = comp(t, emitData(to))
  cb = callback(t, null, continuation)
  from.on('data', onData)
  from.once('error', onError)
  from.once('end', onEnd)

  function continuation(err){
    if(err) to.emit('error', err)
    to.emit('end')
  }

  function onData(item){
    cb(null, item)
  }

  function onError(err){
    cb(err)
  }

  function onEnd(){
    cb()
    removeListeners()
  }

  function removeListeners(){
    from.removeListener(onData)
        .removeListener(onError)
        .removeListener(onEnd)
  }

  return to
}

const emitData = emitter => xf => new EmitData(emitter, xf)
class EmitData extends Transducer {
  constructor(emitter, xf){
    super(xf)
    this.emitter = emitter 
  }
  [tStep](value, input){
    this.emitter.emit('data', input)
    return value 
  }
}
