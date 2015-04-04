'use strict'
var transducer = require('../core/transducer')

// Executes f with f(input, idx, result) for forEach item
// passed through transducer without changing the result.
module.exports =
function forEach(f) {
  return transducer(function(step, value, input){
    if(this.idx === void 0){
      this.idx = 0
    }
    f(input, this.idx++, value)
    return step(value, input)
  })
}
