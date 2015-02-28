'use strict'
var Prom = require('any-promise'),
    callback = require('./callback')

module.exports =
function promiseTransform(t){
  return function(item){
    return new Prom(function(resolve, reject){
      var cb = callback(t, null, function(err, result){
        if(err) reject(err)
        else resolve(result)
      })
      cb(null, item)
      cb()
    })
  }
}
