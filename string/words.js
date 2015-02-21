'use strict'
var compose = require('../core/compose'),
    isNumber = require('../core/util').isNumber,
    split = require('./split'),
    nonEmpty = require('./nonEmpty')

module.exports =
function words(delimiter, limit) {
  if(delimiter === void 0 || isNumber(delimiter)){
    limit  = delimiter
    delimiter = /\s+/
  }
  return compose(split(delimiter, limit), nonEmpty())
}
