'use strict'

var identity = require('../core/util').identity

// Return the maximum element (or element-based computation).
module.exports =
function max(f) {
  if(!f){
    f = identity
  }
  return function(xf){
    return new Max(f, xf)
  }
}
function Max(f, xf) {
  this.xf = xf
  this.f = f
  this.computedResult = -Infinity
  this.lastComputed = -Infinity
}
Max.prototype.init = function(){
  return this.xf.init()
}
Max.prototype.result = function(result){
  result = this.xf.step(result, this.computedResult)
  return this.xf.result(result)
}
Max.prototype.step = function(result, input) {
  var computed = this.f(input)
  if (computed > this.lastComputed ||
      computed === -Infinity && this.computedResult === -Infinity) {
    this.computedResult = input
    this.lastComputed = computed
  }
  return result
}
