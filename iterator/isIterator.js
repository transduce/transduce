'use strict'
var isIterable = require('./isIterable'),
    isFunction = require('../util/isFunction')

module.exports =
function isIterator(value){
  return isIterable(value) ||
    isFunction(value.next)
}
