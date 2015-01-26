"use strict"
var symbol = require('./symbol')

module.exports =
function count(start, step){
  return new Count(start, step)
}
function Count(start, step){
  if(start === void 0){
    start = 0
  }
  if(step === void 0){
    step = 1
  }
  this.start = start
  this.step = step
}
Count.prototype[symbol] = function(){
  var val = this.start, step = this.step
  return {
    next: function(){
      var prev = val
      val = val + step
      return {done: false, value: prev}
    }
  }
}
