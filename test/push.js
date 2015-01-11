"use strict"
var tr = require('../'),
    push = tr.push,
    compose = tr.compose,
    test = require('tape')

function isEven(x){
  return +x == x && (x % 2 === 0)
}

function inc(x){
  return x+1
}

test('tap', function(t){
  t.plan(3)

  var results = [], items = []
  var trans = compose(
    tr.filter(function(num) { return num % 2 === 0 }),
    push.tap(function(result, item){results.push([].slice.call(result)); items.push(item)}),
    tr.map(function(num) { return num * num }))
  var result = tr.into([], trans, [1,2,3,200])
  t.deepEqual(result, [4, 40000], 'filter and map chained with tap')
  t.deepEqual(results, [[], [4]], 'filter and map chained with tap results')
  t.deepEqual(items, [2, 200], 'filter and map chained with tap items')
})

test('asCallback', function(t){
  var results = [],
      trans = compose(tr.filter(isEven), tr.map(inc), tr.take(2), push.tap(appendEach)),
      cb = push.asCallback(trans)

  ;[1,1,2,3,4,4,5].forEach(cb)
  t.deepEqual(results, [3,5])
  t.equal(5, cb())

  trans = compose(tr.filter(isEven), tr.map(inc), push.tap(appendEach))
  cb = push.asCallback(trans)
  results = []
  ;[1,2,3,4,5,6,7,8,9].forEach(cb)
  t.deepEqual(results, [3,5,7,9])

  function appendEach(result, item){
    results.push(item)
  }

  t.end()
})

test('asyncCallback', function(t){
  t.plan(9)

  var results, result, trans, cb, abort = new Error('abort')

  trans = compose(tr.filter(isEven), tr.map(inc), tr.take(2), push.tap(appendEach))
  cb = push.asyncCallback(trans, continuation)

  results = []
  result = {done: false, error: false}

  ;[1,1,2,3,4,4,5].forEach(function(item){cb(null, item)})
  t.deepEqual(results, [3,5])
  t.deepEqual(result, {done:true, error:null})

  cb = compose(tr.filter(isEven), tr.map(inc), push.tap(appendEach), tr.take(2))
  cb = push.asyncCallback(trans, continuation)

  results = []
  result = {done: false, error: false}

  ;[1,1,2,3,4,4,5].forEach(function(item){cb(item === 3 ? abort : null, item)})
  t.deepEqual(results, [3])
  t.deepEqual(result, {done:true, error:abort})

  results = []
  result = {done: false, error: false}

  trans = compose(tr.filter(isEven), tr.map(inc), push.tap(appendEach))
  cb = push.asyncCallback(trans, continuation)
  ;[1,2,3,4,5,6,7,8,9].forEach(function(item){cb(null, item)})
  t.deepEqual(results, [3,5,7,9])
  t.deepEqual(result, {done:false, error:false})
  cb()
  t.deepEqual(result, {done:true, error:null})

  results = []
  result = {done: false, error: false}

  trans = compose(
    tr.filter(isEven),
    tr.map(inc),
    push.tap(appendEach),
    push.tap(function(result, i){if(i===7){throw abort}}))
  cb = push.asyncCallback(trans, continuation)
  ;[1,2,3,4,5,6,7,8,9].forEach(function(item){cb(null, item)})
  t.deepEqual(results, [3,5,7])
  t.deepEqual(result, {done:true, error:abort})

  function appendEach(result, item){
    results.push(item)
  }

  function continuation(err){
    result.done = true
    result.error = err
  }
})
