'use strict'
var merge = require('./util/objectMerge')
module.exports = merge(merge({},
  require('./core')),
  require('./common'))
