'use strict'
var /* global Symbol */
    /* jshint newcap:false */
    symbolExists = typeof Symbol !== 'undefined',
    symbol = symbolExists ? Symbol('transformer') : '@@transformer',
    completing = require('./completing'),
    identity = require('./identity'),
    util = require('./util'),
    isArray = util.isArray,
    isFunction = util.isFunction,
    isString = util.isString,
    objectMerge = util.objectMerge,
    slice = Array.prototype.slice,
    lastValue = {
      init: function(){},
      step: function(result, input){return input},
      result: identity
    }

module.exports = transformer
function transformer(value){
  var xf
  if(value === void 0){
    xf = lastValue
  } else if(isTransformer(value)){
    xf = value[symbol]
    if(xf === void 0){
      xf = value
    }
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
transformer.symbol = symbol

function isTransformer(value){
  return (value[symbol] !== void 0) ||
    (isFunction(value.step) && isFunction(value.result))
}

// Pushes value on array, using optional constructor arg as default, or [] if not provided
// init will clone the default
// step will push input onto array and return result
// result is identity
function ArrayTransformer(defaultValue){
  this.defaultValue = defaultValue === void 0 ? [] : defaultValue
}
ArrayTransformer.prototype.init = function(){
  return slice.call(this.defaultValue)
}
ArrayTransformer.prototype.step = function (result, input){
  result.push(input)
  return result
}
ArrayTransformer.prototype.result = identity


// Appends value onto string, using optional constructor arg as default, or '' if not provided
// init will return the default
// step will append input onto string and return result
// result is identity
function StringTransformer(str){
  this.strDefault = str === void 0 ? '' : str
}
StringTransformer.prototype.init = function(){
  return this.strDefault
}
StringTransformer.prototype.step = function(result, input){
  return result + input
}
StringTransformer.prototype.result = identity

// Merges value into object, using optional constructor arg as default, or {} if undefined
// init will clone the default
// step will merge input into object and return result
// result is identity
function ObjectTransformer(obj){
  this.objDefault = obj === void 0 ? {} : objectMerge({}, obj)
}
ObjectTransformer.prototype.init = function(){
  return objectMerge({}, this.objDefault)
}
ObjectTransformer.prototype.step = objectMerge
ObjectTransformer.prototype.result = identity
