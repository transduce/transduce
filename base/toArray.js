'use strict'
var into = require('./into')

module.exports =
function toArray(t, coll){
  return into([], t, coll)
}
