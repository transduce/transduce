'use strict'
var iterable = require('../core/iterable'),
    symbol = require('../core/protocols').iterator

module.exports =
function cycle(iter){
  return new Cycle(iter)
}

function Cycle(iter){
  this.iter = iter
}
Cycle.prototype[symbol] = function(){
  var iter = this.iter, it = iterable(iter)[symbol]()
  return {
    next: function(){
      var next = it.next()
      if(next.done){
        it = iterable(iter)[symbol]()
        next = it.next()
      }
      return next
    }
  }
}
