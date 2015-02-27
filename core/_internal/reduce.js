'use strict'
var completing = require('../completing'),
    util = require('../util'),
    isFunction = util.isFunction

module.exports = function(core){
  return function reduce(xf, init, coll){
    if(isFunction(xf)){
      xf = completing(xf)
    }

    if (arguments.length === 2) {
      coll = init
      init = xf.init()
    }
    return core.reduce(xf, init, coll)
  }
}
