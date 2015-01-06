'use strict'
var some = require('./some')

// Determine if contains a given value (using `===`).
// Aliased as `include`.
// Early termination when item found.
module.exports =
function contains(target) {
  return some(function(x){return x === target })
}
