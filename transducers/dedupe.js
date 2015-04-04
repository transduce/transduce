'use strict'
var transducer = require('../core/transducer')

module.exports =
function dedupe(){
  return transducer(function(step, value, input){
    if (!this.sawFirst || this.last !== input){
      value = step(value, input)
    }
    this.last = input
    this.sawFirst = true
    return value
  })
}
