'use strict'
var transducer = require('../core/transducer')

module.exports =
function tap(interceptor) {
  return transducer(function(step, value, input){
    interceptor(value, input)
    return step(value, input)
  })
}
