'use strict'

var isReduced = require('./isReduced')

module.exports =
function unreduced(value){
  if(isReduced(value)){
    value = value.value
  }
  return value
}
