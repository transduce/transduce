'use strict'
var tr = require('../'),
    math = tr.math,
    test = require('tape')

test('max', function(t) {
  t.plan(6)

  t.deepEqual(tr.into([], math.max(), [1, 2, 3]), [3], 'can perform a regular Math.max')

  var neg = tr.into([], math.max(function(num){ return -num }), [1, 2, 3])
  t.deepEqual(neg, [1], 'can perform a computation-based max')

  t.deepEqual(tr.into([], math.max(), []), [-Infinity], 'Maximum value of an empty array')

  t.deepEqual(tr.into([], math.max(), [1, 2, 3, 'test']), [3], 'Finds correct max in array starting with num and containing a NaN')
  t.deepEqual(tr.into([], math.max(), ['test', 1, 2, 3]), [3], 'Finds correct max in array starting with NaN')

  var a = {x: -Infinity}
  var b = {x: -Infinity}
  var iterator = function(o){ return o.x }
  t.deepEqual(tr.into([], math.max(iterator), [a, b]), [a], 'Respects iterator return value of -Infinity')

})

test('min', function(t) {
  t.plan(7)

  t.deepEqual(tr.into([], math.min(), [1, 2, 3]), [1], 'can perform a regular Math.min')

  var neg = tr.into([], math.min(function(num){ return -num }), [1, 2, 3])
  t.deepEqual(neg, [3], 'can perform a computation-based min')

  t.deepEqual(tr.into([], math.min(), []), [Infinity], 'Minimum value of an empty array')

  var now = new Date(9999999999)
  var then = new Date(0)
  t.deepEqual(tr.into([], math.min(), [now, then]), [then])

  t.deepEqual(tr.into([], math.min(), [1, 2, 3, 'test']), [1], 'Finds correct min in array starting with num and containing a NaN')
  t.deepEqual(tr.into([], math.min(), ['test', 1, 2, 3]), [1], 'Finds correct min in array starting with NaN')

  var a = {x: Infinity}
  var b = {x: Infinity}
  var iterator = function(o){ return o.x }
  t.deepEqual(tr.into([], math.min(iterator), [a, b]), [a], 'Respects iterator return value of Infinity')
})
