'use strict'
var isString = require('../core/util').isString

module.exports =
function nonEmpty(){
  return function(xf){
    return new NonEmpty(xf)
  }
}
function NonEmpty(xf){
  this.xf = xf
}
NonEmpty.prototype.init = function(){return this.xf.init()}
NonEmpty.prototype.step = function(result, input){
  if(isString(input) && input.trim().length){
    result = this.xf.step(result, input)
  }
  return result
}
NonEmpty.prototype.result = function(result){
  return this.xf.result(result)
}
