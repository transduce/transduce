'use strict'
var resolve = require('./_internal/resolve'),
    promiseTransform = require('./promiseTransform')

module.exports =
function when(promiseOrValue, t){
  return resolve(promiseOrValue)
    .then(promiseTransform(t))
}
