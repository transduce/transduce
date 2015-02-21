'use strict'
var completing = require('../transformer/completing'),
    isReduced = require('./isReduced'),
    unreduced = require('./unreduced'),
    isArray = require('../util/isArray'),
    isFunction = require('../util/isFunction'),
    iterator = require('../iterator/iterator')

module.exports =
function reduce(xf, init, coll){
  if(isFunction(xf)){
    xf = completing(xf)
  }

  if (arguments.length === 2) {
    coll = init
    init = xf.init()
  }

  if(isArray(coll)){
    return arrayReduce(xf, init, coll)
  }

  if(isFunction(coll.reduce)){
    return methodReduce(xf, init, coll)
  }

  return iteratorReduce(xf, init, coll)
}

function arrayReduce(xf, init, arr){
  var value = init,
      i = 0,
      len = arr.length
  for(; i < len; i++){
    value = xf.step(value, arr[i])
    if(isReduced(value)){
      value = unreduced(value)
      break
    }
  }
  return xf.result(value)
}

function methodReduce(xf, init, coll){
  var result = coll.reduce(function(result, value){
    return xf.step(result, value)
  }, init)
  return xf.result(result)
}

function iteratorReduce(xf, init, iter){
  var value = init, next
  iter = iterator(iter)
  while(true){
    next = iter.next()
    if(next.done){
      break
    }

    value = xf.step(value, next.value)
    if(isReduced(value)){
      value = unreduced(value)
      break
    }
  }
  return xf.result(value)
}
