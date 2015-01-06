!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.transduce=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict'

var reduced = require('./util/reduced'),
    isReduced = require('./util/isReduced'),
    reduce = require('./reduce')

module.exports =
function cat(xf){
  return new Cat(xf)
}
function Cat(xf){
  this.xf = new PreserveReduced(xf)
}
Cat.prototype.init = function(){
  return this.xf.init()
}
Cat.prototype.result = function(value){
  return this.xf.result(value)
}
Cat.prototype.step = function(value, item){
  return reduce(this.xf, value, item)
}

function PreserveReduced(xf){
  this.xf = xf
}
PreserveReduced.prototype.init = function(){
  return this.xf.init()
}
PreserveReduced.prototype.result = function(value){
  return this.xf.result(value)
}
PreserveReduced.prototype.step = function(value, item){
  value = this.xf.step(value, item)
  if(isReduced(value)){
    value = reduced(value, true)
  }
  return value
}

},{"./reduce":16,"./util/isReduced":33,"./util/reduced":38}],2:[function(require,module,exports){
'use strict'

module.exports =
function drop(n){
  return function(xf){
    return new Drop(n, xf)
  }
}
function Drop(n, xf){
  this.xf = xf
  this.n = n
}
Drop.prototype.init = function(){
  return this.xf.init()
}
Drop.prototype.result = function(value){
  return this.xf.result(value)
}
Drop.prototype.step = function(value, item){
  if(--this.n < 0){
    value = this.xf.step(value, item)
  }
  return value
}

},{}],3:[function(require,module,exports){
'use strict'

module.exports =
function dropWhile(p){
  return function(xf){
    return new DropWhile(p, xf)
  }
}
function DropWhile(p, xf){
  this.xf = xf
  this.p = p
}
DropWhile.prototype.init = function(){
  return this.xf.init()
}
DropWhile.prototype.result = function(value){
  return this.xf.result(value)
}
DropWhile.prototype.step = function(value, item){
  if(this.p){
    if(this.p(item)){
      return value
    }
    this.p = null
  }
  return this.xf.step(value, item)
}

},{}],4:[function(require,module,exports){
'use strict'
module.exports = filter

function filter(predicate) {
  return function(xf){
    return new Filter(predicate, xf)
  }
}
function Filter(f, xf) {
  this.xf = xf
  this.f = f
}
Filter.prototype.init = function(){
  return this.xf.init()
}
Filter.prototype.result = function(result){
  return this.xf.result(result)
}
Filter.prototype.step = function(result, input) {
  if(this.f(input)){
    result = this.xf.step(result, input)
  }
  return result
}

},{}],5:[function(require,module,exports){
'use strict'
module.exports = {
  protocols: {
    iterator: require('./iterator/symbol'),
    transformer: require('./transformer/symbol')
  },
  reduce: require('./reduce'),
  transduce: require('./transduce'),
  into: require('./into'),
  toArray: require('./toArray'),
  map: require('./map'),
  filter: require('./filter'),
  remove: require('./remove'),
  take: require('./take'),
  takeWhile: require('./takeWhile'),
  drop: require('./drop'),
  dropWhile: require('./dropWhile'),
  cat: require('./cat'),
  mapcat: require('./mapcat'),
  partitionAll: require('./partitionAll'),
  partitionBy: require('./partitionBy'),
  isIterable: require('./iterator/isIterable'),
  isIterator: require('./iterator/isIterator'),
  iterable: require('./iterator/iterable'),
  iterator: require('./iterator/iterator'),
  isTransformer: require('./transformer/isTransformer'),
  transformer: require('./transformer/transformer'),
  compose: require('./util/compose'),
  isReduced: require('./util/isReduced'),
  reduced: require('./util/reduced'),
  unreduced: require('./util/unreduced'),
  isFunction: require('./util/isFunction'),
  isArray: require('./util/isArray'),
  isString: require('./util/isString'),
  isRegExp: require('./util/isRegExp'),
  isNumber: require('./util/isNumber'),
  isUndefined: require('./util/isUndefined'),
  arrayPush: require('./util/arrayPush'),
  objectMerge: require('./util/objectMerge'),
  stringAppend: require('./util/stringAppend'),
  identity: require('./util/identity')
}

},{"./cat":1,"./drop":2,"./dropWhile":3,"./filter":4,"./into":6,"./iterator/isIterable":7,"./iterator/isIterator":8,"./iterator/iterable":9,"./iterator/iterator":10,"./iterator/symbol":11,"./map":12,"./mapcat":13,"./partitionAll":14,"./partitionBy":15,"./reduce":16,"./remove":17,"./take":18,"./takeWhile":19,"./toArray":20,"./transduce":21,"./transformer/isTransformer":22,"./transformer/symbol":23,"./transformer/transformer":24,"./util/arrayPush":27,"./util/compose":28,"./util/identity":29,"./util/isArray":30,"./util/isFunction":31,"./util/isNumber":32,"./util/isReduced":33,"./util/isRegExp":34,"./util/isString":35,"./util/isUndefined":36,"./util/objectMerge":37,"./util/reduced":38,"./util/stringAppend":39,"./util/unreduced":40}],6:[function(require,module,exports){
'use strict'
var transduce = require('./transduce')

module.exports =
function into(to, xf, from){
  return transduce(xf, to, to, from)
}

},{"./transduce":21}],7:[function(require,module,exports){
'use strict'
var symbol = require('./symbol')

module.exports =
function isIterable(value){
  return (value[symbol] !== void 0)
}

},{"./symbol":11}],8:[function(require,module,exports){
'use strict'
var isIterable = require('./isIterable'),
    isFunction = require('../util/isFunction')

module.exports =
function isIterator(value){
  return isIterable(value) ||
    isFunction(value.next)
}

},{"../util/isFunction":31,"./isIterable":7}],9:[function(require,module,exports){
'use strict'
var isIterable = require('./isIterable'),
    symbol = require('./symbol'),
    isArray = require('../util/isArray'),
    isFunction = require('../util/isFunction'),
    isString = require('../util/isString'),
    keys = Object.keys || _keys

module.exports =
function iterable(value){
  var it
  if(isIterable(value)){
    it = value
  } else if(isArray(value) || isString(value)){
    it = new ArrayIterable(value)
  } else if(isFunction(value)){
    it = new FunctionIterable(value)
  } else {
    it = new ObjectIterable(value)
  }
  return it
}

// Wrap an Array into an iterable
function ArrayIterable(arr){
  this.arr = arr
}
ArrayIterable.prototype[symbol] = function(){
  var arr = this.arr,
      idx = 0
  return {
    next: function(){
      if(idx >= arr.length){
        return {done: true}
      }

      return {done: false, value: arr[idx++]}
    }
  }
}

// Wrap an function into an iterable that calls function on every next
function FunctionIterable(fn){
  this.fn = fn
}
FunctionIterable.prototype[symbol] = function(){
  var fn = this.fn
  return {
    next: function(){
      return {done: false, value: fn()}
    }
  }
}

// Wrap an Object into an iterable. iterates [key, val]
function ObjectIterable(obj){
  this.obj = obj
  this.keys = keys(obj)
}
ObjectIterable.prototype[symbol] = function(){
  var obj = this.obj,
      keys = this.keys,
      idx = 0
  return {
    next: function(){
      if(idx >= keys.length){
        return {done: true}
      }
      var key = keys[idx++]
      return {done: false, value: [key, obj[key]]}
    }
  }
}

function _keys(obj){
  var prop, keys = []
  for(prop in obj){
    if(obj.hasOwnProperty(prop)){
      keys.push(prop)
    }
  }
  return keys
}

},{"../util/isArray":30,"../util/isFunction":31,"../util/isString":35,"./isIterable":7,"./symbol":11}],10:[function(require,module,exports){
'use strict'
var symbol = require('./symbol'),
    iterable = require('./iterable'),
    isFunction = require('../util/isFunction')

module.exports =
function iterator(value){
  var it = iterable(value)
  if(it !== void 0){
    it = it[symbol]()
  } else if(isFunction(value.next)){
    // handle non-well-formed iterators that only have a next method
    it = value
  }
  return it
}

},{"../util/isFunction":31,"./iterable":9,"./symbol":11}],11:[function(require,module,exports){
'use strict'
var /* global Symbol */
    /* jshint newcap:false */
    symbolExists = typeof Symbol !== 'undefined'
module.exports = symbolExists ? Symbol.iterator : '@@iterator'

},{}],12:[function(require,module,exports){
'use strict'
module.exports =
function map(callback) {
  return function(xf){
    return new Map(callback, xf)
  }
}
function Map(f, xf) {
  this.xf = xf
  this.f = f
}
Map.prototype.init = function(){
  return this.xf.init()
}
Map.prototype.result = function(result){
  return this.xf.result(result)
}
Map.prototype.step = function(result, input) {
  return this.xf.step(result, this.f(input))
}

},{}],13:[function(require,module,exports){
'use strict'
var compose = require('./util/compose'),
    map = require('./map'),
    cat = require('./cat')
module.exports =
function mapcat(callback) {
  return compose(map(callback), cat)
}

},{"./cat":1,"./map":12,"./util/compose":28}],14:[function(require,module,exports){
'use strict'
module.exports = partitionAll
function partitionAll(n) {
  return function(xf){
    return new PartitionAll(n, xf)
  }
}
function PartitionAll(n, xf) {
  this.xf = xf
  this.n = n
  this.inputs = []
}
PartitionAll.prototype.init = function(){
  return this.xf.init()
}
PartitionAll.prototype.result = function(result){
  var ins = this.inputs
  if(ins.length){
    this.inputs = []
    result = this.xf.step(result, ins)
  }
  return this.xf.result(result)
}
PartitionAll.prototype.step = function(result, input) {
  var ins = this.inputs,
      n = this.n
  ins.push(input)
  if(n === ins.length){
    this.inputs = []
    result = this.xf.step(result, ins)
  }
  return result
}

},{}],15:[function(require,module,exports){
'use strict'
var isReduced = require('./util/isReduced')

module.exports =
function partitionBy(f) {
  return function(xf){
    return new PartitionBy(f, xf)
  }
}
function PartitionBy(f, xf) {
  this.xf = xf
  this.f = f
}
PartitionBy.prototype.init = function(){
  return this.xf.init()
}
PartitionBy.prototype.result = function(result){
  var ins = this.inputs
  if(ins.length){
    this.inputs = []
    result = this.xf.step(result, ins)
  }
  return this.xf.result(result)
}
PartitionBy.prototype.step = function(result, input) {
  var ins = this.inputs,
      curr = this.f(input),
      prev = this.prev
  this.prev = curr

  if(ins === void 0){
    this.inputs = [input]
  } else if(prev === curr){
    ins.push(input)
  } else {
    this.inputs = []
    result = this.xf.step(result, ins)
    if(!isReduced(result)){
      this.inputs.push(input)
    }
  }
  return result
}

},{"./util/isReduced":33}],16:[function(require,module,exports){
'use strict'
var transformer = require('./transformer/transformer'),
    isReduced = require('./util/isReduced'),
    unreduced = require('./util/unreduced'),
    isArray = require('./util/isArray'),
    iterator = require('./iterator/iterator')

module.exports =
function reduce(xf, init, coll){
  xf = transformer(xf)
  if(isArray(coll)){
    return arrayReduce(xf, init, coll)
  }
  return iteratorReduce(xf, init, coll)
}

function arrayReduce(xf, init, arr){
  var value = init,
      i = 0,
      len = arr.length
  for(; i < len; i++){
    value = xf.step(value, arr[i])
    if(isReduced(value)){
      value = unreduced(value)
      break
    }
  }
  return xf.result(value)
}

function iteratorReduce(xf, init, iter){
  var value = init, next
  iter = iterator(iter)
  while(true){
    next = iter.next()
    if(next.done){
      break
    }

    value = xf.step(value, next.value)
    if(isReduced(value)){
      value = unreduced(value)
      break
    }
  }
  return xf.result(value)
}

},{"./iterator/iterator":10,"./transformer/transformer":24,"./util/isArray":30,"./util/isReduced":33,"./util/unreduced":40}],17:[function(require,module,exports){
'use strict'
var filter = require('./filter')

module.exports = remove
function remove(p){
  return filter(function(x){
    return !p(x)
  })
}


},{"./filter":4}],18:[function(require,module,exports){
'use strict'

var reduced = require('./util/reduced')

module.exports =
function take(n){
  return function(xf){
    return new Take(n, xf)
  }
}
function Take(n, xf){
  this.xf = xf
  this.n = n
}
Take.prototype.init = function(){
  return this.xf.init()
}
Take.prototype.result = function(value){
  return this.xf.result(value)
}
Take.prototype.step = function(value, item){
  if(this.n-- > 0){
    value = this.xf.step(value, item)
  }
  if(this.n <= 0){
    value = reduced(value)
  }
  return value
}

},{"./util/reduced":38}],19:[function(require,module,exports){
'use strict'
var reduced = require('./util/reduced')

module.exports =
function takeWhile(p){
  return function(xf){
    return new TakeWhile(p, xf)
  }
}
function TakeWhile(p, xf){
  this.xf = xf
  this.p = p
}
TakeWhile.prototype.init = function(){
  return this.xf.init()
}
TakeWhile.prototype.result = function(value){
  return this.xf.result(value)
}
TakeWhile.prototype.step = function(value, item){
  if(this.p(item)){
    value = this.xf.step(value, item)
  } else {
    value = reduced(value)
  }
  return value
}

},{"./util/reduced":38}],20:[function(require,module,exports){
'use strict'
var transduce = require('./transduce'),
    reduce = require('./reduce'),
    push = require('./util/arrayPush')

module.exports =
function toArray(xf, coll){
  var init = []
  if(coll === void 0){
    return reduce(push, init, xf)
  }
  return transduce(xf, push, init, coll)
}

},{"./reduce":16,"./transduce":21,"./util/arrayPush":27}],21:[function(require,module,exports){
'use strict'
var transformer = require('./transformer/transformer'),
    reduce = require('./reduce')

module.exports =
function transduce(xf, f, init, coll){
  f = transformer(f)
  return reduce(xf(f), init, coll)
}

},{"./reduce":16,"./transformer/transformer":24}],22:[function(require,module,exports){
'use strict'
var symbol = require('./symbol'),
    isFunction = require('../util/isFunction')

module.exports =
function isTransformer(value){
  return (value[symbol] !== void 0) ||
    (isFunction(value.step) && isFunction(value.result))
}

},{"../util/isFunction":31,"./symbol":23}],23:[function(require,module,exports){
'use strict'
var /* global Symbol */
    /* jshint newcap:false */
    symbolExists = typeof Symbol !== 'undefined'
module.exports = symbolExists ? Symbol('transformer') : '@@transformer'

},{}],24:[function(require,module,exports){
'use strict'
var undef,
    slice = Array.prototype.slice,
    symbol = require('./symbol'),
    isTransformer = require('./isTransformer'),
    isArray = require('../util/isArray'),
    isFunction = require('../util/isFunction'),
    isString = require('../util/isString'),
    identity = require('../util/identity'),
    arrayPush = require('../util/arrayPush'),
    objectMerge = require('../util/objectMerge'),
    stringAppend = require('../util/stringAppend')

module.exports =
function transformer(value){
  var xf
  if(isTransformer(value)){
    xf = value[symbol]
    if(xf === undef){
      xf = value
    }
  } else if(isFunction(value)){
    xf = new FunctionTransformer(value)
  } else if(isArray(value)){
    xf = new ArrayTransformer(value)
  } else if(isString(value)){
    xf = new StringTransformer(value)
  } else {
    xf = new ObjectTransformer(value)
  }
  return xf
}

// Pushes value on array, using optional constructor arg as default, or [] if not provided
// init will clone the default
// step will push input onto array and return result
// result is identity
function ArrayTransformer(arr){
  this.arrDefault = arr === undef ? [] : arr
}
ArrayTransformer.prototype.init = function(){
  return slice.call(this.arrDefault)
}
ArrayTransformer.prototype.step = arrayPush
ArrayTransformer.prototype.result = identity

// Turns a step function into a transfomer with init, step, result (init not supported and will error)
// Like transducers-js Wrap
function FunctionTransformer(step){
  this.step = step
}
FunctionTransformer.prototype.init = function(){
  throw new Error('Cannot init wrapped function, use proper transformer instead')
}
FunctionTransformer.prototype.step = function(result, input){
  return this.step(result, input)
}
FunctionTransformer.prototype.result = identity

// Appends value onto string, using optional constructor arg as default, or '' if not provided
// init will return the default
// step will append input onto string and return result
// result is identity
function StringTransformer(str){
  this.strDefault = str === undef ? '' : str
}
StringTransformer.prototype.init = function(){
  return this.strDefault
}
StringTransformer.prototype.step = stringAppend
StringTransformer.prototype.result = identity

// Merges value into object, using optional constructor arg as default, or {} if not provided
// init will clone the default
// step will merge input into object and return result
// result is identity
function ObjectTransformer(obj){
  this.objDefault = obj === undef ? {} : objectMerge({}, obj)
}
ObjectTransformer.prototype.init = function(){
  return objectMerge({}, this.objDefault)
}
ObjectTransformer.prototype.step = objectMerge
ObjectTransformer.prototype.result = identity

},{"../util/arrayPush":27,"../util/identity":29,"../util/isArray":30,"../util/isFunction":31,"../util/isString":35,"../util/objectMerge":37,"../util/stringAppend":39,"./isTransformer":22,"./symbol":23}],25:[function(require,module,exports){
'use strict'

module.exports =
function Reduced(value){
  this.value = value
  this.__transducers_reduced__ = true
}

},{}],26:[function(require,module,exports){
'use strict'
var toString = Object.prototype.toString

module.exports =
function predicateToString(type){
  var str = '[object '+type+']'
  return function(value){
    return toString.call(value) === str
  }
}

},{}],27:[function(require,module,exports){
'use strict'

module.exports =
function push(result, input){
  result.push(input)
  return result
}

},{}],28:[function(require,module,exports){
'use strict'

module.exports =
function compose(){
  var fns = arguments
  return function(xf){
    var i = fns.length
    while(i--){
      xf = fns[i](xf)
    }
    return xf
  }
}

},{}],29:[function(require,module,exports){
'use strict'

module.exports =
function identity(result){
  return result
}

},{}],30:[function(require,module,exports){
module.exports = Array.isArray || require('./_predicateToString')('Array')

},{"./_predicateToString":26}],31:[function(require,module,exports){
'use strict'

module.exports =
function isFunction(value){
  return typeof value === 'function'
}

},{}],32:[function(require,module,exports){
module.exports = require('./_predicateToString')('Number')

},{"./_predicateToString":26}],33:[function(require,module,exports){
'use strict'

module.exports =
function isReduced(value){
  return !!(value && value.__transducers_reduced__)
}

},{}],34:[function(require,module,exports){
module.exports = require('./_predicateToString')('RegExp')

},{"./_predicateToString":26}],35:[function(require,module,exports){
module.exports = require('./_predicateToString')('String')

},{"./_predicateToString":26}],36:[function(require,module,exports){
'use strict'

module.exports =
function isUndefined(value){
  return value === void 0
}

},{}],37:[function(require,module,exports){
'use strict'

var isArray = require('./isArray')

module.exports =
function objectMerge(result, input){
  if(isArray(input) && input.length === 2){
    result[input[0]] = input[1]
  } else {
    var prop
    for(prop in input){
      if(input.hasOwnProperty(prop)){
        result[prop] = input[prop]
      }
    }
  }
  return result
}

},{"./isArray":30}],38:[function(require,module,exports){
'use strict'

var isReduced = require('./isReduced'),
    Reduced = require('./_Reduced')

module.exports =
function reduced(value, force){
  if(force || !isReduced(value)){
    value = new Reduced(value)
  }
  return value
}

},{"./_Reduced":25,"./isReduced":33}],39:[function(require,module,exports){
'use strict'

module.exports =
function stringAppend(result, input){
  return result + input
}

},{}],40:[function(require,module,exports){
'use strict'

var isReduced = require('./isReduced')

module.exports =
function unreduced(value){
  if(isReduced(value)){
    value = value.value
  }
  return value
}

},{"./isReduced":33}]},{},[5])(5)
});