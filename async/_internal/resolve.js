'use strict'
var Prom = require('any-promise')

module.exports =
function resolve(val){
  return new Prom(function(resolve){
    resolve(val)
  })
}
