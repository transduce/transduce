'use strict'
var transformer = require('../transformer/transformer'),
    reduce = require('./reduce')

module.exports =
function transduce(t, xf, init, coll) {
  xf = t(transformer(xf))
  if (arguments.length === 3) {
    coll = init;
    init = xf.init();
  }
  return reduce(xf, init, coll)
}
