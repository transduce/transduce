'use strict'
module.exports = function(core){

var transduce = core._transduce,
    reduce = core._reduce,
    transformer = require('./transformer'),
    isFunction = require('./util').isFunction

function into(init, t, coll){
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
      return reduce(xf, xf.init(), coll)
    }
    return transduce(t, xf, xf.init(), coll)
  }
}
function intoCurryXfT(xf, t){
  return function intoXfT(coll){
    return transduce(t, xf, xf.init(), coll)
  }
}

return into
}
