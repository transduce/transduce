'use strict'
var Prom = require('any-promise'),
    comp = require('../core/compose'),
    arrayPush = require('../core/util').arrayPush,
    isReduced = require('../core/isReduced'),
    unreduced = require('../core/unreduced'),
    transformer = require('../core/transformer'),
    iterable = require('../core/iterable'),
    protocols = require('../core/protocols')

var impl = module.exports = {
  compose: compose,
  transduce: transduce,
  reduce: reduce,
  toArray: toArray,
  defer: defer,
  delay: delay
}

function compose(/*args*/){
  var toArgs = [],
      fromArgs = arguments,
      len = fromArgs.length,
      i = 0
  for(; i < len; i++){
    toArgs.push(fromArgs[i])
    toArgs.push(defer())
  }
  return comp.apply(null, toArgs)
}

function toArray(xf, coll){
  var init = [],
      push = arrayPush
  if(coll === void 0){
    return reduce(push, init, xf)
  }
  return transduce(xf, push, init, coll)
}

var _transduce = spread(__transduce),
    _reduce = spread(__reduce)
function spread(fn, ctx){
  return function(arr){
    return fn.apply(ctx, arr)
  }
}

function transduce(xf, f, init, coll){
  return Prom
    .all([xf, f, init, coll])
    .then(_transduce)
}

function __transduce(xf, f, init, coll){
  f = transformer(f)
  xf = xf(f)
  return reduce(xf, init, coll)
}

function reduce(xf, init, coll){
  if(coll === void 0){
    coll = init
    init = xf.init()
  }
  return Prom
    .all([xf, init, coll])
    .then(_reduce)
}

function __reduce(xf, init, coll){
  xf = transformer(xf)
  var reduce = new Reduce(_iterator(coll), init, xf)
  return reduce.iterate()
}
function Reduce(iter, init, xf){
  var self = this
  self.xf = xf
  self.iter = iter
  self.value = init
  self._step = spread(self.__step, self)
  self._loop = spread(self.__loop, self)
}
Reduce.prototype.iterate = function(){
  var self = this
  return Prom
    .all([self.next()])
    .then(self._step)
}
Reduce.prototype.next = function(){
  var self = this
  return new Prom(function(resolve, reject){
    try {
      var item = self.iter.next()
      if(!item.done){
        item = Prom
          .all([item.value])
          .then(_iteratorValue)
      }
      resolve(item)
    } catch(e){
      reject(e)
    }
  })
}
Reduce.prototype.__step = function(item){
  var self = this
  return new Prom(function(resolve, reject){
    try {
      var result
      if(item.done){
        result = self.xf.result(self.value)
      } else {
        result = Prom
          .all([self.xf.step(self.value, item.value)])
          .then(self._loop)
      }
      resolve(result)
    } catch(e){
      reject(e)
    }
  })
}
Reduce.prototype.__loop = function(value){
  var self = this
  self.value = value
  return new Prom(function(resolve, reject){
    try {
      var result
      if(isReduced(value)){
        result = self.xf.result(unreduced(value))
      } else {
        result = self.iterate()
      }
      resolve(result)
    } catch(e){
      reject(e)
    }
  })
}

function _iterator(coll){
  return iterable(coll)[protocols.iterator]()
}

function _iteratorValue(item){
  return {done: false, value: item[0]}
}

function defer() {
  return delay()
}

function delay(wait) {
  return function(xf){
    return new Delay(wait, xf)
  }
}
function Delay(wait, xf) {
  var self = this,
      task = new DelayTask(wait, xf)
  self.xf = xf
  self.task = task
  self._step = spread(task.step, task)
  self._result = spread(task.result, task)
}

Delay.prototype.init = function(){
  var self = this,
      task = self.task
  if(task.resolved){
    return task.resolved
  }

  return Prom
    .resolve(self.xf.init())
}
Delay.prototype.step = function(value, input) {
  var self = this,
      task = self.task
  if(task.resolved){
    return task.resolved
  }

  return Prom
    .all([value, input])
    .then(self._step)
}
Delay.prototype.result = function(value){
  var self = this,
      task = self.task
  if(task.resolved){
    return task.resolved
  }

  return Prom
    .all([value])
    .then(self._result)
}

function DelayTask(wait, xf){
  this.wait = wait
  this.xf = xf
  this.q = []
}
DelayTask.prototype.call = function(){
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
DelayTask.prototype.step = function(value, input){
  var task = this
  return new Prom(function(resolve, reject){
    task.q.push({fn: step, wait: task.wait})
    task.call()

    function step(){
      try {
        resolve(task.xf.step(value, input))
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
DelayTask.prototype.result = function(value){
  var task = this
  task.resolved = new Prom(function(resolve, reject){
    task.q.push({fn: result})
    task.call()
    function result(){
      try {
        task.q = []
        resolve(task.xf.result(value))
      } catch(e){
        reject(e)
      }
    }
  })
  return task.resolved
};
