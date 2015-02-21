'use strict'
var completing = require('./completing'),
    reduce = require('./reduce'),
    isFunction = require('./util').isFunction

module.exports =
function transduce(t, xf, init, coll) {
  if(isFunction(xf)){
    xf = completing(xf)
  }

  xf = t(xf)
  if (arguments.length === 3) {
    coll = init;
    init = xf.init();
  }
  return reduce(xf, init, coll)
}
