'use strict'
var tp = require('../').transformer,
    test = require('tape')

test('transform array', function(t){
  var xf = tp.transformer([]), result
  result = xf.init()
  t.deepEquals([], result)
  result = xf.step(result, 1)
  t.deepEquals([1], result)
  result = xf.step(result, 2)
  t.deepEquals([1,2], result)
  result = xf.step(result, 3)
  t.deepEquals([1,2,3], result)
  result = xf.result(result)
  t.deepEquals([1,2,3], result)

  result = xf.init()
  t.deepEquals([], result)
  result = xf.step(result, 1)
  t.deepEquals([1], result)
  result = xf.step(result, 2)
  t.deepEquals([1,2], result)
  result = xf.result(result)
  t.deepEquals([1,2], result)

  xf = tp.transformer([4,5])

  result = xf.init()
  t.deepEquals([4,5], result)
  result = xf.step(result, 1)
  t.deepEquals([4,5,1], result)
  result = xf.step(result, 2)
  t.deepEquals([4,5,1,2], result)
  result = xf.step(result, 3)
  t.deepEquals([4,5,1,2,3], result)
  result = xf.result(result)
  t.deepEquals([4,5,1,2,3], result)

  result = xf.init()
  t.deepEquals([4,5], result)
  result = xf.step(result, 1)
  t.deepEquals([4,5,1], result)
  result = xf.step(result, 2)
  t.deepEquals([4,5,1,2], result)
  result = xf.result(result)
  t.deepEquals([4,5,1,2], result)

  t.end()
})

test('transform string', function(t){
  var xf = tp.transformer(''), result
  result = xf.init()
  t.deepEquals('', result)
  result = xf.step(result, 1)
  t.deepEquals('1', result)
  result = xf.step(result, 2)
  t.deepEquals('12', result)
  result = xf.step(result, 3)
  t.deepEquals('123', result)
  result = xf.result(result)
  t.deepEquals('123', result)

  xf = tp.transformer('45')

  result = xf.init()
  t.deepEquals('45', result)
  result = xf.step(result, 1)
  t.deepEquals('451', result)
  result = xf.step(result, 2)
  t.deepEquals('4512', result)
  result = xf.result(result)
  t.deepEquals('4512', result)

  result = xf.init()
  t.deepEquals('45', result)
  result = xf.step(result, 1)
  t.deepEquals('451', result)
  result = xf.step(result, 2)
  t.deepEquals('4512', result)
  result = xf.result(result)
  t.deepEquals('4512', result)

  t.end()
})

test('transform object', function(t){
  var xf = tp.transformer({}), result
  result = xf.init()
  t.deepEquals({}, result)
  result = xf.step(result, {a:1})
  t.deepEquals({a:1}, result)
  result = xf.step(result, ['b', 2])
  t.deepEquals({a:1, b:2}, result)
  result = xf.step(result, {c:3})
  t.deepEquals({a:1, b:2, c:3}, result)
  result = xf.result(result)
  t.deepEquals({a:1,b:2,c:3}, result)

  result = xf.init()
  t.deepEquals({}, result)
  result = xf.step(result, {a:1, b:2})
  t.deepEquals({a:1, b:2}, result)
  result = xf.step(result, {c:3})
  t.deepEquals({a:1, b:2, c:3}, result)
  result = xf.result(result)
  t.deepEquals({a:1,b:2,c:3}, result)

  xf = tp.transformer({d:4})

  result = xf.init()
  t.deepEquals({d:4}, result)
  result = xf.step(result, {a:1, b:2})
  t.deepEquals({a:1, b:2, d:4}, result)
  result = xf.result(result)
  t.deepEquals({a:1, b:2, d:4}, result)

  t.end()
})

test('transform function', function(t){
  var xf = tp.transformer(function(result, input){return result+input}), result
  result = 0
  result = xf.step(result, 1)
  t.deepEquals(1, result)
  result = xf.step(result, 2)
  t.deepEquals(3, result)
  result = xf.step(result, 3)
  t.deepEquals(6, result)
  result = xf.result(result)
  t.deepEquals(6, result)

  t.end()
})
