"use strict";
var protocol = require('transduce-protocol'),
    transduceToArray = protocol.transduceToArray,
    /*
    implFns = [
      'into', 'takeWhile',
      'dropWhile', 'cat', 'mapcat', 'partitionAll', 'partitionBy'],*/
    protocolFns = [
      'protocols', 'compose',
      'isIterable', 'isIterator', 'iterable', 'iterator',
      'isTransformer', 'transformer',
      'isReduced', 'reduced', 'unreduced', 'deref',
      'isFunction', 'isArray', 'arrayPush', 'identity'];

var exports = module.exports = {
  reduce: require('transduct-reduce'),
  transduce: require('transduct-transduce'),
  map: require('transduce-map'),
  filter: require('transduce-filter'),
  remove: require('transduce-remove'),
  drop: require('transduce-drop'),
  take: require('transduce-take')
};
exports.toArray = transduceToArray(exports);
exportProtocol(exports);

function exportProtocol(exports){
  var i = 0, len = protocolFns.length, fn;
  for(; i < len; i++){
    fn = protocolFns[i];
    exports[fn] = protocol[fn];
  }
}

