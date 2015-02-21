'use strict'
var iterator = require('../core/iterator')

module.exports =
function toArray(iter){
  iter = iterator(iter)
  var next = iter.next(),
      arr = []
  while(!next.done){
    arr.push(next.value)
    next = iter.next()
  }
  return arr
}
