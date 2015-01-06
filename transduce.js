'use strict'
var transformer = require('./transformer/transformer'),
    reduce = require('./reduce')

module.exports =
function transduce(xf, f, init, coll){
  f = transformer(f)
  return reduce(xf(f), init, coll)
}
