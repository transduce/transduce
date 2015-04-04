'use strict'
var transducer = require('../core/transducer'),
    isReduced = require('../core/isReduced')

module.exports =
function partitionBy(f) {
  return transducer(
    function(step, value, input){
      var ins = this.inputs,
          curr = f(input),
          prev = this.prev
      this.prev = curr
      if(ins === void 0){
        this.inputs = [input]
      } else if(prev === curr){
        ins.push(input)
      } else {
        this.inputs = []
        value = step(value, ins)
        if(!isReduced(value)){
          this.inputs.push(input)
        }
      }
      return value
    },
    function(result, value){
      var ins = this.inputs
      if(ins && ins.length){
        this.inputs = []
        value = this.step(value, ins)
      }
      return result(value)
    })
}
