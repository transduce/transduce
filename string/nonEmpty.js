'use strict'
var transducer = require('../core/transducer'),
    isString = require('../core/util').isString

module.exports =
function nonEmpty(){
  return transducer(function(step, value, input){
    if(isString(input) && input.trim().length){
      value = step(value, input)
    }
    return value
  })
}
