"use strict"
var tr = require('../'),
    un = tr.unique,
    compose = tr.compose,
    test = require('tape')

test('dedupe', function(t) {
  var list = [1, 1, 1, 2, 2, 3]
  t.deepEqual(tr.into([], un.dedupe(), list), [1, 2, 3])
  t.end()
})

test('unique', function(t) {

  var list = [1, 2, 1, 3, 1, 4]
  t.deepEqual(tr.into([], un.unique(), list), [1, 2, 3, 4], 'can find the unique values of an unsorted array')

  list = [{name: 'moe'}, {name: 'curly'}, {name: 'larry'}, {name: 'curly'}]
  var iterator = function(value) { return value.name }
  t.deepEqual(tr.into([], compose(un.unique(iterator), tr.map(iterator)), list), ['moe', 'curly', 'larry'], 'can find the unique values of an array using a custom iterator')

  iterator = function(value) { return value + 1 }
  list = [1, 2, 2, 3, 4, 4]
  t.deepEqual(tr.into([], un.unique(iterator), list), [1, 2, 3, 4], 'iterator works with sorted array')

  var a = {}, b = {}, c = {}
  t.deepEqual(tr.into([], un.unique(), [a, b, a, b, c]), [a, b, c], 'works on values that can be tested for equivalency but not ordered')

  t.end()
})
