'use strict'
var transduce = require('./transduce')

module.exports =
function into(to, t, from){
  return transduce(t, to, to, from)
}
