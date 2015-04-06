const toString = Object.prototype.toString
const has = {}.hasOwnProperty

// type checks
export const isArray = Array.isArray || predicateToString('Array')
export const isFunction = (value) => typeof value === 'function'
export const isUndefined = (value) => value === void 0
export const isNumber = predicateToString('Number')
export const isRegExp = predicateToString('RegExp')
export const isString = predicateToString('String')
function predicateToString(type){
  const str = '[object '+type+']'
  return (value) => str === toString.call(value)
}

// convenience functions
export const identity = v => v

export function compose(){
  const fns = arguments
  return function(xf){
    var i = fns.length
    while(i--){
      xf = fns[i](xf)
    }
    return xf
  }
}

// protocol symbols for iterators and transducers
const symbolExists = typeof Symbol !== 'undefined'
export const protocols = {
  iterator: symbolExists ? Symbol.iterator : '@@iterator',
  transducer: {
    init: '@@transducer/init',
    step: '@@transducer/step',
    result: '@@transducer/result',
    reduced: '@@transducer/reduced',
    value: '@@transducer/value'
  }
}

// reduced wrapper object
const {value: tValue, reduced: tReduced} = protocols.transducer

export const isReduced = (value) => !!(value && value[tReduced])

export function reduced(value, force){
  if(force || !isReduced(value)){
    value = new Reduced(value)
  }
  return value
}
function Reduced(value){
  this[tValue] = value
  this[tReduced] = true
}

export function unreduced(value){
  if(isReduced(value)){
    value = value[tValue]
  }
  return value
}

// Base class for transducers with default implementation
// delegating to wrapped transformer, xf
const {init: tInit, step: tStep, result: tResult} = protocols.transducer
export class Transducer {
  constructor(xf){ this.xf = xf }

  [tInit]() {
    return this.xfInit()
  }
  xfInit(){
    return this.xf[tInit]()
  }

  [tStep](value, input) {
    return this.xfStep(value, input)
  }
  xfStep(value, input){
    return this.xf[tStep](value, input)
  }

  [tResult](value) {
    return this.xfResult(value)
  }
  xfResult(value){
    return this.xf[tResult](value)
  }
}
