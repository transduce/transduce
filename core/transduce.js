'use strict'
var reduce = require('./_core').reduce,
    completing = require('./completing'),
    util = require('./util'),
    isFunction = util.isFunction

module.exports =
function transduce(t, xf, init, coll) {
  if(isFunction(xf)){
    xf = completing(xf)
  }
  xf = t(xf)
  if (arguments.length === 3) {
    coll = init
    init = xf.init()
  }
  return reduce(xf, init, coll)
}
