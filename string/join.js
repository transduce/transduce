'use strict'
var transducer = require('../core/transducer')

module.exports =
function join(separator){
  return transducer(
    function(step, value, input){
      if(this.buffer === void 0){
        this.buffer = []
      }
      this.buffer.push(input)
      return value
    },
    function(result, value){
      value = this.step(value, this.buffer.join(separator))
      return result(value)
    })
}
