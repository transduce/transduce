'use strict'
var _unique = require('./_internal/unique')

module.exports =
function unique(f) {
  return _unique(f, true)
}
