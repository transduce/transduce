'use strict'
var split = require('./split')

module.exports =
function lines(limit){
  return split('\n', limit)
}
