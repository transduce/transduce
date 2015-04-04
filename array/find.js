'use strict'
var transducer = require('../core/transducer'),
    reduced = require('../core/reduced')

// Return the first value which passes a truth test. Aliased as `detect`.
module.exports =
function find(predicate) {
  return transducer(function(step, value, input){
    if(predicate(input)){
      value = reduced(step(value, input))
    }
    return value
  })
}
