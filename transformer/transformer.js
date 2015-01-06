'use strict'
var undef,
    slice = Array.prototype.slice,
    symbol = require('./symbol'),
    isTransformer = require('./isTransformer'),
    isArray = require('../util/isArray'),
    isFunction = require('../util/isFunction'),
    isString = require('../util/isString'),
    identity = require('../util/identity'),
    arrayPush = require('../util/arrayPush'),
    objectMerge = require('../util/objectMerge'),
    stringAppend = require('../util/stringAppend')

module.exports =
function transformer(value){
  var xf
  if(isTransformer(value)){
    xf = value[symbol]
    if(xf === undef){
      xf = value
    }
  } else if(isFunction(value)){
    xf = new FunctionTransformer(value)
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
function ArrayTransformer(arr){
  this.arrDefault = arr === undef ? [] : arr
}
ArrayTransformer.prototype.init = function(){
  return slice.call(this.arrDefault)
}
ArrayTransformer.prototype.step = arrayPush
ArrayTransformer.prototype.result = identity

// Turns a step function into a transfomer with init, step, result (init not supported and will error)
// Like transducers-js Wrap
function FunctionTransformer(step){
  this.step = step
}
FunctionTransformer.prototype.init = function(){
  throw new Error('Cannot init wrapped function, use proper transformer instead')
}
FunctionTransformer.prototype.step = function(result, input){
  return this.step(result, input)
}
FunctionTransformer.prototype.result = identity

// Appends value onto string, using optional constructor arg as default, or '' if not provided
// init will return the default
// step will append input onto string and return result
// result is identity
function StringTransformer(str){
  this.strDefault = str === undef ? '' : str
}
StringTransformer.prototype.init = function(){
  return this.strDefault
}
StringTransformer.prototype.step = stringAppend
StringTransformer.prototype.result = identity

// Merges value into object, using optional constructor arg as default, or {} if not provided
// init will clone the default
// step will merge input into object and return result
// result is identity
function ObjectTransformer(obj){
  this.objDefault = obj === undef ? {} : objectMerge({}, obj)
}
ObjectTransformer.prototype.init = function(){
  return objectMerge({}, this.objDefault)
}
ObjectTransformer.prototype.step = objectMerge
ObjectTransformer.prototype.result = identity
