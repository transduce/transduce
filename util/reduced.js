'use strict'

var isReduced = require('./isReduced'),
    Reduced = require('./_Reduced')

module.exports =
function reduced(value, force){
  if(force || !isReduced(value)){
    value = new Reduced(value)
  }
  return value
}
