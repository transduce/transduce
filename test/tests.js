"use strict";
var tr = require('../'),
    test = require('tape');

function isOdd(x){return x % 2 === 1;}
function not(p){
  return function(v){
    return !p(v);
  };
}
var isEven = not(isOdd);
function identity(v){return v;}

test('map', function(t){
  t.plan(3);

  var doubled = tr.map(function(num){ return num * 2; });
  t.deepEqual([2,4,6], tr.toArray(doubled, [1,2,3]), 'can double');

  var tripled = tr.map(function(num){ return num * 3; });
  t.deepEqual([3,6,9], tr.toArray(tripled, [1,2,3]), 'can triple');

  doubled = tr.compose(
    tr.map(function(num){ return num * 2; }),
    tr.map(function(num){ return num * 3; }));
  t.deepEqual([6,12,18], tr.toArray(doubled, [1,2,3]), 'can double and triple in chain value');
});

test('reduce', function(t) {
  t.plan(2);

  var sum = tr.reduce(function(sum, num){ return sum + num; }, 0, [1,2,3]);
  t.equal(sum, 6, 'can sum up an array');

  var prod = tr.reduce(function(prod, num){ return prod * num; }, 1, [1, 2, 3, 4]);
  t.equal(prod, 24, 'can reduce via multiplication');
});

test('filter', function(t) {
  t.plan(1);

  var evenArray = [1, 2, 3, 4, 5, 6];

  t.deepEqual(tr.toArray(tr.filter(isEven), evenArray), [2, 4, 6]);
});

test('remove', function(t) {
  t.plan(1);

  var odds = tr.toArray(tr.remove(function(num){ return num % 2 === 0; }), [1, 2, 3, 4, 5, 6]);
  t.deepEqual(odds, [1, 3, 5], 'rejected each even number');
});

test('take', function(t) {
  t.plan(5);

  t.deepEqual(tr.toArray(tr.take(0), [1, 2, 3]), [], 'can pass an index to first');
  t.deepEqual(tr.toArray(tr.take(1), [1, 2, 3]), [1], 'can pull out the first element of an array');
  t.deepEqual(tr.toArray(tr.take(2), [1, 2, 3]), [1, 2], 'can pass an index to first');
  t.deepEqual(tr.toArray(tr.take(3), [1, 2, 3]), [1, 2, 3], 'can pass an index to first');
  t.strictEqual(tr.toArray(tr.take(-1), [1, 2, 3]).length, 0);
});

/*
test('takeWhile', function(t) {
  t.plan(4);

  t.deepEqual(tr.into([], tr.takeWhile(isOdd), [1, 2, 3]), [1]);
  t.deepEqual(tr.into([], tr.takeWhile(isEven), [1, 2, 3]), []);
  t.deepEqual(tr.into([], tr.takeWhile(isEven), [2, 2, 3]), [2,2]);
  t.deepEqual(tr.into([], tr.takeWhile(isOdd), [1, 3, 3]), [1, 3, 3]);
});
*/

test('drop', function(t) {
  t.plan(4);

  var numbers = [1, 2, 3, 4];
  t.deepEqual(tr.toArray(tr.drop(1), numbers), [2, 3, 4], 'working rest()');
  t.deepEqual(tr.toArray(tr.drop(0), numbers), [1, 2, 3, 4], 'working rest(0)');
  t.deepEqual(tr.toArray(tr.drop(-1), numbers), [1, 2, 3, 4], 'working rest(-1)');
  t.deepEqual(tr.toArray(tr.drop(2), numbers), [3, 4], 'rest can take an index');
});
/*
test('dropWhile', function(t) {
  t.plan(4);

  t.deepEqual(tr.into([], tr.dropWhile(isOdd), [1, 2, 3]), [2,3]);
  t.deepEqual(tr.into([], tr.dropWhile(isEven), [1, 2, 3]), [1,2,3]);
  t.deepEqual(tr.into([], tr.dropWhile(isEven), [2, 2, 3]), [3]);
  t.deepEqual(tr.into([], tr.dropWhile(isOdd), [1, 3, 3]), []);
});

test('cat', function(t) {
  t.plan(1);
  var res = tr.into([], tr.cat, [[1,2,3],[4,5,6],[7,8,9]]);
  t.deepEqual(res, [1,2,3,4,5,6,7,8,9]);
});


test('mapcat', function(t) {
  t.plan(1);
  var res = tr.into([], tr.mapcat(function(arr){return arr.reverse();}), [[3,2,1],[6,5,4],[9,8,7]]);
  t.deepEqual(res, [1,2,3,4,5,6,7,8,9]);
});

test('partitionBy', function(t) {
  t.plan(2);
  var result = tr.into([], tr.partitionBy(isOdd), [0,1,1,3,4,6,8,7,7,8]);
  t.deepEqual(result, [[0], [1,1,3], [4,6,8], [7,7], [8]]);
  var arr = [1,1,1,2,2,3,3,3];
  result = tr.into([], tr.compose(tr.partitionBy(identity), tr.take(2)), arr);
  t.deepEqual(result, [[1,1,1],[2,2]]);
});

test('partitionAll', function(t) {
  t.plan(3);
  var result = tr.into([], tr.partitionAll(2), [0,1,2,3,4,5,6,7,8,9]);
  t.deepEqual(result, [[0,1],[2,3],[4,5],[6,7],[8,9]]);
  result = tr.into([], tr.partitionAll(2), [0,1,2,3,4,5,6,7,8]);
  t.deepEqual(result, [[0,1],[2,3],[4,5],[6,7],[8]]);
  result = tr.into([], tr.compose(tr.partitionAll(2), tr.take(2)), [0,1,2,3,4,5,6,7,8,9]);
  t.deepEqual(result, [[0,1],[2,3]]);
});
*/
