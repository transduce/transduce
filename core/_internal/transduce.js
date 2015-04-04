'use strict'
var completing = require('../completing'),
    util = require('../util'),
    isFunction = util.isFunction,
    tp = require('../protocols').transducer

module.exports = function(core){
  return function transduce(t, xf, init, coll) {
    if(isFunction(xf)){
      xf = completing(xf)
    }
    xf = t(xf)
    if (arguments.length === 3) {
      coll = init
      init = xf[tp.init]()
    }
    return core.reduce(xf, init, coll)
  }
}
