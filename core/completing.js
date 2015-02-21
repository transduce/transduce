'use strict'
var identity = require('./identity')

module.exports =
// Turns a step function into a transfomer with init, step, result
// If init not provided, calls `step()`.  If result not provided, calls `idenity`
function completing(rf, result){
  return new Completing(rf, result)
}
function Completing(rf, result){
  this.step = rf
  this.result = result || identity
}
Completing.prototype.init = function(){
  return this.step()
}
