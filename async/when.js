'use strict'
var Prom = require('any-promise'),
    promiseTransform = require('./promiseTransform')

module.exports =
function when(promiseOrValue, t){
  return new Prom(function(resolve){
    resolve(promiseOrValue)
  }).then(promiseTransform(t))
}
