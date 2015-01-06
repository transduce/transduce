'use strict'
var iter = require('../'),
    test = require('tape')

test('iterate array', function(t){
  var arr, iterator, idx

  idx = 0
  arr = [1,2,3]
  iterator = iter.iterator(arr)
  t.deepEquals({value: arr[idx++], done: false}, iterator.next())
  t.deepEquals({value: arr[idx++], done: false}, iterator.next())
  t.deepEquals({value: arr[idx++], done: false}, iterator.next())
  t.deepEquals({done: true}, iterator.next())
  t.deepEquals({done: true}, iterator.next())

  idx = 0
  arr = [2]
  iterator = iter.iterator(arr)
  t.deepEquals({value: arr[idx++], done: false}, iterator.next())
  t.deepEquals({done: true}, iterator.next())
  t.deepEquals({done: true}, iterator.next())

  idx = 0
  arr = []
  iterator = iter.iterator(arr)
  t.deepEquals({done: true}, iterator.next())
  t.deepEquals({done: true}, iterator.next())

  t.end()
})

test('iterate string', function(t){
  var arr, iterator, idx

  idx = 0
  arr = ['1','2','3']
  iterator = iter.iterator('123')
  t.deepEquals({value: arr[idx++], done: false}, iterator.next())
  t.deepEquals({value: arr[idx++], done: false}, iterator.next())
  t.deepEquals({value: arr[idx++], done: false}, iterator.next())
  t.deepEquals({done: true}, iterator.next())
  t.deepEquals({done: true}, iterator.next())

  idx = 0
  arr = ['2']
  iterator = iter.iterator('2')
  t.deepEquals({value: arr[idx++], done: false}, iterator.next())
  t.deepEquals({done: true}, iterator.next())
  t.deepEquals({done: true}, iterator.next())

  idx = 0
  iterator = iter.iterator('')
  t.deepEquals({done: true}, iterator.next())
  t.deepEquals({done: true}, iterator.next())

  t.end()
})

test('iterate object', function(t){
  var obj, arr

  obj = {a:1, b:2, c:3}
  arr = [['a', 1],['b', 2],['c', 3]]

  t.deepEqual(iter.toArray(obj).sort(), arr)
  t.deepEqual(iter.toArray({}), [])

  t.end()
})


test('iterate fn', function(t){
  var fn, iterator, start

  function count(init){
    var cnt = init
    return function(){
      return cnt++
    }
  }

  start = 0
  iterator = iter.iterator(count(start))
  t.deepEquals({value: start++, done: false}, iterator.next())
  t.deepEquals({value: start++, done: false}, iterator.next())
  t.deepEquals({value: start++, done: false}, iterator.next())
  t.deepEquals({value: start++, done: false}, iterator.next())

  start = 10
  iterator = iter.iterator(count(start))
  t.deepEquals({value: start++, done: false}, iterator.next())
  t.deepEquals({value: start++, done: false}, iterator.next())
  t.deepEquals({value: start++, done: false}, iterator.next())
  t.deepEquals({value: start++, done: false}, iterator.next())

  t.end()
})
