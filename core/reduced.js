'use strict'

var isReduced = require('./isReduced')

module.exports =
function reduced(value, force){
  if(force || !isReduced(value)){
    value = new Reduced(value)
  }
  return value
}

function Reduced(value){
  this.value = value
  this.__transducers_reduced__ = true
}
