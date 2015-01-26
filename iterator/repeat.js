'use strict'
var iterable = require('./iterable'),
    symbol = require('./symbol')

module.exports =
function repeat(elem, n){
  if(n === void 0){
    return iterable(function(){
      return elem
    })
  }
  return new Repeat(elem, n)
}

function Repeat(elem, n){
  this.elem = elem
  this.n = n
}
Repeat.prototype[symbol] = function(){
  var elem = this.elem, n = this.n,  idx = 1
  return {
    next: function(){
      if(idx++ > n){
        return {done: true}
      } else {
        return {done: false, value: elem}
      }
    }
  }
}
