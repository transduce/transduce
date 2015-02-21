'use strict'
var core = require('./_core')
module.exports = {
  reduce: core.reduce,
  transduce: core.transduce,
  eduction: require('./eduction'),
  into: require('./into'),
  sequence: require('./sequence'),
  compose: require('./compose'),
  isReduced: require('./isReduced'),
  reduced: require('./reduced'),
  unreduced: require('./unreduced'),
  completing: require('./completing'),
  transformer: require('./transformer'),
  iterator: require('./iterator'),
  protocols: require('./protocols'),
  util: require('./util')
}
