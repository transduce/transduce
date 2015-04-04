'use strict'
var transducer = require('../core/transducer'),
    reduced = require('../core/reduced')

module.exports =
function takeWhile(p){
  return transducer(function(step, value, input){
    return p(input) ? step(value, input) : reduced(value)
  })
}
