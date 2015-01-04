!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.transduce=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

var tp = require('transduce-util'),
    reduce = require('./reduce');

module.exports = cat;
function cat(xf){
  return new Cat(xf);
}
function Cat(xf){
  this.xf = new PreserveReduced(xf);
}
Cat.prototype.init = function(){
  return this.xf.init();
};
Cat.prototype.result = function(value){
  return this.xf.result(value);
};
Cat.prototype.step = function(value, item){
  return reduce(this.xf, value, item);
};

function PreserveReduced(xf){
  this.xf = xf;
}
PreserveReduced.prototype.init = function(){
  return this.xf.init();
};
PreserveReduced.prototype.result = function(value){
  return this.xf.result(value);
};
PreserveReduced.prototype.step = function(value, item){
  value = this.xf.step(value, item);
  if(tp.isReduced(value)){
    value = tp.reduced(value, true);
  }
  return value;
};

},{"./reduce":14,"transduce-util":10}],2:[function(require,module,exports){
"use strict";

module.exports = drop;
function drop(n){
  return function(xf){
    return new Drop(n, xf);
  };
}
function Drop(n, xf){
  this.xf = xf;
  this.n = n;
}
Drop.prototype.init = function(){
  return this.xf.init();
};
Drop.prototype.result = function(value){
  return this.xf.result(value);
};
Drop.prototype.step = function(value, item){
  if(--this.n < 0){
    value = this.xf.step(value, item);
  }
  return value;
};

},{}],3:[function(require,module,exports){
"use strict";
var undef;

module.exports = dropWhile;
function dropWhile(p){
  return function(xf){
    return new DropWhile(p, xf);
  };
}
function DropWhile(p, xf){
  this.xf = xf;
  this.p = p;
}
DropWhile.prototype.init = function(){
  return this.xf.init();
};
DropWhile.prototype.result = function(value){
  return this.xf.result(value);
};
DropWhile.prototype.step = function(value, item){
  if(this.p){
    if(this.p(item)){
      return value;
    }
    this.p = undef;
  }
  return this.xf.step(value, item);
};

},{}],4:[function(require,module,exports){
"use strict";
module.exports = filter;

function filter(predicate) {
  return function(xf){
    return new Filter(predicate, xf);
  };
}
function Filter(f, xf) {
  this.xf = xf;
  this.f = f;
}
Filter.prototype.init = function(){
  return this.xf.init();
};
Filter.prototype.result = function(result){
  return this.xf.result(result);
};
Filter.prototype.step = function(result, input) {
  if(this.f(input)){
    result = this.xf.step(result, input);
  }
  return result;
};

},{}],5:[function(require,module,exports){
"use strict";
var util = require('transduce-util'),
    iter = require('iterator-protocol'),
    transformer = require('transformer-protocol');

module.exports = {
  reduce: require('./reduce'),
  transduce: require('./transduce'),
  into: require('./into'),
  toArray: require('./toarray'),
  map: require('./map'),
  filter: require('./filter'),
  remove: require('./remove'),
  take: require('./take'),
  takeWhile: require('./takewhile'),
  drop: require('./drop'),
  dropWhile: require('./dropwhile'),
  cat: require('./cat'),
  mapcat: require('./mapcat'),
  partitionAll: require('./partitionall'),
  partitionBy: require('./partitionby'),
  isIterable: iter.isIterable,
  isIterator: iter.isIterator,
  iterable: iter.iterable,
  iterator: iter.iterator,
  isTransformer: transformer.isTransformer,
  transformer: transformer.transformer,
  compose: util.compose,
  isReduced: util.isReduced,
  reduced: util.reduced,
  unreduced: util.unreduced,
  deref: util.unreduced,
  protocols: util.protocols,
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

},{"./cat":1,"./drop":2,"./dropwhile":3,"./filter":4,"./into":6,"./map":7,"./mapcat":8,"./partitionall":12,"./partitionby":13,"./reduce":14,"./remove":15,"./take":16,"./takewhile":17,"./toarray":18,"./transduce":19,"iterator-protocol":9,"transduce-util":10,"transformer-protocol":11}],6:[function(require,module,exports){
"use strict";
var transduce = require('./transduce');

module.exports = into;
function into(to, xf, from){
  return transduce(xf, to, to, from);
}

},{"./transduce":19}],7:[function(require,module,exports){
"use strict";
module.exports = map;
function map(callback) {
  return function(xf){
    return new Map(callback, xf);
  };
}
function Map(f, xf) {
  this.xf = xf;
  this.f = f;
}
Map.prototype.init = function(){
  return this.xf.init();
};
Map.prototype.result = function(result){
  return this.xf.result(result);
};
Map.prototype.step = function(result, input) {
  return this.xf.step(result, this.f(input));
};

},{}],8:[function(require,module,exports){
"use strict";
var compose = require('transduce-util').compose,
    map = require('./map'),
    cat = require('./cat');
module.exports = mapcat;
function mapcat(callback) {
  return compose(map(callback), cat);
}

},{"./cat":1,"./map":7,"transduce-util":10}],9:[function(require,module,exports){
"use strict";
/* global Symbol */
var util = require('transduce-util'),
    symbol = util.protocols.iterator,
    isFunction = util.isFunction,
    keys = Object.keys || _keys,
    undef;

module.exports = {
  symbol: symbol,
  isIterable: isIterable,
  isIterator: isIterator,
  iterable: iterable,
  iterator: iterator,
  toArray: toArray
};

function toArray(iter){
  iter = iterator(iter);
  var next = iter.next(),
      arr = [];
  while(!next.done){
    arr.push(next.value);
    next = iter.next();
  }
  return arr;
}

function isIterable(value){
  return (value[symbol] !== undef);
}

function isIterator(value){
  return isIterable(value) ||
    (isFunction(value.next));
}

function iterable(value){
  var it;
  if(isIterable(value)){
    it = value;
  } else if(util.isArray(value) || util.isString(value)){
    it = new ArrayIterable(value);
  } else if(isFunction(value)){
    it = new FunctionIterable(value);
  } else {
    it = new ObjectIterable(value);
  }
  return it;
}

function iterator(value){
  var it = iterable(value);
  if(it !== undef){
    it = it[symbol]();
  } else if(isFunction(value.next)){
    // handle non-well-formed iterators that only have a next method
    it = value;
  }
  return it;
}

// Wrap an Array into an iterable
function ArrayIterable(arr){
  this.arr = arr;
}
ArrayIterable.prototype[symbol] = function(){
  var arr = this.arr,
      idx = 0;
  return {
    next: function(){
      if(idx >= arr.length){
        return {done: true};
      }

      return {done: false, value: arr[idx++]};
    }
  };
};

// Wrap an function into an iterable that calls function on every next
function FunctionIterable(fn){
  this.fn = fn;
}
FunctionIterable.prototype[symbol] = function(){
  var fn = this.fn;
  return {
    next: function(){
      return {done: false, value: fn()};
    }
  };
};

// Wrap an Object into an iterable. iterates [key, val]
function ObjectIterable(obj){
  this.obj = obj;
  this.keys = keys(obj);
}
ObjectIterable.prototype[symbol] = function(){
  var obj = this.obj,
      keys = this.keys,
      idx = 0;
  return {
    next: function(){
      if(idx >= keys.length){
        return {done: true};
      }
      var key = keys[idx++];
      return {done: false, value: [key, obj[key]]};
    }
  };
};

function _keys(obj){
  var prop, keys = [];
  for(prop in obj){
    if(obj.hasOwnProperty(prop)){
      keys.push(prop);
    }
  }
  return keys;
}

},{"transduce-util":10}],10:[function(require,module,exports){
"use strict";
var undef,
    Arr = Array,
    toString = Object.prototype.toString,
    isArray = (isFunction(Arr.isArray) ? Arr.isArray : predicateToString('Array')),
    /* global Symbol */
    symbolExists = typeof Symbol !== 'undefined',
    symIterator = symbolExists ? Symbol.iterator : '@@iterator',
    /* jshint newcap:false */
    symTransformer = symbolExists ? Symbol('transformer') : '@@transformer',
    protocols = {
      iterator: symIterator,
      transformer: symTransformer
    };

module.exports = {
  protocols: protocols,
  compose: compose,
  isReduced: isReduced,
  reduced: reduced,
  unreduced: unreduced,
  deref: unreduced,
  isFunction: isFunction,
  isArray: isArray,
  isString: predicateToString('String'),
  isRegExp: predicateToString('RegExp'),
  isNumber: predicateToString('Number'),
  isUndefined: isUndefined,
  identity: identity,
  arrayPush: push,
  objectMerge: merge,
  stringAppend: append
};

function isFunction(value){
  return typeof value === 'function';
}

function isUndefined(value){
  return value === undef;
}

function predicateToString(type){
  var str = '[object '+type+']';
  return function(value){
    return toString.call(value) === str;
  };
}

function compose(){
  var fns = arguments;
  return function(xf){
    var i = fns.length;
    while(i--){
      xf = fns[i](xf);
    }
    return xf;
  };
}

function isReduced(value){
  return !!(value instanceof Reduced || value && value.__transducers_reduced__);
}

function reduced(value, force){
  if(force || !isReduced(value)){
    value = new Reduced(value);
  }
  return value;
}

function unreduced(value){
  if(isReduced(value)){
    value = value.value;
  }
  return value;
}

function Reduced(value){
  this.value = value;
  this.__transducers_reduced__ = true;
}

function identity(result){
  return result;
}

function push(result, input){
  result.push(input);
  return result;
}

function merge(result, input){
  if(isArray(input) && input.length === 2){
    result[input[0]] = input[1];
  } else {
    var prop;
    for(prop in input){
      if(input.hasOwnProperty(prop)){
        result[prop] = input[prop];
      }
    }
  }
  return result;
}

function append(result, input){
  return result + input;
}

},{}],11:[function(require,module,exports){
"use strict";
/* global Symbol */
var undef,
    util = require('transduce-util'),
    slice = Array.prototype.slice,
    symTransformer = util.protocols.transformer,
    isFunction = util.isFunction,
    identity = util.identity,
    merge = util.objectMerge;


module.exports = {
  symbol: symTransformer,
  isTransformer: isTransformer,
  transformer: transformer
};

function isTransformer(value){
  return (value[symTransformer] !== undef) ||
    (isFunction(value.step) && isFunction(value.result));
}

function transformer(value){
  var xf;
  if(isTransformer(value)){
    xf = value[symTransformer];
    if(xf === undef){
      xf = value;
    }
  } else if(isFunction(value)){
    xf = new FunctionTransformer(value);
  } else if(util.isArray(value)){
    xf = new ArrayTransformer(value);
  } else if(util.isString(value)){
    xf = new StringTransformer(value);
  } else {
    xf = new ObjectTransformer(value);
  }
  return xf;
}

// Pushes value on array, using optional constructor arg as default, or [] if not provided
// init will clone the default
// step will push input onto array and return result
// result is identity
function ArrayTransformer(arr){
  this.arrDefault = arr === undef ? [] : arr;
}
ArrayTransformer.prototype.init = function(){
  return slice.call(this.arrDefault);
};
ArrayTransformer.prototype.step = util.arrayPush;
ArrayTransformer.prototype.result = identity;

// Turns a step function into a transfomer with init, step, result (init not supported and will error)
// Like transducers-js Wrap
function FunctionTransformer(step){
  this.step = step;
}
FunctionTransformer.prototype.init = function(){
  throw new Error('Cannot init wrapped function, use proper transformer instead');
};
FunctionTransformer.prototype.step = function(result, input){
  return this.step(result, input);
};
FunctionTransformer.prototype.result = identity;

// Appends value onto string, using optional constructor arg as default, or '' if not provided
// init will return the default
// step will append input onto string and return result
// result is identity
function StringTransformer(str){
  this.strDefault = str === undef ? '' : str;
}
StringTransformer.prototype.init = function(){
  return this.strDefault;
};
StringTransformer.prototype.step = util.stringAppend;
StringTransformer.prototype.result = identity;

// Merges value into object, using optional constructor arg as default, or {} if not provided
// init will clone the default
// step will merge input into object and return result
// result is identity
function ObjectTransformer(obj){
  this.objDefault = obj === undef ? {} : merge({}, obj);
}
ObjectTransformer.prototype.init = function(){
  return merge({}, this.objDefault);
};
ObjectTransformer.prototype.step = merge;
ObjectTransformer.prototype.result = identity;

},{"transduce-util":10}],12:[function(require,module,exports){
"use strict";
module.exports = partitionAll;
function partitionAll(n) {
  return function(xf){
    return new PartitionAll(n, xf);
  };
}
function PartitionAll(n, xf) {
  this.xf = xf;
  this.n = n;
  this.inputs = [];
}
PartitionAll.prototype.init = function(){
  return this.xf.init();
};
PartitionAll.prototype.result = function(result){
  var ins = this.inputs;
  if(ins.length){
    this.inputs = [];
    result = this.xf.step(result, ins);
  }
  return this.xf.result(result);
};
PartitionAll.prototype.step = function(result, input) {
  var ins = this.inputs,
      n = this.n;
  ins.push(input);
  if(n === ins.length){
    this.inputs = [];
    result = this.xf.step(result, ins);
  }
  return result;
};

},{}],13:[function(require,module,exports){
"use strict";
var tp = require('transduce-util'),
    undef;

module.exports = partitionBy;
function partitionBy(f) {
  return function(xf){
    return new PartitionBy(f, xf);
  };
}
function PartitionBy(f, xf) {
  this.xf = xf;
  this.f = f;
}
PartitionBy.prototype.init = function(){
  return this.xf.init();
};
PartitionBy.prototype.result = function(result){
  var ins = this.inputs;
  if(ins.length){
    this.inputs = [];
    result = this.xf.step(result, ins);
  }
  return this.xf.result(result);
};
PartitionBy.prototype.step = function(result, input) {
  var ins = this.inputs,
      curr = this.f(input),
      prev = this.prev;
  this.prev = curr;

  if(ins === undef){
    this.inputs = [input];
  } else if(prev === curr){
    ins.push(input);
  } else {
    this.inputs = [];
    result = this.xf.step(result, ins);
    if(!tp.isReduced(result)){
      this.inputs.push(input);
    }
  }
  return result;
};

},{"transduce-util":10}],14:[function(require,module,exports){
"use strict";
var iter = require('iterator-protocol'),
    trans = require('transformer-protocol'),
    util = require('transduce-util'),
    isReduced = util.isReduced,
    deref = util.deref,
    transformer = trans.transformer,
    iterator = iter.iterator,
    isArray = util.isArray,
    undef;
module.exports = reduce;

function reduce(xf, init, coll){
  xf = transformer(xf);
  if(isArray(coll)){
    return arrayReduce(xf, init, coll);
  }
  return iteratorReduce(xf, init, coll);
}

function arrayReduce(xf, init, arr){
  var value = init,
      i = 0,
      len = arr.length;
  for(; i < len; i++){
    value = xf.step(value, arr[i]);
    if(isReduced(value)){
      value = deref(value);
      break;
    }
  }
  return xf.result(value);
}

function iteratorReduce(xf, init, iter){
  var value = init, next;
  iter = iterator(iter);
  while(true){
    next = iter.next();
    if(next.done){
      break;
    }

    value = xf.step(value, next.value);
    if(isReduced(value)){
      value = deref(value);
      break;
    }
  }
  return xf.result(value);
}

},{"iterator-protocol":9,"transduce-util":10,"transformer-protocol":11}],15:[function(require,module,exports){
"use strict";
var filter = require('./filter');

module.exports = remove;
function remove(p){
  return filter(function(x){
    return !p(x);
  });
}


},{"./filter":4}],16:[function(require,module,exports){
"use strict";

var tp = require('transduce-util');

module.exports = take;
function take(n){
  return function(xf){
    return new Take(n, xf);
  };
}
function Take(n, xf){
  this.xf = xf;
  this.n = n;
}
Take.prototype.init = function(){
  return this.xf.init();
};
Take.prototype.result = function(value){
  return this.xf.result(value);
};
Take.prototype.step = function(value, item){
  if(this.n-- > 0){
    value = this.xf.step(value, item);
  }
  if(this.n <= 0){
    value = tp.reduced(value);
  }
  return value;
};

},{"transduce-util":10}],17:[function(require,module,exports){
"use strict";
var reduced = require('transduce-util').reduced;

module.exports = takeWhile;
function takeWhile(p){
  return function(xf){
    return new TakeWhile(p, xf);
  };
}
function TakeWhile(p, xf){
  this.xf = xf;
  this.p = p;
}
TakeWhile.prototype.init = function(){
  return this.xf.init();
};
TakeWhile.prototype.result = function(value){
  return this.xf.result(value);
};
TakeWhile.prototype.step = function(value, item){
  if(this.p(item)){
    value = this.xf.step(value, item);
  } else {
    value = reduced(value);
  }
  return value;
};

},{"transduce-util":10}],18:[function(require,module,exports){
"use strict";
var transduce = require('./transduce'),
    reduce = require('./reduce'),
    util = require('transduce-util'),
    push = util.arrayPush,
    undef;

module.exports = toArray;
function toArray(xf, coll){
  var init = [];
  if(coll === undef){
    return reduce(push, init, xf);
  }
  return transduce(xf, push, init, coll);
}

},{"./reduce":14,"./transduce":19,"transduce-util":10}],19:[function(require,module,exports){
"use strict";
var tp = require('transformer-protocol'),
    reduce = require('./reduce'),
    transformer = tp.transformer;

module.exports = transduce;
function transduce(xf, f, init, coll){
  f = transformer(f);
  return reduce(xf(f), init, coll);
}

},{"./reduce":14,"transformer-protocol":11}]},{},[5])(5)
});