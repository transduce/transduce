'use strict'
var core = require('./_core')

module.exports = {
  compose: require('./compose'),
  transduce: core.transduce,
  reduce: core.reduce,
  into: require('./into'),
  defer: require('./defer'),
  delay: require('./delay'),
  tap: require('./tap'),
  asCallback: require('./asCallback'),
  asyncCallback: require('./asyncCallback')
}
