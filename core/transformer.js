'use strict'
var tp = require('./protocols').transducer,
    completing = require('./completing'),
    util = require('./util'),
    identity = util.identity,
    isArray = util.isArray,
    isFunction = util.isFunction,
    isString = util.isString,
    objectMerge = util.objectMerge,
    arrayPush = util.arrayPush,
    stringAppend = util.stringAppend,
    slice = Array.prototype.slice,
    lastValue = {}

lastValue[tp.init] = function(){}
lastValue[tp.step] = function(result, input){return input}
lastValue[tp.result] = identity

module.exports =
function transformer(value){
  var xf
  if(value === void 0 || value === null){
    xf = lastValue
  } else if(isFunction(value[tp.step])){
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
function ArrayTransformer(defaultValue){
  this.defaultValue = defaultValue === void 0 ? [] : defaultValue
}
ArrayTransformer.prototype[tp.init] = function(){
  return slice.call(this.defaultValue)
}
ArrayTransformer.prototype[tp.step] = arrayPush
ArrayTransformer.prototype[tp.result] = identity


// Appends value onto string, using optional constructor arg as default, or '' if not provided
// init will return the default
// step will append input onto string and return result
// result is identity
function StringTransformer(str){
  this.strDefault = str === void 0 ? '' : str
}
StringTransformer.prototype[tp.init] = function(){
  return this.strDefault
}
StringTransformer.prototype[tp.step] = stringAppend
StringTransformer.prototype[tp.result] = identity

// Merges value into object, using optional constructor arg as default, or {} if undefined
// init will clone the default
// step will merge input into object and return result
// result is identity
function ObjectTransformer(obj){
  this.objDefault = obj === void 0 ? {} : objectMerge({}, obj)
}
ObjectTransformer.prototype[tp.init] = function(){
  return objectMerge({}, this.objDefault)
}
ObjectTransformer.prototype[tp.step] = objectMerge
ObjectTransformer.prototype[tp.result] = identity
