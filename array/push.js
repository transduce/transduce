'use strict'
var transducer = require('../core/transducer'),
    isReduced = require('../core/isReduced'),
    unreduced = require('../core/unreduced'),
    _slice = Array.prototype.slice

// Adds one or more items to the end of the sequence, like Array.prototype.push.
module.exports =
function push(){
  var toPush = _slice.call(arguments)
  return transducer(
    null,
    function(result, value){
      var idx, len = toPush.length
      for(idx = 0; idx < len; idx++){
        value = this.step(value, toPush[idx])
        if(isReduced(value)){
          value = unreduced(value)
          break
        }
      }
      return result(value)
    })
}
