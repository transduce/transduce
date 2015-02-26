'use strict'
var core = require('./_core')

module.exports = {
  compose: require('./compose'),
  transduce: core.transduce,
  reduce: core.reduce,
  toArray: core.toArray,
  defer: require('./defer'),
  delay: require('./delay')
}
