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
      return intoCurryInitXf(intoInit(init, xf), xf)
    }

    if(len === 2){
      if(isFunction(t)){
        return intoCurryInitXfT(intoInit(init, xf), xf, t)
      }
      coll = t
      return reduce(xf, init, coll)
    }
    return reduce(t(xf), init, coll)
  }

  function intoCurryInitXf(init, xf){
    return function intoInitXf(t, coll){
      if(arguments.length === 1){
        if(isFunction(t)){
          return intoCurryInitXfT(init, xf, t)
        }
        coll = t
        return reduce(xf, init(), coll)
      }
      return reduce(t(xf), init(), coll)
    }
  }

  function intoCurryInitXfT(init, xf, t){
    return function intoInitXfT(coll){
      return reduce(t(xf), init(), coll)
    }
  }

  function intoInit(init, xf) {
    return () => reduce(xf, xf[tInit](), init)
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
      },
      [symIter]: symIterReturnSelf
    }
  }
}

export class FunctionIterable {
  constructor(fn){
    this.fn = fn
  }
  [symIter](){
    return { next: this.fn, [symIter]: symIterReturnSelf }
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
      },
      [symIter]: symIterReturnSelf
    }
  }
}

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
    xf = arrayTransformer
  } else if(isString(value)){
    xf = stringTransformer
  } else {
    xf = objectTransformer
  }
  return xf
}

// Pushes value on array, using optional constructor arg as default, or [] if not provided
// init will clone the default
// step will push input onto array and return result
// result is identity
const arrayTransformer = {
  [tInit]() {
    return []
  },
  [tStep](result, input){
    result.push(input)
    return result
  },
  [tResult]: identity
}

// Appends value onto string, using optional constructor arg as default, or '' if not provided
// init will return the default
// step will append input onto string and return result
// result is identity
const stringTransformer = {
  [tInit]() {
    return ''
  },
  [tStep](result, input){
    return result + input
  },
  [tResult]: identity
}

// Merges value into object, using optional constructor arg as default, or {} if undefined
// init will clone the default
// step will merge input into object and return result
// result is identity
const objectTransformer = {
  [tInit]() {
    return {}
  },
  [tStep]: function objectMerge(result, input){
    if (isArray(input) && input.length === 2) {
      result[input[0]] = input[1]
    } else {
      var prop
      for (prop in input){
        if(has.call(input, prop)){
          result[prop] = input[prop]
        }
      }
    }
    return result
  },
  [tResult]: identity
}

function symIterReturnSelf() {
  return this
}
