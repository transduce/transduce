'use strict'
var tr = require('../'),
    async = tr.async,
    compose = tr.compose,
    test = require('tape'),
    Prom = require('any-promise'),
    tap = require('../push/tap')

function resolve(value){
  return new Prom(function(resolve){
    resolve(value)
  })
}

test('reduce', function(t) {
  t.plan(5)

  var sum = async.reduce(function(sum, num){ return sum + num }, 0, [1,2,3])
  sum.then(function(value){
    t.equal(value, 6, 'can sum up an array')
  })

  var prod = async.reduce(function(prod, num){ return prod * num }, 1, [1, 2, 3, 4])
  prod.then(function(value){
    t.equal(value, 24, 'can reduce via multiplication')
  })

  sum = async.reduce(function(sum, num){ return sum + num }, 0, [resolve(1),2,3])
  sum.then(function(value){
    t.equal(value, 6, 'can sum up an array')
  })

  prod = async.reduce(function(prod, num){ return prod * num }, 1, [1, 2, resolve(3), resolve(4)])
  prod.then(function(value){
    t.equal(value, 24, 'can reduce via multiplication')
  })

  prod = async.reduce(function(prod, num){ return prod * num }, resolve(2), resolve([1, 2, resolve(3), 4]))
  prod.then(function(value){
    t.equal(value, 48, 'can reduce via multiplication')
  })
})

function add(x){
  return function(y){
    return x+y
  }
}

function deferAdd(x){
  return function(y){
    return resolve(x+y)
  }
}

test('transduce', function(t) {
  t.plan(5)

  var plus1 = tr.map(add(1))

  var sum = async.transduce(plus1, function(sum, num){ return sum + num }, 0, [1,2,3])
  sum.then(function(value){
    t.equal(value, 9, 'can sum up an array')
  })

  var prod = async.transduce(plus1, function(prod, num){ return prod * num }, 1, [1, 2, 3, 4])
  prod.then(function(value){
    t.equal(value, 120, 'can reduce via multiplication')
  })

  sum = async.transduce(plus1, function(sum, num){ return sum + num }, 0, [resolve(1),2,3])
  sum.then(function(value){
    t.equal(value, 9, 'can sum up an array')
  })

  prod = async.transduce(plus1, function(prod, num){ return prod * num }, 1, [1, 2, resolve(3), resolve(4)])
  prod.then(function(value){
    t.equal(value, 120, 'can reduce via multiplication')
  })

  prod = async.transduce(plus1, function(prod, num){ return prod * num }, resolve(2), resolve([1, 2, resolve(3), 4]))
  prod.then(function(value){
    t.equal(value, 240, 'can reduce via multiplication')
  })
})

test('toArray', function(t) {
  t.plan(7)

  var arr = async.toArray([1,2,3])
  arr.then(function(value){
    t.deepEqual(value, [1,2,3])
  })

  var add1 = async.toArray(tr.map(add(1)), [1,2,3])
  add1.then(function(value){
    t.deepEqual(value, [2,3,4])
  })

  var add3 = async.toArray(tr.compose(tr.map(add(1)), tr.map(add(2))), [1,2,3])
  add3.then(function(value){
    t.deepEqual(value, [4,5,6])
  })

  add3 = async.toArray(tr.compose(tr.map(deferAdd(1)), async.defer(), tr.map(add(2))), [1,2,3])
  add3.then(function(value){
    t.deepEqual(value, [4,5,6])
  })

  add3 = async.toArray(async.compose(tr.map(deferAdd(1)), tr.map(deferAdd(2))), [1,2,3])
  add3.then(function(value){
    t.deepEqual(value, [4,5,6])
  })

  add1 = async.toArray(tr.map(add(1)), [1,resolve(2),3])
  add1.then(function(value){
    t.deepEqual(value, [2,3,4])
  })

  add1 = async.toArray(tr.map(add(1)), resolve([1,resolve(2),3]))
  add1.then(function(value){
    t.deepEqual(value, [2,3,4])
  })
})

test('delay', function(t) {
  t.plan(7)
  var items, trans
  trans = async.compose(tr.map(deferAdd(1)), async.delay(10), tap(checkItem))

  async.toArray(trans, [1,2,3])
    .then(function(result){
      t.deepEqual(result, [2,3,4])
    })

  var prevTime = +new Date(),
      expected = [2,3,4]
  function checkItem(result, item){
    var currTime = +new Date()
    t.ok(currTime > prevTime + 3, 'delay '+item)
    t.equal(expected.shift(), item, 'in order '+item)
    prevTime = currTime
  }
})

test('deferred transformer', function(t) {
  t.plan(7)

  var xf = {
    init: function(){
      return resolve([])
    },
    step: function(arr, item){
      arr.push(item)
      return resolve(arr)
    },
    result: function(arr){
      return resolve(arr)
    }
  }

  var arr = async.reduce(xf, [1,2,3])
  arr.then(function(value){
    t.deepEqual(value, [1,2,3])
  })

  var add1 = async.transduce(tr.map(add(1)), xf, [1,2,3])
  add1.then(function(value){
    t.deepEqual(value, [2,3,4])
  })

  var add3 = async.transduce(tr.compose(tr.map(add(1)), tr.map(add(2))), xf, [1,2,3])
  add3.then(function(value){
    t.deepEqual(value, [4,5,6])
  })

  add3 = async.transduce(tr.compose(tr.map(deferAdd(1)), async.defer(), tr.map(add(2))), xf, [1,2,3])
  add3.then(function(value){
    t.deepEqual(value, [4,5,6])
  })

  add3 = async.transduce(async.compose(tr.map(deferAdd(1)), tr.map(deferAdd(2))), xf, [1,2,3])
  add3.then(function(value){
    t.deepEqual(value, [4,5,6])
  })

  add1 = async.transduce(tr.map(add(1)), xf, [1,resolve(2),3])
  add1.then(function(value){
    t.deepEqual(value, [2,3,4])
  })

  add1 = async.transduce(tr.map(add(1)), xf, resolve([1,resolve(2),3]))
  add1.then(function(value){
    t.deepEqual(value, [2,3,4])
  })
})
