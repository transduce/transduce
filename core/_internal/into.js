'use strict'
var transformer = require('../transformer'),
    isFunction = require('../util').isFunction,
    tp = require('../protocols').transducer

module.exports = function(core){
  var reduce = core.reduce,
      transduce = core.transduce

  return function into(init, t, coll){
    var xf = transformer(init),
        len = arguments.length

    if(len === 1){
      return intoCurryXf(xf)
    }

    if(len === 2){
      if(isFunction(t)){
        return intoCurryXfT(xf, t)
      }
      coll = t
      return reduce(xf, init, coll)
    }
    return transduce(t, xf, init, coll)
  }

  function intoCurryXf(xf){
    return function intoXf(t, coll){
      if(arguments.length === 1){
        if(isFunction(t)){
          return intoCurryXfT(xf, t)
        }
        coll = t
        return reduce(xf, xf[tp.init](), coll)
      }
      return transduce(t, xf, xf[tp.init](), coll)
    }
  }

  function intoCurryXfT(xf, t){
    return function intoXfT(coll){
      return transduce(t, xf, xf[tp.init](), coll)
    }
  }
}
