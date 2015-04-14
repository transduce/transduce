var test = require('tape'),
  tr = require('../')
  tp = tr.protocols.iterator;

function Iterator() {}
Iterator.prototype[tp] = function() {
  return {next: function() { return {done: true} }}
}

test('isIterable', function(t) {
  t.plan(4)  
  t.equal(tr.isIterable(''), true)
  t.equal(tr.isIterable([]), true)
  t.equal(tr.isIterable(new Iterator()), true)
  t.equal(tr.isIterable(1), false)
})

test('isIterator', function(t) {
  t.plan(2)
  t.equal(tr.isIterator(new Iterator()[tp]()), true)
  t.equal(tr.isIterator(undefined), false)
})
