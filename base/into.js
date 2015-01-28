'use strict'
var transduce = require('./transduce'),
    transformer = require('../transformer/transformer'),
    reduce = require('./reduce')

module.exports =
function into(init, t, coll){
  var xf = transformer(init)
  if (arguments.length === 2) {
    coll = t
    return reduce(xf, init, coll)
  }
  return transduce(t, xf, init, coll)
}
