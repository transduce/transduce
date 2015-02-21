'use strict'
var compose = require('../core/compose'),
    map = require('./map'),
    cat = require('./cat')
module.exports =
function mapcat(callback) {
  return compose(map(callback), cat)
}
