'use strict'
var _reduce = require('./_core').reduce,
    completing = require('../core/completing'),
    util = require('../core/util'),
    isFunction = util.isFunction

module.exports =
function reduce(xf, init, coll){
  if(isFunction(xf)){
    xf = completing(xf)
  }

  if (arguments.length === 2) {
    coll = init
    init = xf.init()
  }
  return _reduce(xf, init, coll)
}
