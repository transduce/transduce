'use strict'
var transducer = require('../core/transducer'), 
    isReduced = require('../core/isReduced'),
    _slice = Array.prototype.slice

// Adds one or more items to the beginning of the sequence, like Array.prototype.unshift.
module.exports =
function unshift(){
  var toUnshift = _slice.call(arguments)
  return transducer(function(step, value, input){
    if(!this.done){
      var idx, len = toUnshift.length
      this.done = true
      for(idx = 0; idx < len; idx++){
        value = step(value, toUnshift[idx])
        if(isReduced(value)){
          return value
        }
      }
    }
    return step(value, input)
  })
}
