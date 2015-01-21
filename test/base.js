'use strict';

var test = require('tape');
var tr = require('../');

test('transduce', function(t) {

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

  t.equal(tr.transduce(tr.unique.dedupe(), stringReduce, '', ['a', 'b', 'b', 'c']), 'abc');
  t.equal(tr.transduce(tr.unique.dedupe(), stringReduce, ['a', 'b', 'b', 'c']), 'abc');
  t.end()
})