'use strict'
var reduced = require('../core/reduced'),
    isReduced = require('../core/isReduced'),
    reduce = require('../core/reduce'),
    transducer = require('../core/transducer'),
    transducerReduce = transducer(reduce),
    preserveReduced = transducer(function(step, value, input){
      value = step(value, input)
      return isReduced(value) ? reduced(value, true) : value
    })

module.exports =
function cat(xf){
  return transducerReduce(preserveReduced(xf))
}
