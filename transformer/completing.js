'use strict'
var identity = require('../util/identity')

module.exports =
// Turns a step function into a transfomer with init, step, result
// If init not provided, calls `step()`.  If result not provided, calls `idenity`
function functionTransformer(rf, result){
  return new FunctionTransformer(rf, result)
}
function FunctionTransformer(rf, result){
  this.step = rf
  this.result = result || identity
}
FunctionTransformer.prototype.init = function(){
  return this.step()
}
