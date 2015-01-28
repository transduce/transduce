'use strict'
var slice = Array.prototype.slice,
    identity = require('../util/identity'),
    arrayPush = require('../util/arrayPush')

module.exports =
// Pushes value on array, using optional constructor arg as default, or [] if not provided
// init will clone the default
// step will push input onto array and return result
// result is identity
function arrayTransformer(defaultValue){
  return new ArrayTransformer(defaultValue)
}
function ArrayTransformer(defaultValue){
  this.defaultValue = defaultValue === void 0 ? [] : defaultValue
}
ArrayTransformer.prototype.init = function(){
  return slice.call(this.defaultValue)
}
ArrayTransformer.prototype.step = arrayPush
ArrayTransformer.prototype.result = identity
