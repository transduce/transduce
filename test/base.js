'use strict'
var tr = require('../'),
    test = require('tape'),
    compose = tr.compose

function isOdd(x){return x % 2 === 1}
function not(p){
  return function(v){
    return !p(v)
  }
}
function add(x){
  return function(y){
    return x+y
  }
}
var isEven = not(isOdd)
function identity(v){return v}

var stringReduce = {
  init: function() {
    return ''
  },
  step: function(result, val) {
    return result + val
  },
  result: function(result) {
    return result
  }
}

test('transduce', function(t) {
  t.equal(tr.transduce(tr.unique.dedupe(), stringReduce, '', ['a', 'b', 'b', 'c']), 'abc')
  t.equal(tr.transduce(tr.unique.dedupe(), stringReduce, ['a', 'b', 'b', 'c']), 'abc')
  t.end()
})

test('reduce', function(t) {
  var sum = tr.reduce(function(sum, num){ return sum + num }, 0, [1,2,3])
  t.equal(sum, 6, 'can sum up an array')

  var prod = tr.reduce(function(prod, num){ return prod * num }, 1, [1, 2, 3, 4])
  t.equal(prod, 24, 'can reduce via multiplication')

  var reducer  = tr.unique.dedupe()(stringReduce)
  t.equal(tr.reduce(reducer, '', ['a', 'b', 'b', 'c']), 'abc')
  t.equal(tr.reduce(reducer, ['a', 'b', 'b', 'c']), 'abc')
  t.end()
})

test('into', function(t) {
  t.deepEqual(tr.into([], [1,2,3,4,5,6]), [1,2,3,4,5,6])
  t.deepEqual(tr.into('', [1,2,3,4,5,6]), '123456')
  t.deepEqual(tr.into('hi ', [1,2,3,4,5,6]), 'hi 123456')
  t.deepEqual(tr.into([], tr.filter(isEven), [1,2,3,4,5,6]), [2,4,6])

  t.deepEqual(tr.into([])([1,2,3,4,5,6]), [1,2,3,4,5,6])
  t.deepEqual(tr.into('')([1,2,3,4,5,6]), '123456')
  t.deepEqual(tr.into('hi ')([1,2,3,4,5,6]), 'hi 123456')
  t.deepEqual(tr.into([])(tr.filter(isEven), [1,2,3,4,5,6]), [2,4,6])

  t.deepEqual(tr.into([], [[1,2],[3,4],[5,6]]), [[1,2],[3,4],[5,6]])
  t.deepEqual(tr.into({}, [[1,2],[3,4],[5,6]]), {1:2,3:4,5:6})
  t.deepEqual(tr.into({'hi':'world'}, [[1,2],[3,4],[5,6]]), {'hi':'world',1:2,3:4,5:6})
  t.deepEqual(tr.into([], tr.cat, [[1,2],[3,4],[5,6]]), [1,2,3,4,5,6])

  t.deepEqual(tr.into([])([[1,2],[3,4],[5,6]]), [[1,2],[3,4],[5,6]])
  t.deepEqual(tr.into({})([[1,2],[3,4],[5,6]]), {1:2,3:4,5:6})
  t.deepEqual(tr.into({'hi':'world'})([[1,2],[3,4],[5,6]]), {'hi':'world',1:2,3:4,5:6})

  t.deepEqual(tr.into([], tr.cat)([[1,2],[3,4],[5,6]]), [1,2,3,4,5,6])
  t.deepEqual(tr.into([])(tr.cat)([[1,2],[3,4],[5,6]]), [1,2,3,4,5,6])
  t.deepEqual(tr.into([])(tr.cat, [[1,2],[3,4],[5,6]]), [1,2,3,4,5,6])

  var transducer = tr.compose(tr.cat, tr.array.unshift(0), tr.map(add(1)))
  t.deepEqual(tr.into([], transducer, [[1,2],[3,4],[5,6]]), [1,2,3,4,5,6,7])
  t.deepEqual(tr.into([])(transducer, [[1,2],[3,4],[5,6]]), [1,2,3,4,5,6,7])
  t.deepEqual(tr.into([])(transducer)([[1,2],[3,4],[5,6]]), [1,2,3,4,5,6,7])
  t.deepEqual(tr.into([], transducer)([[1,2],[3,4],[5,6]]), [1,2,3,4,5,6,7])

  var tx

  tx = tr.into([], tr.compose(tr.map(add(1)), tr.filter(isEven)))
  t.deepEqual([[1,2,3], [2,3,4], [5,6,7]].map(tx), [[2,4], [4], [6,8]])

  tx = tr.into(stringReduce, tr.unique.dedupe())
  t.equal('abc', tx(['a', 'b', 'b', 'c']))

  tx = tr.into('', tr.unique.dedupe())
  t.equal(tx(['a', 'b', 'b', 'c']), 'abc')

  tx = tr.into('hi ', tr.unique.dedupe())
  t.equal(tx(['a', 'b', 'b', 'c']), 'hi abc')

  tx = tr.into([], tr.unique.dedupe())
  t.deepEqual(tx(['a', 'b', 'b', 'c']), ['a', 'b', 'c'])

  tx = tr.into([1, 2], tr.unique.dedupe())
  t.deepEqual(tx(['a', 'b', 'b', 'c']), [1, 2, 'a', 'b', 'c'])
  t.deepEqual(tx(['a', 'b', 'b', 'c', 'd']), [1, 2, 'a', 'b', 'c', 'd'])

  tx = tr.into({}, tr.partitionAll(2))
  t.deepEqual(tx(['a', 'b', 'b', 'c']), {a: 'b', b: 'c'})

  tx = tr.into({c: 'd'}, tr.partitionAll(2))
  t.deepEqual(tx(['a', 'b', 'b', 'c']), {a: 'b', b: 'c', c: 'd'})
  t.deepEqual(tx(['a', 'b', 'c', 'c']), {a: 'b', c: 'c'})
  t.deepEqual(tx(['a', 'b', 'b', 'c']), {a: 'b', b: 'c', c: 'd'})

  t.end()
})

test('toArray', function(t){
  t.deepEqual(tr.toArray([1,2,3]), [1,2,3])
  t.deepEqual(tr.toArray(tr.map(add(1)), [1,2,3]), [2,3,4])
  t.deepEqual(tr.toArray(tr.map(add(1)))([1,2,3]), [2,3,4])

  var range = tr.iterator.range
  t.deepEqual(tr.toArray(range(1,4)), [1,2,3])
  t.deepEqual(tr.toArray(tr.map(add(2)), range(3)), [2,3,4])
  t.deepEqual(tr.toArray(tr.map(add(2)))(range(3)), [2,3,4])
  t.end()
})

test('toString', function(t){
  t.deepEqual(tr.toString([1,2,3]), '123')
  t.deepEqual(tr.toString(tr.map(add(1)), [1,2,3]), '234')
  t.deepEqual(tr.toString(tr.map(add(1)))([1,2,3]), '234')

  var range = tr.iterator.range
  t.deepEqual(tr.toString(range(1,4)), '123')
  t.deepEqual(tr.toString(tr.map(add(2)), range(3)), '234')
  t.deepEqual(tr.toString(tr.map(add(2)))(range(3)), '234')
  t.end()
})

test('toObject', function(t){
  t.deepEqual(tr.toObject([['a', 'b'], ['b', 'c']]), {a: 'b', b: 'c'})
  t.deepEqual(tr.toObject(tr.partitionAll(2), ['a', 'b', 'b', 'c']), {a: 'b', b: 'c'})
  t.deepEqual(tr.toObject(tr.partitionAll(2))(['a', 'b', 'b', 'c']), {a: 'b', b: 'c'})
  t.end()
})

test('eduction', function(t){
  var xf,
      eduction = tr.eduction,
      iterToArray = tr.iterator.toArray,
      into = tr.into

  var divisibleBy2 = eduction(
        tr.map(function(val){return [val, val % 2 === 0]}),
        [1,2,3])
  t.deepEqual(into([], divisibleBy2), [[1,false], [2,true], [3,false]])
  t.deepEqual(into({}, divisibleBy2), {1:false, 2:true, 3:false})

  xf = tr.map(add(1))
  t.deepEqual(into([], eduction(xf, [1,2,3])), [2,3,4])
  t.deepEqual(iterToArray(eduction(xf, [1,2,3])), [2,3,4])

  xf = tr.map(add(2))
  t.deepEqual(into([], eduction(xf, [1,2,3])), [3,4,5])
  t.deepEqual(iterToArray(eduction(xf, [1,2,3])), [3,4,5])

  xf = tr.filter(isOdd)
  t.deepEqual(into([], eduction(xf, [1,2,3,4,5,7,9,10,12,13,15])), [1,3,5,7,9,13,15])
  t.deepEqual(iterToArray(eduction(xf, [1,2,3,4,5,7,9,10,12,13,15])), [1,3,5,7,9,13,15])

  xf = compose(tr.filter(isOdd), tr.take(3))
  t.deepEqual(into([], eduction(xf, [1,2,3,4,5,7,9,10,12,13,15])), [1,3,5])
  t.deepEqual(iterToArray(eduction(xf, [1,2,3,4,5,7,9,10,12,13,15])), [1,3,5])

  xf = compose(tr.filter(isOdd), tr.drop(3))
  t.deepEqual(into([], eduction(xf, [1,2,3,4,5,7,9,10,12,13,15])), [7,9,13,15])
  t.deepEqual(iterToArray(eduction(xf, [1,2,3,4,5,7,9,10,12,13,15])), [7,9,13,15])

  t.end()
})

test('map', function(t){
  t.plan(3)

  var doubled = tr.map(function(num){ return num * 2 })
  t.deepEqual([2,4,6], tr.into([], doubled, [1,2,3]), 'can double')

  var tripled = tr.map(function(num){ return num * 3 })
  t.deepEqual([3,6,9], tr.toArray(tripled, [1,2,3]), 'can triple')

  doubled = compose(
    tr.map(function(num){ return num * 2 }),
    tr.map(function(num){ return num * 3 }))
  t.deepEqual([6,12,18], tr.toArray(doubled, [1,2,3]), 'can double and triple in chain value')
})

test('filter', function(t) {
  t.plan(1)

  var evenArray = [1, 2, 3, 4, 5, 6]

  t.deepEqual(tr.toArray(tr.filter(isEven), evenArray), [2, 4, 6])
})

test('remove', function(t) {
  t.plan(1)

  var odds = tr.toArray(tr.remove(function(num){ return num % 2 === 0 }), [1, 2, 3, 4, 5, 6])
  t.deepEqual(odds, [1, 3, 5], 'rejected each even number')
})

test('take', function(t) {
  t.plan(5)

  t.deepEqual(tr.toArray(tr.take(0), [1, 2, 3]), [], 'can pass an index to first')
  t.deepEqual(tr.into([], tr.take(1), [1, 2, 3]), [1], 'can pull out the first element of an array')
  t.deepEqual(tr.toArray(tr.take(2), [1, 2, 3]), [1, 2], 'can pass an index to first')
  t.deepEqual(tr.into([], tr.take(3), [1, 2, 3]), [1, 2, 3], 'can pass an index to first')
  t.strictEqual(tr.toArray(tr.take(-1), [1, 2, 3]).length, 0)
})

test('takeWhile', function(t) {
  t.plan(4)

  t.deepEqual(tr.toArray(tr.takeWhile(isOdd), [1, 2, 3]), [1])
  t.deepEqual(tr.into([], tr.takeWhile(isEven), [1, 2, 3]), [])
  t.deepEqual(tr.toArray(tr.takeWhile(isEven), [2, 2, 3]), [2,2])
  t.deepEqual(tr.into([], tr.takeWhile(isOdd), [1, 3, 3]), [1, 3, 3])
})

test('drop', function(t) {
  t.plan(4)

  var numbers = [1, 2, 3, 4]
  t.deepEqual(tr.into([], tr.drop(1), numbers), [2, 3, 4], 'working rest()')
  t.deepEqual(tr.toArray(tr.drop(0), numbers), [1, 2, 3, 4], 'working rest(0)')
  t.deepEqual(tr.into([], tr.drop(-1), numbers), [1, 2, 3, 4], 'working rest(-1)')
  t.deepEqual(tr.toArray(tr.drop(2), numbers), [3, 4], 'rest can take an index')
})

test('dropWhile', function(t) {
  t.plan(4)

  t.deepEqual(tr.toArray(tr.dropWhile(isOdd), [1, 2, 3]), [2,3])
  t.deepEqual(tr.toArray(tr.dropWhile(isEven), [1, 2, 3]), [1,2,3])
  t.deepEqual(tr.into([], tr.dropWhile(isEven), [2, 2, 3]), [3])
  t.deepEqual(tr.into([], tr.dropWhile(isOdd), [1, 3, 3]), [])
})

test('cat', function(t) {
  t.plan(1)
  var res = tr.toArray(tr.cat, [[1,2,3],[4,5,6],[7,8,9]])
  t.deepEqual(res, [1,2,3,4,5,6,7,8,9])
})


test('mapcat', function(t) {
  t.plan(1)
  var res = tr.toArray(tr.mapcat(function(arr){return arr.reverse()}), [[3,2,1],[6,5,4],[9,8,7]])
  t.deepEqual(res, [1,2,3,4,5,6,7,8,9])
})

test('partitionBy', function(t) {
  t.plan(3)
  var result = tr.toArray(tr.partitionBy(isOdd), [0,1,1,3,4,6,8,7,7,8])
  t.deepEqual(result, [[0], [1,1,3], [4,6,8], [7,7], [8]])
  var arr = [1,1,1,2,2,3,3,3]
  result = tr.toArray(compose(tr.partitionBy(identity), tr.take(2)), arr)
  t.deepEqual(result, [[1,1,1],[2,2]])
  result = tr.toArray(tr.partitionBy(isOdd), [])
  t.deepEqual(result, [])
})

test('partitionAll', function(t) {
  t.plan(4)
  var result = tr.toArray(tr.partitionAll(2), [0,1,2,3,4,5,6,7,8,9])
  t.deepEqual(result, [[0,1],[2,3],[4,5],[6,7],[8,9]])
  result = tr.into([], tr.partitionAll(2), [0,1,2,3,4,5,6,7,8])
  t.deepEqual(result, [[0,1],[2,3],[4,5],[6,7],[8]])
  result = tr.toArray(compose(tr.partitionAll(2), tr.take(2)), [0,1,2,3,4,5,6,7,8,9])
  t.deepEqual(result, [[0,1],[2,3]])
  result = tr.toArray(tr.partitionAll(1), [])
  t.deepEqual(result, [])
})
