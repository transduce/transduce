"use strict";
var transduce = require('./transduce'),
    reduce = require('./reduce'),
    util = require('transduce-util'),
    push = util.arrayPush,
    undef;

module.exports = toArray;
function toArray(xf, coll){
  var init = [];
  if(coll === undef){
    return reduce(push, init, xf);
  }
  return transduce(xf, push, init, coll);
}
