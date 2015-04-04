'use strict'
var transducer = require('../core/transducer'),
    identity = require('../core/util').identity

// Return the maximum element (or element-based computation).
module.exports =
function max(f) {
  if(!f){
    f = identity
  }
  return transducer(
    function(step, value, input){
      if(this.lastComputed === void 0){
        this.computedResult = -Infinity
        this.lastComputed = -Infinity
      }
      var computed = f(input)
      if (computed > this.lastComputed ||
          computed === -Infinity && this.computedResult === -Infinity) {
        this.computedResult = input
        this.lastComputed = computed
      }
      return value
    },
    function(result, value){
      if(this.lastComputed === void 0){
        value = this.step(value, -Infinity)
      } else {
        value = this.step(value, this.computedResult)
      }
      return result(value)
    })
}
