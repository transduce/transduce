'use strict'
var transducer = require('../core/transducer'),
    isReduced = require('../core/isReduced'),
    unreduced = require('../core/unreduced')

// Returns everything but the last entry. Passing **n** will return all the values
// excluding the last N.
// Note that no items will be sent and all items will be buffered until completion.
module.exports =
function initial(n) {
  n = (n === void 0) ? 1 : (n > 0) ? n : 0
  return transducer(
    function(step, value, input){
      if(this.buffer === void 0){
        this.n = n
        this.idx = 0
        this.buffer = []
      }
      this.buffer[this.idx++] = input
      return value
    },
    function(result, value){
      var idx = 0, count = this.idx - this.n, buffer = this.buffer
      for(idx = 0; idx < count; idx++){
        value = this.step(value, buffer[idx])
        if(isReduced(value)){
          value = unreduced(value)
          break
        }
      }
      return result(value)
    })
}
