import {Transducer, compose, identity, protocols,
        isReduced, reduced, unreduced, isArray, isFunction, isIterable, isIterator} from './util'

const {init: tInit, step: tStep, result: tResult} = protocols.transducer
const symIter = protocols.iterator

// Transformer, iterable, completing
import {transduceImpl, reduceImpl, intoImpl,
        transformer, iterable, iterator, completing} from './_internal'
export {transformer, iterable, iterator, completing}

export {compose, identity, protocols, isReduced, reduced, unreduced, Transducer, isIterable, isIterator}

// Transduce, reduce, into
export const reduce = reduceImpl(_reduce)
export const transduce = transduceImpl(_reduce)
export const into = intoImpl(_reduce)

function _reduce(xf, init, coll){
  if(isArray(coll)){
    return arrayReduce(xf, init, coll)
  }
  if(isFunction(coll.reduce)){
    return methodReduce(xf, init, coll)
  }
  return iteratorReduce(xf, init, coll)
}

function arrayReduce(xf, init, arr){
  var value = init,
      i = 0,
      len = arr.length
  for(; i < len; i++){
    value = xf[tStep](value, arr[i])
    if(isReduced(value)){
      value = unreduced(value)
      break
    }
  }
  return xf[tResult](value)
}

function methodReduce(xf, init, coll){
  var value = coll.reduce(xf[tStep].bind(xf), init)
  return xf[tResult](value)
}

function iteratorReduce(xf, init, iter){
  var value = init, next
  iter = iterator(iter)
  while(true){
    next = iter.next()
    if(next.done){
      break
    }

    value = xf[tStep](value, next.value)
    if(isReduced(value)){
      value = unreduced(value)
      break
    }
  }
  return xf[tResult](value)
}

// transducer
export const transducer = (step, result, init) => xf => new FnTransducer(xf, step, result, init)
class FnTransducer extends Transducer {
  constructor(xf, step, result, init) {
    super(xf)

    this._init = init
    this._step = step
    this._result = result

    this.xfInit = this.xfInit.bind(this)
    this.xfStep = this.xfStep.bind(this)
    this.xfResult = this.xfResult.bind(this)
  }
  [tInit](){
    return this._init ? this._init(this.xfInit) : this.xfInit()
  }
  [tStep](value, input){
    return this._step ? this._step(this.xfStep, value, input) : this.xfStep(value, input)
  }
  [tResult](value){
    return this._result ? this._result(this.xfResult, value) : this.xfResult(value)
  }
}

// eduction
export const eduction = (t, coll) => new Eduction(t, coll)
class Eduction {
  constructor(t, coll){
    this.t = t
    this.coll = coll
  }
  [symIter](){
    return iterator(sequence(this.t, this.coll))
  }
  reduce(rf, init){
    return transduce(this.t, rf, init, this.coll)
  }
}

// sequence
export function sequence(t, coll) {
  return new LazyIterable(t, coll)
}

class LazyIterable {
  constructor(t, coll){
    this.t = t
    this.coll = coll
  }
  [symIter](){
    return new LazyIterator(new Stepper(this.t, iterator(this.coll)))
  }
}

class LazyIterator {
  constructor(stepper){
    this.stepper = stepper
    this.values = []
  }
  next(){
    if(this.stepper && this.values.length === 0){
      this.stepper.step(this)
    }
    return this.values.length ? {done: false, value: this.values.pop()} : {done: true}
  }
}

const stepTransformer = {
  [tInit]: () => {},
  [tStep]: (lt, input) => {
    lt.values.push(input)
    return lt
  },
  [tResult]: (lt) => {
    lt.stepper = null
    return lt
  }
}

class Stepper {
  constructor(t, iter){
    this.xf = t(stepTransformer)
    this.iter = iter
  }
  step(lt){
    var next, result,
        values = lt.values,
        prevLen = values.length
    while(prevLen === values.length){
      next = this.iter.next()
      if(next.done){
        this.xf[tResult](lt)
        break
      }

      result = this.xf[tStep](lt, next.value)
      if(isReduced(result)){
        this.xf[tResult](lt)
        break
      }
    }
  }
}
