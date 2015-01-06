'use strict'
var transformer = require('./transformer/transformer'),
    isReduced = require('./util/isReduced'),
    unreduced = require('./util/unreduced'),
    isArray = require('./util/isArray'),
    iterator = require('./iterator/iterator')

module.exports =
function reduce(xf, init, coll){
  xf = transformer(xf);
  if(isArray(coll)){
    return arrayReduce(xf, init, coll);
  }
  return iteratorReduce(xf, init, coll);
}

function arrayReduce(xf, init, arr){
  var value = init,
      i = 0,
      len = arr.length;
  for(; i < len; i++){
    value = xf.step(value, arr[i]);
    if(isReduced(value)){
      value = unreduced(value)
      break;
    }
  }
  return xf.result(value);
}

function iteratorReduce(xf, init, iter){
  var value = init, next;
  iter = iterator(iter);
  while(true){
    next = iter.next();
    if(next.done){
      break;
    }

    value = xf.step(value, next.value);
    if(isReduced(value)){
      value = unreduced(value)
      break;
    }
  }
  return xf.result(value);
}
