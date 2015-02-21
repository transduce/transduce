'use strict'
var isReduced = require('../core/isReduced'),
    _slice = Array.prototype.slice

// Adds one or more items to the beginning of the sequence, like Array.prototype.unshift.
module.exports =
function unshift(){
  var toUnshift = _slice.call(arguments)
  return function(xf){
    return new Unshift(toUnshift, xf)
  }
}
function Unshift(toUnshift, xf){
  this.xf = xf
  this.toUnshift = toUnshift
  this.idx = 0
}
Unshift.prototype.init = function(){
  return this.xf.init()
}
Unshift.prototype.result = function(result){
  return this.xf.result(result)
}
Unshift.prototype.step = function(result, input){
  var toUnshift = this.toUnshift
  if(toUnshift){
    var idx, len = toUnshift.length
    for(idx = 0; idx < len; idx++){
      result = this.xf.step(result, toUnshift[idx])
      if(isReduced(result)){
        return result
      }
    }
    this.toUnshift = null
  }
  return this.xf.step(result, input)
}
