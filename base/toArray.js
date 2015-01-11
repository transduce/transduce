'use strict'
var transduce = require('./transduce'),
    reduce = require('./reduce'),
    push = require('../util/arrayPush')

module.exports =
function toArray(xf, coll){
  var init = []
  if(coll === void 0){
    return reduce(push, init, xf)
  }
  return transduce(xf, push, init, coll)
}
