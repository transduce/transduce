'use strict'
var symbol = require('./symbol'),
    isFunction = require('../util/isFunction')

module.exports =
function isTransformer(value){
  return (value[symbol] !== void 0) ||
    (isFunction(value.step) && isFunction(value.result))
}
