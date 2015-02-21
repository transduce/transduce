'use strict'
var tr = require('../'),
    iter = require('../').iterators,
    test = require('tape')

test('iterate array', function(t){
  var arr, iterator, idx

  idx = 0
  arr = [1,2,3]
  iterator = tr.iterator(arr)
  t.deepEquals({value: arr[idx++], done: false}, iterator.next())
  t.deepEquals({value: arr[idx++], done: false}, iterator.next())
  t.deepEquals({value: arr[idx++], done: false}, iterator.next())
  t.ok(iterator.next().done)
  t.ok(iterator.next().done)

  idx = 0
  arr = [2]
  iterator = tr.iterator(arr)
  t.deepEquals({value: arr[idx++], done: false}, iterator.next())
  t.ok(iterator.next().done)
  t.ok(iterator.next().done)

  idx = 0
  arr = []
  iterator = tr.iterator(arr)
  t.ok(iterator.next().done)
  t.ok(iterator.next().done)

  t.end()
})

test('iterate string', function(t){
  var arr, iterator, idx

  idx = 0
  arr = ['1','2','3']
  iterator = tr.iterator('123')
  t.deepEquals({value: arr[idx++], done: false}, iterator.next())
  t.deepEquals({value: arr[idx++], done: false}, iterator.next())
  t.deepEquals({value: arr[idx++], done: false}, iterator.next())
  t.ok(iterator.next().done)
  t.ok(iterator.next().done)

  idx = 0
  arr = ['2']
  iterator = tr.iterator('2')
  t.deepEquals({value: arr[idx++], done: false}, iterator.next())
  t.ok(iterator.next().done)
  t.ok(iterator.next().done)

  idx = 0
  iterator = tr.iterator('')
  t.ok(iterator.next().done)
  t.ok(iterator.next().done)

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
  iterator = tr.iterator(count(start))
  t.deepEquals({value: start++, done: false}, iterator.next())
  t.deepEquals({value: start++, done: false}, iterator.next())
  t.deepEquals({value: start++, done: false}, iterator.next())
  t.deepEquals({value: start++, done: false}, iterator.next())

  start = 10
  iterator = tr.iterator(count(start))
  t.deepEquals({value: start++, done: false}, iterator.next())
  t.deepEquals({value: start++, done: false}, iterator.next())
  t.deepEquals({value: start++, done: false}, iterator.next())
  t.deepEquals({value: start++, done: false}, iterator.next())

  t.end()
})

test('range', function(t){
  var fn, iterator, start, iterable

  start = 0
  iterable = iter.range(4)
  t.deepEquals(iter.toArray(iterable), [0,1,2,3])

  iterator = tr.iterator(iterable)
  t.deepEquals({value: start++, done: false}, iterator.next())
  t.deepEquals({value: start++, done: false}, iterator.next())
  t.deepEquals({value: start++, done: false}, iterator.next())
  t.deepEquals({value: start++, done: false}, iterator.next())
  t.deepEquals({done: true}, iterator.next())
  t.deepEquals({done: true}, iterator.next())


  start = 10
  iterable = iter.range(start, 15)
  t.deepEquals(iter.toArray(iterable), [10,11,12,13,14])

  iterator = tr.iterator(iterable)
  t.deepEquals({value: start++, done: false}, iterator.next())
  t.deepEquals({value: start++, done: false}, iterator.next())
  t.deepEquals({value: start++, done: false}, iterator.next())
  t.deepEquals({value: start++, done: false}, iterator.next())
  t.deepEquals({value: start++, done: false}, iterator.next())
  t.deepEquals({done: true}, iterator.next())
  t.deepEquals({done: true}, iterator.next())

  start = 10
  iterable = iter.range(start, 6, -1)
  t.deepEquals(iter.toArray(iterable), [10,9,8,7])

  iterator = tr.iterator(iterable)
  t.deepEquals({value: start--, done: false}, iterator.next())
  t.deepEquals({value: start--, done: false}, iterator.next())
  t.deepEquals({value: start--, done: false}, iterator.next())
  t.deepEquals({value: start--, done: false}, iterator.next())
  t.deepEquals({done: true}, iterator.next())
  t.deepEquals({done: true}, iterator.next())

  t.deepEquals(iter.toArray(iter.range(1,20,3)), [1,4,7,10,13,16,19])
  t.deepEquals(iter.toArray(iter.range(10,6,-2)), [10,8])

  t.end()
})

test('count', function(t){
  var fn, iterator, start

  start = 0
  iterator = tr.iterator(iter.count())
  t.deepEquals({value: start++, done: false}, iterator.next())
  t.deepEquals({value: start++, done: false}, iterator.next())
  t.deepEquals({value: start++, done: false}, iterator.next())
  t.deepEquals({value: start++, done: false}, iterator.next())

  start = 10
  iterator = tr.iterator(iter.count(start))
  t.deepEquals({value: start++, done: false}, iterator.next())
  t.deepEquals({value: start++, done: false}, iterator.next())
  t.deepEquals({value: start++, done: false}, iterator.next())
  t.deepEquals({value: start++, done: false}, iterator.next())

  start = 10
  iterator = tr.iterator(iter.count(start, -1))
  t.deepEquals({value: start--, done: false}, iterator.next())
  t.deepEquals({value: start--, done: false}, iterator.next())
  t.deepEquals({value: start--, done: false}, iterator.next())
  t.deepEquals({value: start--, done: false}, iterator.next())

  t.end()
})

test('cycle', function(t){
  var arr, iterator, idx = 0

  arr = [1,2,3]
  iterator = tr.iterator(iter.cycle(arr))
  t.deepEquals({value: arr[idx++ % 3], done: false}, iterator.next())
  t.deepEquals({value: arr[idx++ % 3], done: false}, iterator.next())
  t.deepEquals({value: arr[idx++ % 3], done: false}, iterator.next())
  t.deepEquals({value: arr[idx++ % 3], done: false}, iterator.next())
  t.deepEquals({value: arr[idx++ % 3], done: false}, iterator.next())
  t.deepEquals({value: arr[idx++ % 3], done: false}, iterator.next())
  t.deepEquals({value: arr[idx++ % 3], done: false}, iterator.next())


  t.end()
})

test('repeat', function(t){
  var arr, iterator, idx = 0

  iterator = tr.iterator(iter.repeat(1))
  t.deepEquals({value: 1, done: false}, iterator.next())
  t.deepEquals({value: 1, done: false}, iterator.next())
  t.deepEquals({value: 1, done: false}, iterator.next())
  t.deepEquals({value: 1, done: false}, iterator.next())
  t.deepEquals({value: 1, done: false}, iterator.next())
  t.deepEquals({value: 1, done: false}, iterator.next())
  t.deepEquals({value: 1, done: false}, iterator.next())

  iterator = tr.iterator(iter.repeat(1, 3))
  t.deepEquals({value: 1, done: false}, iterator.next())
  t.deepEquals({value: 1, done: false}, iterator.next())
  t.deepEquals({value: 1, done: false}, iterator.next())
  t.deepEquals({done: true}, iterator.next())
  t.deepEquals({done: true}, iterator.next())
  t.deepEquals({done: true}, iterator.next())
  t.deepEquals({done: true}, iterator.next())

  t.end()
})

test('chain', function(t){
  t.deepEqual(iter.toArray(iter.chain(iter.range(1,4), iter.range(4,7))), [1,2,3,4,5,6])
  t.deepEqual(iter.toArray(iter.chain()), [])
  t.end()
})
