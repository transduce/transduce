'use strict'
var isReduced = require('../util/isReduced'),
    unreduced = require('../util/unreduced'),
    _slice = Array.prototype.slice

// Adds one or more items to the end of the sequence, like Array.prototype.push.
module.exports =
function push(){
  var toPush = _slice.call(arguments)
  return function(xf){
    return new Push(toPush, xf)
  }
}
function Push(toPush, xf) {
  this.xf = xf
  this.toPush = toPush
}
Push.prototype.init = function(){
  return this.xf.init()
}
Push.prototype.result = function(result){
  var idx, toPush = this.toPush, len = toPush.length
  for(idx = 0; idx < len; idx++){
    result = this.xf.step(result, toPush[idx])
    if(isReduced(result)){
      result = unreduced(result)
      break
    }
  }
  return this.xf.result(result)
}
Push.prototype.step = function(result, input){
  return this.xf.step(result, input)
}
