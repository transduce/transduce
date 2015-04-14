'use strict'
var tr = require('../'),
    tp = tr.protocols.transducer,
    iterdone = require('iterdone'),
    test = require('tape'),
    compose = tr.compose,
    stringReduce = tr.transformer('')

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

function count(){
  var cnt = 0
  return function(){
    return cnt++
  }
}


test('transduce', function(t) {
  t.equal(tr.transduce(tr.dedupe(), stringReduce, '', ['a', 'b', 'b', 'c']), 'abc')
  t.equal(tr.transduce(tr.dedupe(), stringReduce, ['a', 'b', 'b', 'c']), 'abc')
  t.end()
})

test('reduce', function(t) {
  var sum = tr.reduce(function(sum, num){ return sum + num }, 0, [1,2,3])
  t.equal(sum, 6, 'can sum up an array')

  var prod = tr.reduce(function(prod, num){ return prod * num }, 1, [1, 2, 3, 4])
  t.equal(prod, 24, 'can reduce via multiplication')

  var reducer  = tr.dedupe()(stringReduce)
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

  tx = tr.into(stringReduce, tr.dedupe())
  t.equal('abc', tx(['a', 'b', 'b', 'c']))

  tx = tr.into('', tr.dedupe())
  t.equal(tx(['a', 'b', 'b', 'c']), 'abc')

  tx = tr.into('hi ', tr.dedupe())
  t.equal(tx(['a', 'b', 'b', 'c']), 'hi abc')

  tx = tr.into([], tr.dedupe())
  t.deepEqual(tx(['a', 'b', 'b', 'c']), ['a', 'b', 'c'])

  tx = tr.into([1, 2], tr.dedupe())
  t.deepEqual(tx(['a', 'b', 'b', 'c']), [1, 2, 'a', 'b', 'c'])
  t.deepEqual(tx(['a', 'b', 'b', 'c', 'd']), [1, 2, 'a', 'b', 'c', 'd'])

  tx = tr.into({}, tr.partitionAll(2))
  t.deepEqual(tx(['a', 'b', 'b', 'c']), {a: 'b', b: 'c'})

  tx = tr.into({c: 'd'}, tr.partitionAll(2))
  t.deepEqual(tx(['a', 'b', 'b', 'c']), {a: 'b', b: 'c', c: 'd'})
  t.deepEqual(tx(['a', 'b', 'c', 'c']), {a: 'b', c: 'c'})
  t.deepEqual(tx(['a', 'b', 'b', 'c']), {a: 'b', b: 'c', c: 'd'})

  var toArray = tr.into([])
  t.deepEqual(toArray([1,2,3]), [1,2,3])
  t.deepEqual(toArray(tr.map(add(1)), [1,2,3]), [2,3,4])
  t.deepEqual(toArray(tr.map(add(1)))([1,2,3]), [2,3,4])

  var range = iterdone.range
  t.deepEqual(toArray(range(1,4)), [1,2,3])
  t.deepEqual(toArray(tr.map(add(2)), range(3)), [2,3,4])
  t.deepEqual(toArray(tr.map(add(2)))(range(3)), [2,3,4])

  var toString = tr.into('')
  t.deepEqual(toString([1,2,3]), '123')
  t.deepEqual(toString(tr.map(add(1)), [1,2,3]), '234')
  t.deepEqual(toString(tr.map(add(1)))([1,2,3]), '234')

  t.deepEqual(toString(range(1,4)), '123')
  t.deepEqual(toString(tr.map(add(2)), range(3)), '234')
  t.deepEqual(toString(tr.map(add(2)))(range(3)), '234')

  var toObject = tr.into({})
  t.deepEqual(toObject([['a', 'b'], ['b', 'c']]), {a: 'b', b: 'c'})
  t.deepEqual(toObject(tr.partitionAll(2), ['a', 'b', 'b', 'c']), {a: 'b', b: 'c'})
  t.deepEqual(toObject(tr.partitionAll(2))(['a', 'b', 'b', 'c']), {a: 'b', b: 'c'})

  t.end()
})

test('eduction', function(t){
  var xf,
      eduction = tr.eduction,
      iterToArray = iterdone.toArray,
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

test('transducer', function(t){
  // Map from a step function
  function map(callback) {
    return tr.transducer(function(xfStep, value, input) {
      return xfStep(value, callback(input))
    })
  }

  // using custom result
  function some(predicate) {
    return tr.transducer(
      function(xfStep, value, input){
        if(predicate(input)){
          this.found = true
          return tr.reduced(xfStep(value, true))
        }
        return value
      },
      function(result, value){
        if(!this.found){
          value = this.xfStep(value, false)
        }
        return result(value)
      })
  }

  var doubled = map(function(num){ return num * 2 })
  t.deepEqual([2,4,6], tr.into([], doubled, [1,2,3]), 'can double')

  var tripled = map(function(num){ return num * 3 })
  t.deepEqual([3,6,9], tr.into([], tripled, [1,2,3]), 'can triple')

  doubled = compose(
    map(function(num){ return num * 2 }),
    map(function(num){ return num * 3 }))
  t.deepEqual([6,12,18], tr.into([], doubled, [1,2,3]), 'can double and triple in chain value')

  t.deepEqual(tr.into([], some(tr.identity), []), [false], 'the empty set')
  t.deepEqual(tr.into([], some(function(num){ return num % 2 === 0 }), [1, 11, 29]), [false], 'all odd numbers')
  t.deepEqual(tr.into([], some(function(num){ return num % 2 === 0 }), [1, 10, 29]), [true], 'one even numbers')

  t.end()
})


test('transform array', function(t){
  var xf = tr.transformer([]), result
  result = xf[tp.init]()
  t.deepEquals([], result)
  result = xf[tp.step](result, 1)
  t.deepEquals([1], result)
  result = xf[tp.step](result, 2)
  t.deepEquals([1,2], result)
  result = xf[tp.step](result, 3)
  t.deepEquals([1,2,3], result)
  result = xf[tp.result](result)
  t.deepEquals([1,2,3], result)

  result = xf[tp.init]()
  t.deepEquals([], result)
  result = xf[tp.step](result, 1)
  t.deepEquals([1], result)
  result = xf[tp.step](result, 2)
  t.deepEquals([1,2], result)
  result = xf[tp.result](result)
  t.deepEquals([1,2], result)

  xf = tr.transformer([4,5])

  result = xf[tp.init]()
  t.deepEquals([4,5], result)
  result = xf[tp.step](result, 1)
  t.deepEquals([4,5,1], result)
  result = xf[tp.step](result, 2)
  t.deepEquals([4,5,1,2], result)
  result = xf[tp.step](result, 3)
  t.deepEquals([4,5,1,2,3], result)
  result = xf[tp.result](result)
  t.deepEquals([4,5,1,2,3], result)

  result = xf[tp.init]()
  t.deepEquals([4,5], result)
  result = xf[tp.step](result, 1)
  t.deepEquals([4,5,1], result)
  result = xf[tp.step](result, 2)
  t.deepEquals([4,5,1,2], result)
  result = xf[tp.result](result)
  t.deepEquals([4,5,1,2], result)

  t.end()
})

test('transform string', function(t){
  var xf = tr.transformer(''), result
  result = xf[tp.init]()
  t.deepEquals('', result)
  result = xf[tp.step](result, 1)
  t.deepEquals('1', result)
  result = xf[tp.step](result, 2)
  t.deepEquals('12', result)
  result = xf[tp.step](result, 3)
  t.deepEquals('123', result)
  result = xf[tp.result](result)
  t.deepEquals('123', result)

  xf = tr.transformer('45')

  result = xf[tp.init]()
  t.deepEquals('45', result)
  result = xf[tp.step](result, 1)
  t.deepEquals('451', result)
  result = xf[tp.step](result, 2)
  t.deepEquals('4512', result)
  result = xf[tp.result](result)
  t.deepEquals('4512', result)

  result = xf[tp.init]()
  t.deepEquals('45', result)
  result = xf[tp.step](result, 1)
  t.deepEquals('451', result)
  result = xf[tp.step](result, 2)
  t.deepEquals('4512', result)
  result = xf[tp.result](result)
  t.deepEquals('4512', result)

  t.end()
})

test('transform object', function(t){
  var xf = tr.transformer({}), result
  result = xf[tp.init]()
  t.deepEquals({}, result)
  result = xf[tp.step](result, {a:1})
  t.deepEquals({a:1}, result)
  result = xf[tp.step](result, ['b', 2])
  t.deepEquals({a:1, b:2}, result)
  result = xf[tp.step](result, {c:3})
  t.deepEquals({a:1, b:2, c:3}, result)
  result = xf[tp.result](result)
  t.deepEquals({a:1,b:2,c:3}, result)

  result = xf[tp.init]()
  t.deepEquals({}, result)
  result = xf[tp.step](result, {a:1, b:2})
  t.deepEquals({a:1, b:2}, result)
  result = xf[tp.step](result, {c:3})
  t.deepEquals({a:1, b:2, c:3}, result)
  result = xf[tp.result](result)
  t.deepEquals({a:1,b:2,c:3}, result)

  xf = tr.transformer({d:4})

  result = xf[tp.init]()
  t.deepEquals({d:4}, result)
  result = xf[tp.step](result, {a:1, b:2})
  t.deepEquals({a:1, b:2, d:4}, result)
  result = xf[tp.result](result)
  t.deepEquals({a:1, b:2, d:4}, result)

  t.end()
})

test('transform function', function(t){
  var xf = tr.transformer(function(result, input){return result+input}), result
  result = 0
  result = xf[tp.step](result, 1)
  t.deepEquals(1, result)
  result = xf[tp.step](result, 2)
  t.deepEquals(3, result)
  result = xf[tp.step](result, 3)
  t.deepEquals(6, result)
  result = xf[tp.result](result)
  t.deepEquals(6, result)

  t.end()
})

test('iterate array', function(t){
  var arr, iterator, idx, symbol = tr.protocols.iterator

  idx = 0
  arr = [1,2,3]
  iterator = tr.iterable(arr)[symbol]()
  t.deepEquals({value: arr[idx++], done: false}, iterator.next())
  t.deepEquals({value: arr[idx++], done: false}, iterator.next())
  t.deepEquals({value: arr[idx++], done: false}, iterator.next())
  t.ok(iterator.next().done)
  t.ok(iterator.next().done)

  idx = 0
  arr = [2]
  iterator = tr.iterable(arr)[symbol]()
  t.deepEquals({value: arr[idx++], done: false}, iterator.next())
  t.ok(iterator.next().done)
  t.ok(iterator.next().done)

  idx = 0
  arr = []
  iterator = tr.iterable(arr)[symbol]()
  t.ok(iterator.next().done)
  t.ok(iterator.next().done)

  t.end()
})

test('iterate string', function(t){
  var arr, iterator, idx, symbol = tr.protocols.iterator

  idx = 0
  arr = ['1','2','3']
  iterator = tr.iterable('123')[symbol]()
  t.deepEquals({value: arr[idx++], done: false}, iterator.next())
  t.deepEquals({value: arr[idx++], done: false}, iterator.next())
  t.deepEquals({value: arr[idx++], done: false}, iterator.next())
  t.ok(iterator.next().done)
  t.ok(iterator.next().done)

  idx = 0
  arr = ['2']
  iterator = tr.iterable('2')[symbol]()
  t.deepEquals({value: arr[idx++], done: false}, iterator.next())
  t.ok(iterator.next().done)
  t.ok(iterator.next().done)

  idx = 0
  iterator = tr.iterable('')[symbol]()
  t.ok(iterator.next().done)
  t.ok(iterator.next().done)

  t.end()
})

test('iterate object', function(t){
  var obj, arr
  var toArray = iterdone.toArray

  obj = {a:1, b:2, c:3}
  arr = [['a', 1],['b', 2],['c', 3]]

  t.deepEqual(tr.into([], tr.iterable(obj)), arr)
  t.deepEqual(toArray(obj).sort(), arr)
  t.deepEqual(toArray({}), [])

  t.end()
})

test('iterate fn', function(t){
  var fn, iterator, start, symbol = tr.protocols.iterator

  function count(init){
    var cnt = init
    return function(){
      return cnt++
    }
  }

  start = 0
  iterator = tr.iterable(count(start))[symbol]()
  t.deepEquals({value: start++, done: false}, iterator.next())
  t.deepEquals({value: start++, done: false}, iterator.next())
  t.deepEquals({value: start++, done: false}, iterator.next())
  t.deepEquals({value: start++, done: false}, iterator.next())

  start = 10
  iterator = tr.iterable(count(start))[symbol]()
  t.deepEquals({value: start++, done: false}, iterator.next())
  t.deepEquals({value: start++, done: false}, iterator.next())
  t.deepEquals({value: start++, done: false}, iterator.next())
  t.deepEquals({value: start++, done: false}, iterator.next())

  t.end()
})

test('iterate next fn', function(t){
  var fn, iterator, start, symbol = tr.protocols.iterator

  function count(init){
    var cnt = init
    return {
      next: function(){
        return {done: false, value: cnt++}
      }
    }
  }

  start = 0
  iterator = tr.iterable(count(start))[symbol]()
  t.deepEquals({value: start++, done: false}, iterator.next())
  t.deepEquals({value: start++, done: false}, iterator.next())
  t.deepEquals({value: start++, done: false}, iterator.next())
  t.deepEquals({value: start++, done: false}, iterator.next())

  start = 10
  iterator = tr.iterable(count(start))[symbol]()
  t.deepEquals({value: start++, done: false}, iterator.next())
  t.deepEquals({value: start++, done: false}, iterator.next())
  t.deepEquals({value: start++, done: false}, iterator.next())
  t.deepEquals({value: start++, done: false}, iterator.next())

  t.end()
})


test('sequence array', function(t){
  var xf,
      toArray = iterdone.toArray,
      sequence = tr.sequence

  xf = tr.map(add(1))
  t.deepEqual(toArray(sequence(xf, [1,2,3])), [2,3,4])
  xf = tr.map(add(2))
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
  var xf,
      toArray = iterdone.toArray,
      sequence = tr.sequence

  xf = compose(tr.filter(isOdd), tr.take(3))
  t.deepEqual(toArray(sequence(xf, count())), [1,3,5])

  xf = compose(tr.filter(isOdd), tr.drop(3), tr.take(4))
  t.deepEqual(toArray(sequence(xf, count())), [7,9,11,13])

  t.end()
})


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
  t.ok(!tr.isReduced({'@@transducer/reduced':false}), 'not isReduced')
  t.ok(tr.isReduced({'@@transducer/reduced':true}), 'not isReduced')

  t.end()
})

test('arrayPush', function(t){
  var arrayPush = tr.transformer([])[tp.step],
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
  var stringAppend = tr.transformer('')[tp.step],
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
  var objectMerge = tr.transformer({})[tp.step],
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
  var objectMerge = tr.transformer({})[tp.step],
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
  var objectMerge = tr.transformer({})[tp.step],
      obj = Object.create(null)
  obj.a = 1;
  obj = objectMerge({}, obj)
  t.deepEqual({a:1}, obj)
  t.end()
})

test('iterator', function(t) {
  t.plan(1)
  var x = tr.iterator([1, 2, 3])
  t.ok(typeof x.next === 'function')
})
