'use strict'
module.exports =
function transformStep(xfStep) {
  return function(xf){
    return new TransformStep(xfStep, xf)
  }
}
function TransformStep(xfStep, xf) {
  this.xf = xf
  this.xfStep = xfStep
  this.context = {}
}
TransformStep.prototype.init = function(){
  return this.xf.init()
}
TransformStep.prototype.step = function(result, input){
  return this.xfStep.call(this.context, this.xf, result, input)
}
TransformStep.prototype.result = function(result){
  return this.xf.result(result)
}
