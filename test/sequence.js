'use strict'
var tr = require('../'),
    sequence = tr.sequence,
    toArray = tr.iterator.toArray,
    compose = tr.compose,
    test = require('tape')

test('sequence array', function(t){
  var xf

  xf = tr.map(plus(1))
  t.deepEqual(toArray(sequence(xf, [1,2,3])), [2,3,4])
  xf = tr.map(plus(2))
  t.deepEqual(toArray(sequence(xf, [1,2,3])), [3,4,5])
  xf = tr.filter(isOdd)
  t.deepEqual(toArray(sequence(xf, [1,2,3,4,5,7,9,10,12,13,15])), [1,3,5,7,9,13,15])

  xf = compose(tr.filter(isOdd), tr.take(3))
  t.deepEqual(toArray(sequence(xf, [1,2,3,4,5,7,9,10,12,13,15])), [1,3,5])

  xf = compose(tr.filter(isOdd), tr.drop(3))
  t.deepEqual(toArray(sequence(xf, [1,2,3,4,5,7,9,10,12,13,15])), [7,9,13,15])

  t.end()
})

test('sequence fn', function(t){
  var xf

  xf = compose(tr.filter(isOdd), tr.take(3))
  t.deepEqual(toArray(sequence(xf, count())), [1,3,5])

  xf = compose(tr.filter(isOdd), tr.drop(3), tr.take(4))
  t.deepEqual(toArray(sequence(xf, count())), [7,9,11,13])

  t.end()
})

function plus(x){
  return function(y){
    return x+y
  }
}
function isOdd(x){
  return x%2 !== 0
}

function count(){
  var cnt = 0
  return function(){
    return cnt++
  }
}

