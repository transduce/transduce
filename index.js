'use strict'
var core = require('./core'),
    merge = core.util.objectMerge
module.exports = merge(merge({
    array: require('./array'),
    string: require('./string'),
    math: require('./math'),
    async: require('./async')
  }, core), require('./transducers'))
