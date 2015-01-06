'use strict'

module.exports =
function isReduced(value){
  return !!(value && value.__transducers_reduced__)
}
