'use strict'
var isIterable = require('./isIterable'),
    isFunction = require('../core/util').isFunction

module.exports =
function isIterator(value){
  return isIterable(value) ||
    isFunction(value.next)
}
