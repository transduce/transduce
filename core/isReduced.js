'use strict'

var tp = require('./protocols').transducer

module.exports =
function isReduced(value){
  return !!(value && value[tp.reduced])
}
