'use strict'
var transducer = require('../core/transducer'),
    reduced = require('../core/reduced')

module.exports =
function take(n){
  return transducer(function(step, value, item){
    if(this.n === void 0){
      this.n = n
    }
    if(this.n-- > 0){
      value = step(value, item)
    }
    if(this.n <= 0){
      value = reduced(value)
    }
    return value
  })
}
