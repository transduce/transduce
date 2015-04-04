'use strict'
var transducer = require('../core/transducer'),
    reduced = require('../core/reduced')

module.exports =
function every(predicate) {
  return transducer(
    function(step, value, input){
      if(!predicate(input)){
        this.found = true
        return reduced(step(value, false))
      }
      return value
    },
    function(result, value){
      if(!this.found){
        value = this.step(value, true)
      }
      return result(value)
    })
}
