'use strict'
var transducer = require('../core/transducer'),
    reduced = require('../core/reduced')

// Determine if at least one element in the object matches a truth test.
// Aliased as `any`.
// Early termination if item matches predicate.
module.exports =
function some(predicate) {
  return transducer(
    function(step, value, input){
      if(predicate(input)){
        this.found = true
        return reduced(step(value, true))
      }
      return value
    },
    function(result, value){
      if(!this.found){
        value = this.step(value, false)
      }
      return result(value)
    })
}
