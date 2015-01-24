'use strict'
var transduce = require('./transduce'),
    reduce = require('./reduce')

module.exports =
function into(init, t, coll){
  if (arguments.length === 2) {
    coll = t
    return reduce(init, init, coll)
  }
  return transduce(t, init, init, coll)
}
