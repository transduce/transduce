'use strict'

var test = require('tape');
var tr = require('../');

var stringReduce = {
  init: function() {
    return '';
  },
  step: function(result, val) {
    return result + val
  },
  result: function(result) {
    return result;
  }
}

test('transduce', function(t) {
  t.equal(tr.transduce(tr.unique.dedupe(), stringReduce, '', ['a', 'b', 'b', 'c']), 'abc');
  t.equal(tr.transduce(tr.unique.dedupe(), stringReduce, ['a', 'b', 'b', 'c']), 'abc');
  t.end()
})

test('reduce', function(t) {
  var reducer  = tr.unique.dedupe()(stringReduce);

  t.equal(tr.reduce(reducer, '', ['a', 'b', 'b', 'c']), 'abc');
  t.equal(tr.reduce(reducer, ['a', 'b', 'b', 'c']), 'abc');
  t.end()
})