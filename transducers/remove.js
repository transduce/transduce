'use strict'
var filter = require('./filter')

module.exports = remove
function remove(p){
  return filter(function(x){
    return !p(x)
  })
}

