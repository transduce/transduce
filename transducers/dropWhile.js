'use strict'
var transducer = require('../core/transducer')

module.exports =
function dropWhile(p){
  return transducer(function(step, value, input){
    if(!this.found){
      if(p(input)){
        return value
      }
      this.found = true
    }
    return step(value, input)
  })
}
