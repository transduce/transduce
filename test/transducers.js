'use strict'
var tr = require('../'),
    test = require('tape'),
    compose = tr.compose

function isOdd(x){return x % 2 === 1}
function isEven(x){return x % 2 === 0}

test('map', function(t){
  t.plan(3)

  var doubled = tr.map(function(num){ return num * 2 })
  t.deepEqual([2,4,6], tr.into([], doubled, [1,2,3]), 'can double')

  var tripled = tr.map(function(num){ return num * 3 })
  t.deepEqual([3,6,9], tr.into([], tripled, [1,2,3]), 'can triple')

  doubled = compose(
    tr.map(function(num){ return num * 2 }),
    tr.map(function(num){ return num * 3 }))
  t.deepEqual([6,12,18], tr.into([], doubled, [1,2,3]), 'can double and triple in chain value')
})

test('filter', function(t) {
  t.plan(1)

  var evenArray = [1, 2, 3, 4, 5, 6]

  t.deepEqual(tr.into([], tr.filter(isEven), evenArray), [2, 4, 6])
})

test('remove', function(t) {
  t.plan(1)

  var odds = tr.into([], tr.remove(function(num){ return num % 2 === 0 }), [1, 2, 3, 4, 5, 6])
  t.deepEqual(odds, [1, 3, 5], 'rejected each even number')
})

test('take', function(t) {
  t.plan(5)

  t.deepEqual(tr.into([], tr.take(0), [1, 2, 3]), [], 'can pass an index to first')
  t.deepEqual(tr.into([], tr.take(1), [1, 2, 3]), [1], 'can pull out the first element of an array')
  t.deepEqual(tr.into([], tr.take(2), [1, 2, 3]), [1, 2], 'can pass an index to first')
  t.deepEqual(tr.into([], tr.take(3), [1, 2, 3]), [1, 2, 3], 'can pass an index to first')
  t.strictEqual(tr.into([], tr.take(-1), [1, 2, 3]).length, 0)
})

test('takeWhile', function(t) {
  t.plan(4)

  t.deepEqual(tr.into([], tr.takeWhile(isOdd), [1, 2, 3]), [1])
  t.deepEqual(tr.into([], tr.takeWhile(isEven), [1, 2, 3]), [])
  t.deepEqual(tr.into([], tr.takeWhile(isEven), [2, 2, 3]), [2,2])
  t.deepEqual(tr.into([], tr.takeWhile(isOdd), [1, 3, 3]), [1, 3, 3])
})

test('drop', function(t) {
  t.plan(4)

  var numbers = [1, 2, 3, 4]
  t.deepEqual(tr.into([], tr.drop(1), numbers), [2, 3, 4], 'working rest()')
  t.deepEqual(tr.into([], tr.drop(0), numbers), [1, 2, 3, 4], 'working rest(0)')
  t.deepEqual(tr.into([], tr.drop(-1), numbers), [1, 2, 3, 4], 'working rest(-1)')
  t.deepEqual(tr.into([], tr.drop(2), numbers), [3, 4], 'rest can take an index')
})

test('dropWhile', function(t) {
  t.plan(4)

  t.deepEqual(tr.into([], tr.dropWhile(isOdd), [1, 2, 3]), [2,3])
  t.deepEqual(tr.into([], tr.dropWhile(isEven), [1, 2, 3]), [1,2,3])
  t.deepEqual(tr.into([], tr.dropWhile(isEven), [2, 2, 3]), [3])
  t.deepEqual(tr.into([], tr.dropWhile(isOdd), [1, 3, 3]), [])
})

test('cat', function(t) {
  t.plan(1)
  var res = tr.into([], tr.cat, [[1,2,3],[4,5,6],[7,8,9]])
  t.deepEqual(res, [1,2,3,4,5,6,7,8,9])
})


test('mapcat', function(t) {
  t.plan(1)
  var res = tr.into([], tr.mapcat(function(arr){return arr.reverse()}), [[3,2,1],[6,5,4],[9,8,7]])
  t.deepEqual(res, [1,2,3,4,5,6,7,8,9])
})

test('partitionBy', function(t) {
  t.plan(3)
  var result = tr.into([], tr.partitionBy(isOdd), [0,1,1,3,4,6,8,7,7,8])
  t.deepEqual(result, [[0], [1,1,3], [4,6,8], [7,7], [8]])
  var arr = [1,1,1,2,2,3,3,3]
  result = tr.into([], compose(tr.partitionBy(tr.util.identity), tr.take(2)), arr)
  t.deepEqual(result, [[1,1,1],[2,2]])
  result = tr.into([], tr.partitionBy(isOdd), [])
  t.deepEqual(result, [])
})

test('partitionAll', function(t) {
  t.plan(4)
  var result = tr.into([], tr.partitionAll(2), [0,1,2,3,4,5,6,7,8,9])
  t.deepEqual(result, [[0,1],[2,3],[4,5],[6,7],[8,9]])
  result = tr.into([], tr.partitionAll(2), [0,1,2,3,4,5,6,7,8])
  t.deepEqual(result, [[0,1],[2,3],[4,5],[6,7],[8]])
  result = tr.into([], compose(tr.partitionAll(2), tr.take(2)), [0,1,2,3,4,5,6,7,8,9])
  t.deepEqual(result, [[0,1],[2,3]])
  result = tr.into([], tr.partitionAll(1), [])
  t.deepEqual(result, [])
})

test('dedupe', function(t) {
  var list = [1, 1, 1, 2, 2, 3]
  t.deepEqual(tr.into([], tr.dedupe(), list), [1, 2, 3])
  t.end()
})

test('unique', function(t) {

  var list = [1, 2, 1, 3, 1, 4]
  t.deepEqual(tr.into([], tr.unique(), list), [1, 2, 3, 4], 'can find the unique values of an unsorted array')

  list = [{name: 'moe'}, {name: 'curly'}, {name: 'larry'}, {name: 'curly'}]
  var iterator = function(value) { return value.name }
  t.deepEqual(tr.into([], compose(tr.unique(iterator), tr.map(iterator)), list), ['moe', 'curly', 'larry'], 'can find the unique values of an array using a custom iterator')

  iterator = function(value) { return value + 1 }
  list = [1, 2, 2, 3, 4, 4]
  t.deepEqual(tr.into([], tr.unique(iterator), list), [1, 2, 3, 4], 'iterator works with sorted array')

  var a = {}, b = {}, c = {}
  t.deepEqual(tr.into([], tr.unique(), [a, b, a, b, c]), [a, b, c], 'works on values that can be tested for equivalency but not ordered')

  t.end()
})

test('tap', function(t){
  t.plan(3)

  var results = [], items = []
  var trans = tr.compose(
    tr.filter(function(num) { return num % 2 === 0 }),
    tr.tap(function(result, item){results.push([].slice.call(result)); items.push(item)}),
    tr.map(function(num) { return num * num }))
  var result = tr.into([], trans, [1,2,3,200])
  t.deepEqual(result, [4, 40000], 'filter and map chained with tap')
  t.deepEqual(results, [[], [4]], 'filter and map chained with tap results')
  t.deepEqual(items, [2, 200], 'filter and map chained with tap items')
})

test('transformStep', function(t) {
  function map(f) {
    return tr.transformStep(function(xf, result, input){
      return xf.step(result, f(input))
    })
  }

  function takeWhile(p){
    return tr.transformStep(function(xf, result, item){
      return p(item) ? xf.step(result, item) : tr.reduced(result)
    })
  }

  function drop(n){
    return tr.transformStep(function(xf, result, item){
      if(this.n === void 0) this.n = n
      if(--this.n < 0){
        result = xf.step(result, item)
      }
      return result
    })
  }

  var doubled = map(function(num){ return num * 2 })
  t.deepEqual([2,4,6], tr.into([], doubled, [1,2,3]), 'can double')

  var tripled = map(function(num){ return num * 3 })
  t.deepEqual([3,6,9], tr.into([], tripled, [1,2,3]), 'can triple')

  t.deepEqual(tr.into([], takeWhile(isOdd), [1, 2, 3]), [1])
  t.deepEqual(tr.into([], takeWhile(isEven), [1, 2, 3]), [])
  t.deepEqual(tr.into([], takeWhile(isEven), [2, 2, 3]), [2,2])
  t.deepEqual(tr.into([], takeWhile(isOdd), [1, 3, 3]), [1, 3, 3])

  var numbers = [1, 2, 3, 4]
  t.deepEqual(tr.into([], drop(1), numbers), [2, 3, 4], 'working rest()')
  t.deepEqual(tr.into([], drop(0), numbers), [1, 2, 3, 4], 'working rest(0)')
  t.deepEqual(tr.into([], drop(-1), numbers), [1, 2, 3, 4], 'working rest(-1)')
  t.deepEqual(tr.into([], drop(2), numbers), [3, 4], 'rest can take an index')

  t.end()
})
