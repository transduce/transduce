'use strict'
var symbol = require('./symbol'),
    iterable = require('./iterable'),
    isFunction = require('../util/isFunction')

module.exports =
function iterator(value){
  var it = iterable(value)
  if(it !== void 0){
    it = it[symbol]()
  } else if(isFunction(value.next)){
    // handle non-well-formed iterators that only have a next method
    it = value
  }
  return it
}
