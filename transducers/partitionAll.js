'use strict'
var transducer = require('../core/transducer')

module.exports =
function partitionAll(n) {
  return transducer(
    function(step, value, input){
      if(this.inputs === void 0){
        this.inputs = []
      }
      var ins = this.inputs
      ins.push(input)
      if(n === ins.length){
        this.inputs = []
        value = step(value, ins)
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
