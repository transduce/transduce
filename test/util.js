'use strict'
var tr = require('../'),
    tp = tr.util,
    test = require('tape')

test('compose', function(t){
  function minus(x){
    return function(y){
      return y - x
    }
  }
  function mult(x){
    return function(y){
      return y * x
    }
  }
  t.equals(tr.compose(minus(1), minus(2))(3), 0)
  t.equals(tr.compose(minus(1), mult(2))(3), 5)
  t.end()
})

test('isReduced', function(t){
  t.ok(!tr.isReduced(''), 'not isReduced')
  t.ok(!tr.isReduced(false), 'not isReduced')
  t.ok(!tr.isReduced({value:true}), 'not isReduced')
  t.ok(tr.isReduced(tr.reduced('')), 'isReduced')
  t.ok(!tr.isReduced(tr.unreduced(tr.reduced(''))), 'not isReduced')
  t.ok(!tr.isReduced({}), 'not isReduced')
  t.ok(!tr.isReduced({__transducers_reduced__:false}), 'not isReduced')
  t.ok(tr.isReduced({__transducers_reduced__:true}), 'not isReduced')

  t.end()
})

test('is', function(t){
  t.ok(tp.isFunction(test))
  t.ok(tp.isFunction(tp.identity))
  t.ok(tp.isString(''))
  t.ok(tp.isRegExp(/./))
  t.ok(tp.isUndefined())
  t.ok(tp.isArray([]))
  t.ok(tp.isNumber(2))

  t.end()
})

test('arrayPush', function(t){
  var arrayPush = tr.transformer([]).step,
      arr = []
  arr = arrayPush(arr, 1)
  t.deepEqual([1], arr)
  arr = arrayPush(arr, 2)
  t.deepEqual([1,2], arr)
  arr = arrayPush(arr, 3)
  t.deepEqual([1,2,3], arr)
  t.end()
})

test('stringAppend', function(t){
  var stringAppend = tr.transformer('').step,
      str = ''
  str = stringAppend(str, '1')
  t.deepEqual('1', str)
  str = stringAppend(str, '2')
  t.deepEqual('12', str)
  str = stringAppend(str, '3')
  t.deepEqual('123', str)
  t.end()
})

test('objectMerge pair', function(t){
  var objectMerge = tr.transformer({}).step,
      obj = {}
  obj = objectMerge(obj, ['a', 1])
  t.deepEqual({a:1}, obj)
  obj = objectMerge(obj, ['b', 2])
  t.deepEqual({a:1, b:2}, obj)
  obj = objectMerge(obj, ['c', 3])
  t.deepEqual({a:1, b:2, c:3}, obj)
  obj = objectMerge(obj, ['c', 2])
  t.deepEqual({a:1, b:2, c:2}, obj)
  t.end()
})

test('objectMerge obj', function(t){
  var objectMerge = tr.transformer({}).step,
      obj = {}
  obj = objectMerge(obj, {a:1})
  t.deepEqual({a:1}, obj)
  obj = objectMerge(obj, {b:2})
  t.deepEqual({a:1, b:2}, obj)
  obj = objectMerge(obj, {c:3})
  t.deepEqual({a:1, b:2, c:3}, obj)
  obj = objectMerge(obj, {c:2})
  t.deepEqual({a:1, b:2, c:2}, obj)
  obj = objectMerge(obj, {a:0, b:2, d:4})
  t.deepEqual({a:0, b:2, c:2, d:4}, obj)
  t.end()
})

test('objectMerge Object.create(null)', function(t){
  var objectMerge = tr.transformer({}).step,
      obj = Object.create(null)
  obj.a = 1;
  obj = objectMerge({}, obj)
  t.deepEqual({a:1}, obj)
  t.end()
})

