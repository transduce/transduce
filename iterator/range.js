'use strict'
var symbol = require('./symbol')

module.exports =
function range(start, stop, step){
  return new Range(start, stop, step)
}
function Range(start, stop, step){
  if(step === void 0){
    step = 1
  }
  if(stop === void 0){
    stop = start
    start = 0
  }
  this.start = start
  this.stop = stop
  this.step = step
}
Range.prototype[symbol] = function(){
  var start = this.start,
      stop = this.stop,
      step = this.step,
      val = start
  return {
    next: function(){
      var prev = val
      val = val + step
      if(step > 0 && prev >= stop || step < 0 && prev <= stop){
        return {done: true}
      } else {
        return {done: false, value: prev}
      }
    }
  }
}
