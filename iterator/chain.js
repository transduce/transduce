'use strict'
var iterator = require('./iterator'),
    symbol = require('./symbol'),
    slice = [].slice,
    EMPTY = { next: function(){ return {done:true} } }

module.exports =
function chain(){
  return new Chain(slice.call(arguments))
}

function Chain(iters){
  this.iters = iters
}
Chain.prototype[symbol] = function(){
  var iters = slice.call(this.iters),
      it = shift()

  if(it === void 0) return EMPTY

  return {
    next: function(){
      var next = it.next()
      if(!next.done){
        return next
      }

      it = shift()
      if(it === void 0){
        return {done: true}
      }
      return it.next()
    }
  }

  function shift(){
    var itb = iters.shift()
    return itb && iterator(itb)
  }
}
