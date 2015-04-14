import {protocols, isReduced, unreduced,
        identity, isArray, isFunction, isString} from './util'

const {init: tInit, step: tStep, result: tResult} = protocols.transducer
const symIter = protocols.iterator

// given a reduce implementation, returns a transduce implementation
// that delegates to the implementation after handling multiple arity
// and dynamic argument types
export function transduceImpl(reduce){
  return function transduce(t, xf, init, coll) {
    if(isFunction(xf)){
      xf = completing(xf)
    }
    xf = t(xf)
    if (arguments.length === 3) {
      coll = init
      init = xf[tInit]()
    }
    return reduce(xf, init, coll)
  }
}

// given a reduce implementation, returns a reduce implementation
// that delegates to reduce after handling multiple arity
// and dynamic argument types
export function reduceImpl(_reduce){
  return function reduce(xf, init, coll){
    if(isFunction(xf)){
      xf = completing(xf)
    }
    if (arguments.length === 2) {
      coll = init
      init = xf[tInit]()
    }
    return _reduce(xf, init, coll)
  }
}

// given a reduce implementation, returns an into implementation
// that delegates to reduce after handling currying, multiple arity
// and dynamic argument types
export function intoImpl(reduce){
  return function into(init, t, coll){
    var xf = transformer(init),
        len = arguments.length

    if(len === 1){
      return intoCurryXf(xf)
    }

    if(len === 2){
      if(isFunction(t)){
        return intoCurryXfT(xf, t)
      }
      coll = t
      return reduce(xf, xf[tInit](), coll)
    }
    return reduce(t(xf), xf[tInit](), coll)
  }

  function intoCurryXf(xf){
    return function intoXf(t, coll){
      if(arguments.length === 1){
        if(isFunction(t)){
          return intoCurryXfT(xf, t)
        }
        coll = t
        return reduce(xf, xf[tInit](), coll)
      }
      return reduce(t(xf), xf[tInit](), coll)
    }
  }

  function intoCurryXfT(xf, t){
    return function intoXfT(coll){
      return reduce(t(xf), xf[tInit](), coll)
    }
  }
}

// Turns a step function into a transfomer with init, step, result
// If init not provided, calls `step()`.  If result not provided, calls `idenity`
export const completing = (rf, result) => new Completing(rf, result)
function Completing(rf, result){
  this[tInit] = rf
  this[tStep] = rf
  this[tResult] = result || identity
}

// Convert a value to an iterable
const has = {}.hasOwnProperty

export function iterator(value) {
  return iterable(value)[symIter]()
}

export function iterable(value){
  var it
  if(value[symIter] !== void 0){
    it = value
  } else if(isArray(value) || isString(value)){
    it = new ArrayIterable(value)
  } else if(isFunction(value)){
    it = new FunctionIterable(() => ({done: false, value: value()}))
  } else if(isFunction(value.next)){
    it = new FunctionIterable(() => value.next())
  } else {
    it = new ObjectIterable(value)
  }
  return it
}

export class ArrayIterable {
  constructor(arr){
    this.arr = arr
  }
  [symIter](){
    var idx = 0
    return {
      next: () => {
        if(idx >= this.arr.length){
          return {done: true}
        }
        return {done: false, value: this.arr[idx++]}
      }
    }
  }
}

export class FunctionIterable {
  constructor(fn){
    this.fn = fn
  }
  [symIter](){
    return {next: this.fn}
  }
}

export class ObjectIterable {
  constructor(obj){
    this.obj = obj
    this.keys = Object.keys(obj)
  }
  [symIter](){
    var idx = 0
    return {
      next: () => {
        if(idx >= this.keys.length){
          return {done: true}
        }
        var key = this.keys[idx++]
        return {done: false, value: [key, this.obj[key]]}
      }
    }
  }
}

// converts a value to a transformer
const slice = Array.prototype.slice
      
const lastValue = {
  [tInit]: () => {},
  [tStep]: (result, input) => input,
  [tResult]: identity
}

export function transformer(value){
  var xf
  if(value === void 0 || value === null){
    xf = lastValue
  } else if(isFunction(value[tStep])){
    xf = value
  } else if(isFunction(value)){
    xf = completing(value)
  } else if(isArray(value)){
    xf = new ArrayTransformer(value)
  } else if(isString(value)){
    xf = new StringTransformer(value)
  } else {
    xf = new ObjectTransformer(value)
  }
  return xf
}

// Pushes value on array, using optional constructor arg as default, or [] if not provided
// init will clone the default
// step will push input onto array and return result
// result is identity
export class ArrayTransformer {
  constructor(defaultValue){
    this.defaultValue = defaultValue === void 0 ? [] : defaultValue
  }
  [tInit](){
    return slice.call(this.defaultValue)
  }
  [tStep](result, input){
    result.push(input)
    return result
  }
  [tResult](value){ return value }
}

// Appends value onto string, using optional constructor arg as default, or '' if not provided
// init will return the default
// step will append input onto string and return result
// result is identity
export class StringTransformer {
  constructor(str){
    this.strDefault = str === void 0 ? '' : str
  }
  [tInit](){
    return this.strDefault
  }
  [tStep](result, input){
    return result + input
  }
  [tResult](value){ return value }
}

// Merges value into object, using optional constructor arg as default, or {} if undefined
// init will clone the default
// step will merge input into object and return result
// result is identity
export class ObjectTransformer {
  constructor(obj){
    this.objDefault = obj === void 0 ? {} : objectMerge({}, obj)
  }
  [tInit](){
    return objectMerge({}, this.objDefault)
  }
  [tResult](value){ return value }
}
ObjectTransformer.prototype[tStep] = objectMerge
function objectMerge(result, input){
  if(isArray(input) && input.length === 2){
    result[input[0]] = input[1]
  } else {
    var prop
    for(prop in input){
      if(has.call(input, prop)){
        result[prop] = input[prop]
      }
    }
  }
  return result
}
