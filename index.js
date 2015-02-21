'use strict'
var util = require('./util'),
    merge = util.objectMerge
module.exports = merge(merge({
    iterator: require('./iterator'),
    transformer: require('./transformer'),
    array: require('./array'),
    math: require('./math'),
    push: require('./push'),
    string: require('./string'),
    unique: require('./unique'),
    util: util
  },
  require('./core')),
  require('./common'))
