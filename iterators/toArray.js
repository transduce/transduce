'use strict'
var iterable = require('../core/iterable'),
    symbol = require('../core/protocols').iterator

module.exports =
function toArray(iter){
  iter = iterable(iter)[symbol]()
  var next = iter.next(),
      arr = []
  while(!next.done){
    arr.push(next.value)
    next = iter.next()
  }
  return arr
}
