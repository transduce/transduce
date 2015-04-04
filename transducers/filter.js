'use strict'
var transducer = require('../core/transducer')

module.exports =
function filter(predicate) {
  return transducer(function(step, value, input) {
    return predicate(input) ? step(value, input) : value
  })
}
