"use strict";
var util = require('transduce-util'),
    reduced = require('transduce-reduced'),
    iter = require('iterator-protocol'),
    transformer = require('transformer-protocol');

module.exports = {
  reduce: require('transduce-reduce'),
  transduce: require('transduce-transduce'),
  into: require('transduce-into'),
  toArray: require('transduce-toarray'),
  map: require('transduce-map'),
  filter: require('transduce-filter'),
  remove: require('transduce-remove'),
  take: require('transduce-take'),
  takeWhile: require('transduce-takewhile'),
  drop: require('transduce-drop'),
  dropWhile: require('transduce-dropwhile'),
  cat: require('transduce-cat'),
  mapcat: require('transduce-mapcat'),
  partitionAll: require('transduce-partitionall'),
  partitionBy: require('transduce-partitionby'),
  isIterable: iter.isIterable,
  isIterator: iter.isIterator,
  iterable: iter.iterable,
  iterator: iter.iterator,
  isTransformer: transformer.isTransformer,
  transformer: transformer.transformer,
  isReduced: reduced.isReduced,
  reduced: reduced.reduced,
  unreduced: reduced.unreduced,
  deref: reduced.unreduced,
  protocols: util.protocols,
  compose: util.compose,
  isFunction: util.isFunction,
  isArray: util.isArray,
  isString: util.isString,
  isRegExp: util.isRegExp,
  isNumber: util.isNumber,
  isUndefined: util.isUndefined,
  arrayPush: util.arrayPush,
  objectMerge: util.objectMerge,
  stringAppend: util.stringAppend,
  identity: util.identity,
};