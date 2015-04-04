'use strict'
var transducer = require('../core/transducer')

module.exports =
function map(callback) {
  return transducer(function(step, value, input) {
    return step(value, callback(input))
  })
}
