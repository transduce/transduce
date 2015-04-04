'use strict'
var transducer = require('../core/transducer'),
    isReduced = require('../core/isReduced'),
    unreduced = require('../core/unreduced')

// Get the last element. Passing **n** will return the last N  values.
// Note that no items will be sent until completion.
module.exports =
function last(n) {
  if(n === void 0){
    n = 1
  } else {
    n = (n > 0) ? n : 0
  }
  return transducer(
    function(step, value, input){
      if(this.buffer === void 0){
        this.n = n
        this.idx = 0
        this.buffer = []
      }
      this.buffer[this.idx++ % this.n] = input
      return value
    },
    function(result, value){
      var n = this.n, count = n, buffer=this.buffer, idx=this.idx
      if(idx < count){
        count = idx
        idx = 0
      }
      while(count--){
        value = this.step(value, buffer[idx++ % n])
        if(isReduced(value)){
          value = unreduced(value)
          break
        }
      }
      return result(value)
    })
}
