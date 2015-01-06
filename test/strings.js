"use strict"
var tr = require('../'),
    test = require('tape')

function join(sep, arr){
  return tr.into([], tr.join(sep), arr)
}

test('Strings: join', function(t) {
  t.deepEqual(join('', ['', 'foo', 'bar']), ['foobar'], 'basic join')
  t.deepEqual(join('', ['', 1, 'foo', 2]), ['1foo2'], 'join numbers and strings')
  t.deepEqual(join(' ', (['foo', 'bar'])), ['foo bar'], 'join with spaces')
  t.deepEqual(join('1', ['2', '2']), ['212'], 'join number strings')
  t.deepEqual(join(1, ([2,2])), ['212'], 'join numbers')
  t.deepEqual(join('', ['foo', null]), ['foo'], 'join null with string returns string')
  t.end()
})

function split(sep, arr){
  return tr.into([], tr.split(sep), arr)
}
function splitLimit(sep, limit, arr){
  return tr.into([], tr.split(sep, limit), arr)
}
test('split', function(t){
  t.deepEqual(split(',', ['foo,bar']), ['foo','bar'])
  t.deepEqual(split(', ', ['foo,bar']), ['foo,bar'])
  t.deepEqual(split(', ', ['foo, bar']), ['foo','bar'])
  t.deepEqual(split(',', ['foo,bar,']), ['foo','bar',''])
  t.deepEqual(split(',', [',foo,,bar,']), ['','foo','','bar',''])

  t.deepEqual(split(',', ['foo', ',bar']), ['foo','bar'])
  t.deepEqual(split(',', ['foo,', 'bar']), ['foo','bar'])
  t.deepEqual(split(',', ['f', 'oo,', 'ba', 'r']), ['foo','bar'])
  t.deepEqual(split(',', ['', 'f', 'oo,', 'ba', 'r', '']), ['foo','bar'])
  t.deepEqual(split(',', ['', 'f', 'o', 'o', ',', 'ba', 'r', '', '']), ['foo','bar'])

  t.deepEqual(splitLimit(',', 1, ['foo,bar']), ['foo'])
  t.deepEqual(splitLimit(',', 1, ['foo', ',bar']), ['foo'])
  t.deepEqual(splitLimit(',', 1, ['', 'f', 'o', 'o', ',', 'ba', 'r', '', '']), ['foo'])

  t.deepEqual(split('$$$', ['foo$$$bar$$$baz$$']), ['foo','bar', 'baz$$'])
  t.deepEqual(split('$$$', ['foo$$$bar$$baz$$$']), ['foo','bar$$baz', ''])
  t.deepEqual(split('$$$', ['foo','$','$','$bar$', '$baz$', '$$']), ['foo','bar$$baz', ''])
  t.deepEqual(splitLimit('$$$', 2, ['foo','$','$','$bar$', '$baz$', '$$']), ['foo','bar$$baz'])
  t.deepEqual(splitLimit('$$$', 1, ['foo','$','$','$bar$', '$baz$', '$$']), ['foo'])

  t.deepEqual(split('', ['foo,bar']), 'foo,bar'.split(''))
  t.deepEqual(splitLimit('', 5, ['foo,bar']), 'foo,b'.split(''))
  t.deepEqual(splitLimit('', 5, ['foo,bar']), 'foo,b'.split(''))
  t.deepEqual(splitLimit('', 5, ['f','oo,', 'bar']), 'foo,b'.split(''))

  t.end()
})

function lines(arr, limit){
  return tr.into([], tr.lines(limit), arr)
}
test('lines', function(t) {
  t.equal(lines(['Hello\nWorld']).length, 2)
  t.equal(lines(['Hello World']).length, 1)
  t.equal(lines([123]).length, 1)
  t.equal(lines(['']).length, 1)
  t.equal(lines([null]).length, 0)

  t.deepEqual(lines(['Hello World']), ['Hello World'])
  t.deepEqual(lines(['Hello\nWorld']), ['Hello', 'World'])
  t.deepEqual(lines(['\nHello\n\nWorld\n']), ['', 'Hello', '', 'World', ''])
  t.deepEqual(lines(['\nH', 'el', 'lo\n', '\nW', 'orld\n']), ['', 'Hello', '', 'World', ''])
  t.deepEqual(lines(['\nHello\n\nWorld\n'], 2), ['', 'Hello'])

  t.end()
})

function chars(arr, limit){
  return tr.into([], tr.chars(limit), arr)
}
test('chars', function(t) {
  t.equal(chars(['Hello']).length, 5)
  t.equal(chars([123]).length, 3)
  t.equal(chars(['']).length, 0)
  t.equal(chars([null]).length, 0)

  t.deepEqual(chars(['foo,bar']), 'foo,bar'.split(''))
  t.deepEqual(chars(['foo,bar'], 5), 'foo,b'.split(''))
  t.deepEqual(chars(['f','oo,', 'bar'], 5), 'foo,b'.split(''))

  t.end()
})


function words(arr, sep){
  return tr.into([], tr.words(sep), arr)
}
test('words', function(t) {
  t.deepEqual(words(['I love you!']), ['I', 'love', 'you!'])
  t.deepEqual(words([' I  ', '  love   you! ',' ']), ['I', 'love', 'you!'])
  t.deepEqual(words(['I_love_you!'], '_'), ['I', 'love', 'you!'])
  t.deepEqual(words(['I-', 'love', '-you!'], /-/), ['I', 'love', 'you!'])
  t.deepEqual(words([123]), ['123'], '123 number has one word "123".')
  t.deepEqual(words([0]), ['0'], 'Zero number has one word "0".')
  t.deepEqual(words(['']), [], 'Empty strings has no words.')
  t.deepEqual(words(['   ']), [], 'Blank strings has no words.')
  t.deepEqual(words([' ','  ']), [], 'Blank strings has no words.')
  t.deepEqual(words([null]), [], 'null has no words.')
  t.end()
})
