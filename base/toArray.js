'use strict'
var transduce = require('./transduce'),
    reduce = require('./reduce'),
    push = require('../util/arrayPush')

module.exports =
function toArray(t, coll){
  var init = []
  if(coll === void 0){
    return reduce(push, init, t)
  }
  return transduce(t, push, init, coll)
}
