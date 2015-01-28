'use strict'
var identity = require('../util/identity'),
    objectMerge = require('../util/objectMerge')

module.exports =
// Merges value into object, using optional constructor arg as default, or {} if undefined
// init will clone the default
// step will merge input into object and return result
// result is identity
function objectTranformer(obj){
  return new ObjectTransformer(obj)
}
function ObjectTransformer(obj){
  this.objDefault = obj === void 0 ? {} : objectMerge({}, obj)
}
ObjectTransformer.prototype.init = function(){
  return objectMerge({}, this.objDefault)
}
ObjectTransformer.prototype.step = objectMerge
ObjectTransformer.prototype.result = identity
