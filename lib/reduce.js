"use strict";
var tp = require('transduce-protocol'),
    isReduced = tp.isReduced,
    transformer = tp.transformer,
    iterator = tp.iterator,
    deref = tp.deref,
    undef;
module.exports = reduce;

function reduce(xf, init, coll){
  var iter = tp.iterator(coll);
  xf = transformer(xf);
  if(tp.isArray(coll)){
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
      value = deref(value);
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
      value = deref(value);
      break;
    }
  }
  return xf.result(value);
}
