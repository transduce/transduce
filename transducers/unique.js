'use strict'
var transducer = require('../core/transducer'),
    identity = require('../core/util').identity

module.exports =
function unique(f) {
  f = f || identity
  return transducer(function(step, value, input){
    if(this.seen === void 0){
      this.seen = []
    }
    var seen = this.seen,
        computed = f(input)
    if (seen.indexOf(computed) < 0) {
      seen.push(computed)
      value = step(value, input)
    }
    return value
  })
}
