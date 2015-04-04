'use strict'

var isReduced = require('./isReduced'),
    tp = require('./protocols').transducer

module.exports =
function unreduced(value){
  if(isReduced(value)){
    value = value[tp.value]
  }
  return value
}
