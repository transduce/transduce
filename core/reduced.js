'use strict'

var isReduced = require('./isReduced'),
    tp = require('./protocols').transducer

module.exports =
function reduced(value, force){
  if(force || !isReduced(value)){
    value = new Reduced(value)
  }
  return value
}

function Reduced(value){
  this[tp.value] = value
  this[tp.reduced] = true
}
