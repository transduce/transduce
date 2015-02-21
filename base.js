'use strict'
var core = require('./core'),
    merge = core.util.objectMerge
module.exports = merge(merge({}, core), require('./common'))
