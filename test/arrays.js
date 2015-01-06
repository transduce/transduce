"use strict"
var tr = require('../'),
    a = tr,
    comp = tr.compose,
    test = require('tape')

function identity(v){
  return v
}

test('push unshift', function(t) {
  t.plan(6)
  t.deepEqual(tr.into([], a.push(4,5,6), [1,2,3]), [1,2,3,4,5,6])
  t.deepEqual(tr.into([], comp(a.push(4), a.push(5,6)), [1,2,3]), [1,2,3,4,5,6])

  t.deepEqual(tr.into([], a.unshift(4, 5, 6), [1,2,3]), [4,5,6,1,2,3])
  t.deepEqual(tr.into([], comp(a.unshift(4), a.unshift(5, 6)), [1,2,3]), [5,6,4,1,2,3])

  t.deepEqual(tr.into([], comp(a.push(4), a.unshift(5, 6)), [1,2,3]), [5,6,1,2,3,4])
  t.deepEqual(tr.into([], comp(a.unshift(4), a.push(5, 6)), [1,2,3]), [4,1,2,3,5,6])
})

test('forEach', function(t){
  var trans, result
  t.plan(4)
  trans = a.forEach(function(num, i){
    t.equal(num, i+1, 'index passed with item')
  })
  result = tr.into([], trans, [1, 2, 3])
  t.deepEqual(result, [1, 2, 3], 'result passed through')
})

test('find', function(t) {
  t.plan(3)
  var array = [1, 2, 3, 4]
  t.strictEqual(tr.into([], a.find(function(n) { return n > 2 }), array)[0], 3, 'should return first found `value`')
  t.strictEqual(tr.into([], a.find(function() { return false }), array)[0], void 0, 'should return `undefined` if `value` is not found')

  var result = tr.into([], a.find(function(num){ return num * 2 === 4 }), [1,2,3])
  t.deepEqual(result, [2], 'found the first "2" and broke the loop')
})

test('every', function(t) {
  t.plan(7)

  t.deepEqual(tr.into([], a.every(identity), []), [true], 'the empty set')
  t.deepEqual(tr.into([], a.every(identity), [true, true, true]), [true], 'every true values')
  t.deepEqual(tr.into([], a.every(identity), [true, false, true]), [false], 'one false value')
  t.deepEqual(tr.into([], a.every(function(num){ return num % 2 === 0 }), [0, 10, 28]), [true], 'even numbers')
  t.deepEqual(tr.into([], a.every(function(num){ return num % 2 === 0 }), [0, 11, 28]), [false], 'an odd number')
  t.deepEqual(tr.into([], a.every(identity), [1]), [true], 'cast to boolean - true')
  t.deepEqual(tr.into([], a.every(identity), [0]), [false], 'cast to boolean - false')
})

test('some', function(t) {
  t.plan(9)

  t.deepEqual(tr.into([], a.some(identity), []), [false], 'the empty set')
  t.deepEqual(tr.into([], a.some(identity), [false, false, false]), [false], 'all false values')
  t.deepEqual(tr.into([], a.some(identity), [false, false, true]), [true], 'one true value')
  t.deepEqual(tr.into([], a.some(identity), [null, 0, undefined, 'yes', false]), [true], 'a string')
  t.deepEqual(tr.into([], a.some(identity), [null, 0, '', undefined, false]), [false], 'falsy values')
  t.deepEqual(tr.into([], a.some(function(num){ return num % 2 === 0 }), [1, 11, 29]), [false], 'all odd numbers')
  t.deepEqual(tr.into([], a.some(function(num){ return num % 2 === 0 }), [1, 10, 29]), [true], 'one even numbers')
  t.deepEqual(tr.into([], a.some(identity), [1]), [true], 'cast to boolean - true')
  t.deepEqual(tr.into([], a.some(identity), [0]), [false], 'cast to boolean - false')
})

test('contains', function(t) {
  t.plan(2)
  t.deepEqual(tr.into([], a.contains(2),  [1, 2, 3]), [true], 'two is in the array')
  t.deepEqual(tr.into([], a.contains(2),  [1, 9, 3]), [false], 'two is not in the array')
})

test('initial', function(t) {
  t.plan(3)

  t.deepEqual(tr.into([], a.initial(), [1, 2, 3, 4, 5]), [1, 2, 3, 4], 'working initial()')
  t.deepEqual(tr.into([], a.initial(2), [1, 2, 3, 4]), [1, 2], 'initial can take an index')
  t.deepEqual(tr.into([], a.initial(6), [1, 2, 3, 4]), [], 'initial can take a large index')
})

test('last', function(t) {
  t.plan(4)

  t.deepEqual(tr.into([], a.last(), [1, 2, 3]), [3], 'can pull out the last element of an array')
  t.deepEqual(tr.into([], a.last(0), [1, 2, 3]), [], 'can pass an index to last')
  t.deepEqual(tr.into([], a.last(2), [1, 2, 3]), [2, 3], 'can pass an index to last')
  t.deepEqual(tr.into([], a.last(5), [1, 2, 3]), [1, 2, 3], 'can pass an index to last')
})

test('slice', function(t) {
  t.deepEqual(tr.into([], a.slice(0, 5), [1, 2, 3, 4, 5]), [1, 2, 3, 4, 5], 'working slice(0,5)')
  t.deepEqual(tr.into([], a.slice(5), [1, 2, 3, 4, 5]), [], 'working slice(5)')
  t.deepEqual(tr.into([], a.slice(0, 4), [1, 2, 3, 4, 5]), [1, 2, 3, 4], 'working slice(0,4)')
  t.deepEqual(tr.into([], a.slice(4), [1, 2, 3, 4, 5]), [5], 'working slice(4)')

  t.deepEqual(tr.into([], a.slice(1, 5), [1, 2, 3, 4, 5]), [2, 3, 4, 5], 'working slice(1,5)')
  t.deepEqual(tr.into([], a.slice(1, 4), [1, 2, 3, 4, 5]), [2, 3, 4], 'working slice(1,4)')

  t.deepEqual(tr.into([], a.slice(0, -1), [1, 2, 3, 4, 5]), [1, 2, 3, 4], 'working slice(0,-1)')
  t.deepEqual(tr.into([], a.slice(0, -2), [1, 2, 3, 4]), [1, 2], 'slice can take an index')
  t.deepEqual(tr.into([], a.slice(1, -2), [1, 2, 3, 4, 5]), [2, 3], 'slice(1, -2)')
  t.deepEqual(tr.into([], a.slice(0, -6), [1, 2, 3, 4]), [], 'slice can take a large index')

  t.deepEqual(tr.into([], a.slice(1, -1), [1, 2, 3, 4, 5]), [2, 3, 4], 'working slice(1,-1)')
  t.deepEqual(tr.into([], a.slice(2, -1), [1, 2, 3, 4, 5]), [3, 4], 'working slice(2,-1)')
  t.deepEqual(tr.into([], a.slice(1, -2), [1, 2, 3, 4, 5]), [2, 3], 'slice can take an index')
  t.deepEqual(tr.into([], a.slice(1, -6), [1, 2, 3, 4, 5]), [], 'slice can take a large index')

  t.deepEqual(tr.into([], a.slice(-1), [1, 2, 3]), [3], 'can pull out the last element of an array')
  t.deepEqual(tr.into([], a.slice(-2), [1, 2, 3]), [2, 3], 'can pass an index to last')
  t.deepEqual(tr.into([], a.slice(-5), [1, 2, 3]), [1, 2, 3], 'can pass an index to last')

  t.deepEqual(tr.into([], a.slice(-3, -1), [1, 2, 3, 4, 5]), [3, 4], 'working slice(-3,-1)')
  t.deepEqual(tr.into([], a.slice(-3, 4), [1, 2, 3, 4, 5]), [3, 4], 'working slice(-3,4)')
  t.deepEqual(tr.into([], a.slice(-3, -2), [1, 2, 3, 4, 5]), [3], 'working slice(-3,-2)')
  t.deepEqual(tr.into([], a.slice(-3, 3), [1, 2, 3, 4, 5]), [3], 'working slice(-3,3)')
  t.deepEqual(tr.into([], a.slice(-3, -3), [1, 2, 3, 4, 5]), [], 'working slice(-3,-3)')
  t.deepEqual(tr.into([], a.slice(-3, -4), [1, 2, 3, 4, 5]), [], 'working slice(-3,-4)')
  t.deepEqual(tr.into([], a.slice(-2, -1), [1, 2, 3, 4, 5]), [4], 'working slice(-2,-1)')
  t.deepEqual(tr.into([], a.slice(-1, -1), [1, 2, 3, 4, 5]), [], 'working slice(-1,-1)')

  t.end()
})
