'use strict'
var transformer = require('../transformer/transformer'),
    reduce = require('./reduce')

module.exports =
function transduce(xf, f, init, coll) {
  xf = xf(transformer(f))
  if (arguments.length === 3) {
    coll = init;
    init = xf.init();
  }
  return reduce(xf, init, coll)
}
