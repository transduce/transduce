'use strict'
var symbol = require('./symbol')

module.exports =
function isIterable(value){
  return (value[symbol] !== void 0)
}
