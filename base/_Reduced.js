'use strict'

module.exports =
function Reduced(value){
  this.value = value
  this.__transducers_reduced__ = true
}
