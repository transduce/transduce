(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.transduce = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict'
var some = require(10)

// Determine if contains a given value (using `===`).
// Aliased as `include`.
// Early termination when item found.
module.exports =
function contains(target) {
  return some(function(x){return x === target })
}

},{"10":10}],2:[function(require,module,exports){
'use strict'
var reduced = require(22)

// Determine whether all of the elements match a truth test.
// Early termination if item does not match predicate.
module.exports =
function every(predicate) {
  return function(xf){
    return new Every(predicate, xf)
  }
}
function Every(f, xf) {
  this.xf = xf
  this.f = f
  this.found = false
}
Every.prototype.init = function(){
  return this.xf.init()
}
Every.prototype.result = function(result){
  if(!this.found){
    result = this.xf.step(result, true)
  }
  return this.xf.result(result)
}
Every.prototype.step = function(result, input) {
  if(!this.f(input)){
    this.found = true
    return reduced(this.xf.step(result, false))
  }
  return result
}

},{"22":22}],3:[function(require,module,exports){
'use strict'
var reduced = require(22)

// Return the first value which passes a truth test. Aliased as `detect`.
module.exports =
function find(predicate) {
   return function(xf){
     return new Find(predicate, xf)
   }
}
function Find(f, xf) {
  this.xf = xf
  this.f = f
}
Find.prototype.init = function(){
  return this.xf.init()
}
Find.prototype.result = function(result){
  return this.xf.result(result)
}
Find.prototype.step = function(result, input) {
  if(this.f(input)){
    result = reduced(this.xf.step(result, input))
  }
  return result
}

},{"22":22}],4:[function(require,module,exports){
'use strict'

// Executes f with f(input, idx, result) for forEach item
// passed through transducer without changing the result.
module.exports =
function forEach(f) {
  return function(xf){
    return new ForEach(f, xf)
  }
}
function ForEach(f, xf) {
  this.xf = xf
  this.f = f
  this.i = 0
}
ForEach.prototype.init = function(){
  return this.xf.init()
}
ForEach.prototype.result = function(result){
  return this.xf.result(result)
}
ForEach.prototype.step = function(result, input) {
  this.f(input, this.i++, result)
  return this.xf.step(result, input)
}

},{}],5:[function(require,module,exports){
'use strict'

module.exports = {
  forEach: require(4),
  find: require(3),
  every: require(2),
  some: require(10),
  contains: require(1),
  push: require(8),
  unshift: require(11),
  slice: require(9),
  initial: require(6),
  last: require(7)
}

},{"1":1,"10":10,"11":11,"2":2,"3":3,"4":4,"6":6,"7":7,"8":8,"9":9}],6:[function(require,module,exports){
'use strict'
var isReduced = require(18),
    unreduced = require(25)

// Returns everything but the last entry. Passing **n** will return all the values
// excluding the last N.
// Note that no items will be sent and all items will be buffered until completion.
module.exports =
function initial(n) {
  n = (n === void 0) ? 1 : (n > 0) ? n : 0
  return function(xf){
    return new Initial(n, xf)
  }
}
function Initial(n, xf) {
  this.xf = xf
  this.n = n
  this.idx = 0
  this.buffer = []
}
Initial.prototype.init = function(){
  return this.xf.init()
}
Initial.prototype.result = function(result){
  var idx = 0, count = this.idx - this.n, buffer = this.buffer
  for(idx = 0; idx < count; idx++){
    result = this.xf.step(result, buffer[idx])
    if(isReduced(result)){
      result = unreduced(result)
      break
    }
  }
  return this.xf.result(result)
}
Initial.prototype.step = function(result, input){
  this.buffer[this.idx++] = input
  return result
}

},{"18":18,"25":25}],7:[function(require,module,exports){
'use strict'
var isReduced = require(18),
    unreduced = require(25)

// Get the last element. Passing **n** will return the last N  values.
// Note that no items will be sent until completion.
module.exports =
function last(n) {
  if(n === void 0){
    n = 1
  } else {
    n = (n > 0) ? n : 0
  }
  return function(xf){
    return new Last(n, xf)
  }
}
function Last(n, xf) {
  this.xf = xf
  this.n = n
  this.idx = 0
  this.buffer = []
}
Last.prototype.init = function(){
  return this.xf.init()
}
Last.prototype.result = function(result){
  var n = this.n, count = n, buffer=this.buffer, idx=this.idx
  if(idx < count){
    count = idx
    idx = 0
  }
  while(count--){
    result = this.xf.step(result, buffer[idx++ % n])
    if(isReduced(result)){
      result = unreduced(result)
      break
    }
  }
  return this.xf.result(result)
}
Last.prototype.step = function(result, input){
  this.buffer[this.idx++ % this.n] = input
  return result
}

},{"18":18,"25":25}],8:[function(require,module,exports){
'use strict'
var isReduced = require(18),
    unreduced = require(25),
    _slice = Array.prototype.slice

// Adds one or more items to the end of the sequence, like Array.prototype.push.
module.exports =
function push(){
  var toPush = _slice.call(arguments)
  return function(xf){
    return new Push(toPush, xf)
  }
}
function Push(toPush, xf) {
  this.xf = xf
  this.toPush = toPush
}
Push.prototype.init = function(){
  return this.xf.init()
}
Push.prototype.result = function(result){
  var idx, toPush = this.toPush, len = toPush.length
  for(idx = 0; idx < len; idx++){
    result = this.xf.step(result, toPush[idx])
    if(isReduced(result)){
      result = unreduced(result)
      break
    }
  }
  return this.xf.result(result)
}
Push.prototype.step = function(result, input){
  return this.xf.step(result, input)
}

},{"18":18,"25":25}],9:[function(require,module,exports){
'use strict'
var compose = require(14),
    reduced = require(22),
    initial = require(6),
    last = require(7)

module.exports =
function slice(begin, end){
  if(begin === void 0){
    begin = 0
  }

  if(begin < 0){
    if(end === void 0){
      return last(-begin)
    }
    if(end >= 0){
      return compose(last(-begin), slice(0, end+begin+1))
    }
  }

  if(end < 0){
    if(begin === 0){
      return initial(-end)
    }
    return compose(slice(begin), initial(-end))
  }

  return function(xf){
    return new Slice(begin, end, xf)
  }
}
function Slice(begin, end, xf) {
  this.xf = xf
  if(begin === void 0){
    begin = 0
  }
  this.begin = begin
  this.end = end
  this.idx = 0
}
Slice.prototype.init = function(){
  return this.xf.init()
}
Slice.prototype.result = function(result){
  return this.xf.result(result)
}
Slice.prototype.step = function(result, input){
  if(this.idx++ >= this.begin){
    result = this.xf.step(result, input)
  }
  if(this.idx >= this.end){
    result = reduced(result)
  }
  return result 
}


},{"14":14,"22":22,"6":6,"7":7}],10:[function(require,module,exports){
'use strict'
var reduced = require(22)

// Determine if at least one element in the object matches a truth test.
// Aliased as `any`.
// Early termination if item matches predicate.
module.exports =
function some(predicate) {
  return function(xf){
    return new Some(predicate, xf)
  }
}
function Some(f, xf) {
  this.xf = xf
  this.f = f
  this.found = false
}
Some.prototype.init = function(){
  return this.xf.init()
}
Some.prototype.result = function(result){
  if(!this.found){
    result = this.xf.step(result, false)
  }
  return this.xf.result(result)
}
Some.prototype.step = function(result, input) {
  if(this.f(input)){
    this.found = true
    return reduced(this.xf.step(result, true))
  }
  return result
}

},{"22":22}],11:[function(require,module,exports){
'use strict'
var isReduced = require(18),
    _slice = Array.prototype.slice

// Adds one or more items to the beginning of the sequence, like Array.prototype.unshift.
module.exports =
function unshift(){
  var toUnshift = _slice.call(arguments)
  return function(xf){
    return new Unshift(toUnshift, xf)
  }
}
function Unshift(toUnshift, xf){
  this.xf = xf
  this.toUnshift = toUnshift
  this.idx = 0
}
Unshift.prototype.init = function(){
  return this.xf.init()
}
Unshift.prototype.result = function(result){
  return this.xf.result(result)
}
Unshift.prototype.step = function(result, input){
  var toUnshift = this.toUnshift
  if(toUnshift){
    var idx, len = toUnshift.length
    for(idx = 0; idx < len; idx++){
      result = this.xf.step(result, toUnshift[idx])
      if(isReduced(result)){
        return result
      }
    }
    this.toUnshift = null
  }
  return this.xf.step(result, input)
}

},{"18":18}],12:[function(require,module,exports){
'use strict'
var isReduced = require(18),
    unreduced = require(25),
    completing = require(13),
    iterable = require(19),
    protocols = require(20),
    util = require(26),
    isArray = util.isArray,
    isFunction = util.isFunction

module.exports = {
  transduce: transduce,
  reduce: reduce,
  _transduce: _transduce,
  _reduce: _reduce
}

function transduce(t, xf, init, coll) {
  if(isFunction(xf)){
    xf = completing(xf)
  }
  xf = t(xf)
  if (arguments.length === 3) {
    coll = init;
    init = xf.init();
  }
  return _reduce(xf, init, coll)
}

function _transduce(t, xf, init, coll) {
  return _reduce(t(xf), init, coll)
}

function reduce(xf, init, coll){
  if(isFunction(xf)){
    xf = completing(xf)
  }

  if (arguments.length === 2) {
    coll = init
    init = xf.init()
  }
  return _reduce(xf, init, coll)
}

function _reduce(xf, init, coll){
  if(isArray(coll)){
    return arrayReduce(xf, init, coll)
  }

  if(isFunction(coll.reduce)){
    return methodReduce(xf, init, coll)
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

function methodReduce(xf, init, coll){
  var result = coll.reduce(function(result, value){
    return xf.step(result, value)
  }, init)
  return xf.result(result)
}

function iteratorReduce(xf, init, iter){
  var value = init, next
  iter = iterable(iter)[protocols.iterator]()
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

},{"13":13,"18":18,"19":19,"20":20,"25":25,"26":26}],13:[function(require,module,exports){
'use strict'
var identity = require(26).identity

module.exports =
// Turns a step function into a transfomer with init, step, result
// If init not provided, calls `step()`.  If result not provided, calls `idenity`
function completing(rf, result){
  return new Completing(rf, result)
}
function Completing(rf, result){
  this.step = rf
  this.result = result || identity
}
Completing.prototype.init = function(){
  return this.step()
}

},{"26":26}],14:[function(require,module,exports){
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

},{}],15:[function(require,module,exports){
'use strict'
var transduce = require(12).transduce,
    sequence = require(23),
    symbol = require(20).iterator

module.exports =
function eduction(t, coll) {
  return new Eduction(t, coll)
}

function Eduction(t, coll){
  this.t = t
  this.coll = coll
}
Eduction.prototype[symbol] = function(){
  return sequence(this.t, this.coll)[symbol]()
}
Eduction.prototype.reduce = function(rf, init){
  return transduce(this.t, rf, init, this.coll)
}

},{"12":12,"20":20,"23":23}],16:[function(require,module,exports){
'use strict'
var core = require(12)
module.exports = {
  reduce: core.reduce,
  transduce: core.transduce,
  eduction: require(15),
  into: require(17),
  sequence: require(23),
  compose: require(14),
  isReduced: require(18),
  reduced: require(22),
  unreduced: require(25),
  completing: require(13),
  transformer: require(24),
  iterable: require(19),
  protocols: require(20),
  util: require(26)
}

},{"12":12,"13":13,"14":14,"15":15,"17":17,"18":18,"19":19,"20":20,"22":22,"23":23,"24":24,"25":25,"26":26}],17:[function(require,module,exports){
'use strict'
var core = require(12),
    transduce = core._transduce,
    reduce = core._reduce,
    transformer = require(24),
    isFunction = require(26).isFunction

module.exports =
function into(init, t, coll){
  var xf = transformer(init),
      len = arguments.length

  if(len === 1){
    return intoCurryXf(xf)
  }

  if(len === 2){
    if(isFunction(t)){
      return intoCurryXfT(xf, t)
    }
    coll = t
    return reduce(xf, init, coll)
  }
  return transduce(t, xf, init, coll)
}

function intoCurryXf(xf){
  return function intoXf(t, coll){
    if(arguments.length === 1){
      if(isFunction(t)){
        return intoCurryXfT(xf, t)
      }
      coll = t
      return reduce(xf, xf.init(), coll)
    }
    return transduce(t, xf, xf.init(), coll)
  }
}
function intoCurryXfT(xf, t){
  return function intoXfT(coll){
    return transduce(t, xf, xf.init(), coll)
  }
}

},{"12":12,"24":24,"26":26}],18:[function(require,module,exports){
'use strict'

module.exports =
function isReduced(value){
  return !!(value && value.__transducers_reduced__)
}

},{}],19:[function(require,module,exports){
'use strict'
var symbol = require(20).iterator,
    util = require(26),
    isArray = util.isArray,
    isFunction = util.isFunction,
    isString = util.isString,
    has = {}.hasOwnProperty,
    keys = Object.keys || _keys

module.exports =
function iterable(value){
  var it
  if(value[symbol] !== void 0){
    it = value
  } else if(isArray(value) || isString(value)){
    it = new ArrayIterable(value)
  } else if(isFunction(value)){
    it = new FunctionIterable(value)
  } else if(isFunction(value.next)){
    it = new FunctionIterable(callNext(value))
  } else {
    it = new ObjectIterable(value)
  }
  return it
}

function callNext(value){
  return function(){
    return value.next()
  }
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
    if(has.call(obj, prop)){
      keys.push(prop)
    }
  }
  return keys
}

},{"20":20,"26":26}],20:[function(require,module,exports){
var /* global Symbol */
    /* jshint newcap:false */
    symbolExists = typeof Symbol !== 'undefined',
    iterator = symbolExists ? Symbol.iterator : '@@iterator'
    transformer = symbolExists ? Symbol('transformer') : '@@transformer'

module.exports = {
  iterator: iterator,
  transformer: transformer
}

},{}],21:[function(require,module,exports){
'use strict'
module.exports = require(12).reduce

},{"12":12}],22:[function(require,module,exports){
'use strict'

var isReduced = require(18)

module.exports =
function reduced(value, force){
  if(force || !isReduced(value)){
    value = new Reduced(value)
  }
  return value
}

function Reduced(value){
  this.value = value
  this.__transducers_reduced__ = true
}

},{"18":18}],23:[function(require,module,exports){
'use strict'
var isReduced = require(18),
    iterable = require(19),
    symbol = require(20).iterator

module.exports =
function sequence(t, coll) {
  return new LazyIterable(t, coll)
}

function LazyIterable(t, coll){
  this.t = t
  this.coll = coll
}
LazyIterable.prototype[symbol] = function(){
  var iter = iterable(this.coll)[symbol]()
  return new LazyIterator(new Stepper(this.t, iter))
}

function LazyIterator(stepper){
  this.stepper = stepper
  this.values = []
}
LazyIterator.prototype.next = function(){
  var lt = this,
      values = lt.values,
      stepper = lt.stepper
  if(stepper && values.length === 0){
    stepper.step(lt)
  }
  return values.length ? {done: false, value: values.pop()} : {done: true}
}

var stepTransformer = new StepTransformer()
function StepTransformer(){
}
StepTransformer.prototype.init = function(){
  throw new Error('Cannot init')
}
StepTransformer.prototype.step = function(lt, input){
  lt.values.push(input)
  return lt
}
StepTransformer.prototype.result = function(lt){
  lt.stepper = null
  return lt
}

function Stepper(t, iter){
  this.xf = t(stepTransformer)
  this.iter = iter
}
Stepper.prototype.step = function(lt){
  var next, result,
      iter = this.iter,
      xf = this.xf,
      values = lt.values,
      prevLen = values.length
  while(prevLen === values.length){
    next = iter.next()
    if(next.done){
      xf.result(lt)
      break
    }

    result = xf.step(lt, next.value)
    if(isReduced(result)){
      xf.result(lt)
      break
    }
  }
}


},{"18":18,"19":19,"20":20}],24:[function(require,module,exports){
'use strict'
var symbol = require(20).transformer,
    completing = require(13),
    util = require(26),
    identity = util.identity,
    isArray = util.isArray,
    isFunction = util.isFunction,
    isString = util.isString,
    objectMerge = util.objectMerge,
    arrayPush = util.arrayPush,
    stringAppend = util.stringAppend,
    slice = Array.prototype.slice,
    lastValue = {
      init: function(){},
      step: function(result, input){return input},
      result: identity
    }

module.exports =
function transformer(value){
  var xf
  if(value === void 0){
    xf = lastValue
  } else if(value[symbol] !== void 0){
    xf = value[symbol]
  } else if(isFunction(value.step) && isFunction(value.result)){
    xf = value
  } else if(isFunction(value)){
    xf = completing(value)
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
function ArrayTransformer(defaultValue){
  this.defaultValue = defaultValue === void 0 ? [] : defaultValue
}
ArrayTransformer.prototype.init = function(){
  return slice.call(this.defaultValue)
}
ArrayTransformer.prototype.step = arrayPush
ArrayTransformer.prototype.result = identity


// Appends value onto string, using optional constructor arg as default, or '' if not provided
// init will return the default
// step will append input onto string and return result
// result is identity
function StringTransformer(str){
  this.strDefault = str === void 0 ? '' : str
}
StringTransformer.prototype.init = function(){
  return this.strDefault
}
StringTransformer.prototype.step = stringAppend
StringTransformer.prototype.result = identity

// Merges value into object, using optional constructor arg as default, or {} if undefined
// init will clone the default
// step will merge input into object and return result
// result is identity
function ObjectTransformer(obj){
  this.objDefault = obj === void 0 ? {} : objectMerge({}, obj)
}
ObjectTransformer.prototype.init = function(){
  return objectMerge({}, this.objDefault)
}
ObjectTransformer.prototype.step = objectMerge
ObjectTransformer.prototype.result = identity

},{"13":13,"20":20,"26":26}],25:[function(require,module,exports){
'use strict'

var isReduced = require(18)

module.exports =
function unreduced(value){
  if(isReduced(value)){
    value = value.value
  }
  return value
}

},{"18":18}],26:[function(require,module,exports){
'use strict'
var toString = Object.prototype.toString,
    isArray = (Array.isArray || predicateToString('Array')),
    has = {}.hasOwnProperty

module.exports = {
  isArray: isArray,
  isFunction: isFunction,
  isNumber: predicateToString('Number'),
  isRegExp: predicateToString('RegExp'),
  isString: predicateToString('String'),
  isUndefined: isUndefined,
  identity: identity,
  arrayPush: arrayPush,
  stringAppend: stringAppend,
  objectMerge: objectMerge
}

function isFunction(value){
  return typeof value === 'function'
}

function isUndefined(value){
  return value === void 0
}

function predicateToString(type){
  var str = '[object '+type+']'
  return function(value){
    return toString.call(value) === str
  }
}

function identity(result){
  return result
}

function arrayPush(result, input){
  result.push(input)
  return result
}

function stringAppend(result, input){
  return result + input
}

function objectMerge(result, input){
  if(isArray(input) && input.length === 2){
    result[input[0]] = input[1]
  } else {
    var prop
    for(prop in input){
      if(has.call(input, prop)){
        result[prop] = input[prop]
      }
    }
  }
  return result
}

},{}],27:[function(require,module,exports){
'use strict'
var core = require(16),
    merge = core.util.objectMerge
module.exports = merge(merge({
    array: require(5),
    string: require(43),
    math: require(35),
    push: require(40),
    iterators: require(31)
  }, core), require(55))

},{"16":16,"31":31,"35":35,"40":40,"43":43,"5":5,"55":55}],28:[function(require,module,exports){
'use strict'
var iterable = require(19),
    symbol = require(20).iterator,
    slice = [].slice,
    EMPTY = { next: function(){ return {done:true} } }

module.exports =
function chain(){
  return new Chain(slice.call(arguments))
}

function Chain(iters){
  this.iters = iters
}
Chain.prototype[symbol] = function(){
  var iters = slice.call(this.iters),
      it = shift()

  if(it === void 0) return EMPTY

  return {
    next: function(){
      var next = it.next()
      if(!next.done){
        return next
      }

      it = shift()
      if(it === void 0){
        return {done: true}
      }
      return it.next()
    }
  }

  function shift(){
    var itb = iters.shift()
    return itb && iterable(itb)[symbol]()
  }
}

},{"19":19,"20":20}],29:[function(require,module,exports){
"use strict"
var symbol = require(20).iterator

module.exports =
function count(start, step){
  return new Count(start, step)
}
function Count(start, step){
  if(start === void 0){
    start = 0
  }
  if(step === void 0){
    step = 1
  }
  this.start = start
  this.step = step
}
Count.prototype[symbol] = function(){
  var val = this.start, step = this.step
  return {
    next: function(){
      var prev = val
      val = val + step
      return {done: false, value: prev}
    }
  }
}

},{"20":20}],30:[function(require,module,exports){
'use strict'
var iterable = require(19),
    symbol = require(20).iterator

module.exports =
function cycle(iter){
  return new Cycle(iter)
}

function Cycle(iter){
  this.iter = iter
}
Cycle.prototype[symbol] = function(){
  var iter = this.iter, it = iterable(iter)[symbol]()
  return {
    next: function(){
      var next = it.next()
      if(next.done){
        it = iterable(iter)[symbol]()
        next = it.next()
      }
      return next
    }
  }
}

},{"19":19,"20":20}],31:[function(require,module,exports){
'use strict'
module.exports = {
  toArray: require(34),
  range: require(32),
  count: require(29),
  cycle: require(30),
  repeat: require(33),
  chain: require(28)
}

},{"28":28,"29":29,"30":30,"32":32,"33":33,"34":34}],32:[function(require,module,exports){
'use strict'
var symbol = require(20).iterator

module.exports =
function range(start, stop, step){
  return new Range(start, stop, step)
}
function Range(start, stop, step){
  if(step === void 0){
    step = 1
  }
  if(stop === void 0){
    stop = start
    start = 0
  }
  this.start = start
  this.stop = stop
  this.step = step
}
Range.prototype[symbol] = function(){
  var start = this.start,
      stop = this.stop,
      step = this.step,
      val = start
  return {
    next: function(){
      var prev = val
      val = val + step
      if(step > 0 && prev >= stop || step < 0 && prev <= stop){
        return {done: true}
      } else {
        return {done: false, value: prev}
      }
    }
  }
}

},{"20":20}],33:[function(require,module,exports){
'use strict'
var iterable = require(19),
    symbol = require(20).iterator

module.exports =
function repeat(elem, n){
  if(n === void 0){
    return iterable(function(){
      return elem
    })
  }
  return new Repeat(elem, n)
}

function Repeat(elem, n){
  this.elem = elem
  this.n = n
}
Repeat.prototype[symbol] = function(){
  var elem = this.elem, n = this.n,  idx = 1
  return {
    next: function(){
      if(idx++ > n){
        return {done: true}
      } else {
        return {done: false, value: elem}
      }
    }
  }
}

},{"19":19,"20":20}],34:[function(require,module,exports){
'use strict'
var iterable = require(19),
    symbol = require(20).iterator

module.exports =
function toArray(iter){
  iter = iterable(iter)[symbol]()
  var next = iter.next(),
      arr = []
  while(!next.done){
    arr.push(next.value)
    next = iter.next()
  }
  return arr
}

},{"19":19,"20":20}],35:[function(require,module,exports){
'use strict'
module.exports = {
  min: require(37),
  max: require(36)
}

},{"36":36,"37":37}],36:[function(require,module,exports){
'use strict'

var identity = require(26).identity

// Return the maximum element (or element-based computation).
module.exports =
function max(f) {
  if(!f){
    f = identity
  }
  return function(xf){
    return new Max(f, xf)
  }
}
function Max(f, xf) {
  this.xf = xf
  this.f = f
  this.computedResult = -Infinity
  this.lastComputed = -Infinity
}
Max.prototype.init = function(){
  return this.xf.init()
}
Max.prototype.result = function(result){
  result = this.xf.step(result, this.computedResult)
  return this.xf.result(result)
}
Max.prototype.step = function(result, input) {
  var computed = this.f(input)
  if (computed > this.lastComputed ||
      computed === -Infinity && this.computedResult === -Infinity) {
    this.computedResult = input
    this.lastComputed = computed
  }
  return result
}

},{"26":26}],37:[function(require,module,exports){
'use strict'

var identity = require(26).identity

// Return the minimum element (or element-based computation).
module.exports =
function min(f) {
  if(!f){
    f = identity
  }
  return function(xf){
    return new Min(f, xf)
  }
}
function Min(f, xf) {
  this.xf = xf
  this.f = f
  this.computedResult = Infinity
  this.lastComputed = Infinity
}
Min.prototype.init = function(){
  return this.xf.init()
}
Min.prototype.result = function(result){
  result = this.xf.step(result, this.computedResult)
  return this.xf.result(result)
}
Min.prototype.step = function(result, input) {
  var computed = this.f(input)
  if (computed < this.lastComputed ||
      computed === Infinity && this.computedResult === Infinity) {
    this.computedResult = input
    this.lastComputed = computed
  }
  return result
}

},{"26":26}],38:[function(require,module,exports){
'use strict'
var isReduced = require(18),
    unreduced = require(25),
    transformer = require(24)

// Creates a callback that starts a transducer process and accepts
// parameter as a new item in the process. Each item advances the state
// of the transducer. If the transducer exhausts due to early termination,
// all subsequent calls to the callback will no-op and return the computed result.
//
// If the callback is called with no argument, the transducer terminates,
// and all subsequent calls will no-op and return the computed result.
//
// The callback returns undefined until completion. Once completed, the result
// is always returned.
//
// If iniit, is not defined, maintains last value and does not buffer results.
module.exports =
function asCallback(t, init){
  var done = false, stepper, result,
      xf = transformer(init)
  stepper = t(xf)
  result = stepper.init()

  return function(item){
    if(done) return result

    if(item === void 0){
      // complete
      result = stepper.result(result)
      done = true
    } else {
      // step to next result.
      result = stepper.step(result, item)

      // check if exhausted
      if(isReduced(result)){
        result = stepper.result(unreduced(result))
        done = true
      }
    }

    if(done) return result
  }
}

},{"18":18,"24":24,"25":25}],39:[function(require,module,exports){
'use strict'
var isReduced = require(18),
    unreduced = require(25),
    transformer = require(24)

// Creates an async callback that starts a transducer process and accepts
// parameter cb(err, item) as a new item in the process. The returned callback
// and the optional continuation follow node conventions with  fn(err, item).
//
// Each item advances the state  of the transducer, if the continuation
// is provided, it will be called on completion or error. An error will terminate
// the transducer and be propagated to the continuation.  If the transducer
// exhausts due to early termination, any further call will be a no-op.
//
// If the callback is called with no item, it will terminate the transducer process.
//
// If init is not defined, maintains last value and does not buffer results.
module.exports =
function asyncCallback(t, continuation, init){
  var done = false, stepper, result,
      xf = transformer(init)

  stepper = t(xf)
  result = stepper.init()

  function checkDone(err, item){
    if(done){
      return true
    }

    err = err || null

    // check if exhausted
    if(isReduced(result)){
      result = unreduced(result)
      done = true
    }

    if(err || done || item === void 0){
      result = stepper.result(result)
      done = true
    }

    // notify if done
    if(done){
      if(continuation){
        continuation(err, result)
        continuation = null
      } else if(err){
        throw err
      }
      result = null
    }

    return done
  }

  return function(err, item){
    if(!checkDone(err, item)){
      try {
        // step to next result.
        result = stepper.step(result, item)
        checkDone(err, item)
      } catch(err2){
        checkDone(err2, item)
      }
    }
  }
}

},{"18":18,"24":24,"25":25}],40:[function(require,module,exports){
'use strict'
module.exports = {
  tap: require(41),
  asCallback: require(38),
  asyncCallback: require(39)
}

},{"38":38,"39":39,"41":41}],41:[function(require,module,exports){
'use strict'

// Invokes interceptor with each result and input, and then passes through input.
// The primary purpose of this method is to "tap into" a method chain, in
// order to perform operations on intermediate results within the chain.
// Executes interceptor with current result and input
module.exports =
function tap(interceptor) {
  return function(xf){
    return new Tap(interceptor, xf)
  }
}
function Tap(f, xf) {
  this.xf = xf
  this.f = f
}
Tap.prototype.init = function(){
  return this.xf.init()
}
Tap.prototype.result = function(result){
  return this.xf.result(result)
}
Tap.prototype.step = function(result, input) {
  this.f(result, input)
  return this.xf.step(result, input)
}

},{}],42:[function(require,module,exports){
'use strict'
var split = require(47)

module.exports =
function chars(limit){
  return split('', limit)
}

},{"47":47}],43:[function(require,module,exports){
'use strict'
module.exports = {
  split: require(47),
  join: require(44),
  nonEmpty: require(46),
  lines: require(45),
  chars: require(42),
  words: require(48)
}

},{"42":42,"44":44,"45":45,"46":46,"47":47,"48":48}],44:[function(require,module,exports){
'use strict'

module.exports =
function join(separator){
  return function(xf){
    return new Join(separator, xf)
  }
}
function Join(separator, xf){
  this.separator = separator
  this.xf = xf
  this.buffer = []
}
Join.prototype.init = function(){return this.xf.init()}
Join.prototype.step = function(result, input){
  this.buffer.push(input)
  return result
}
Join.prototype.result = function(result){
  result = this.xf.step(result, this.buffer.join(this.separator))
  return this.xf.result(result)
}

},{}],45:[function(require,module,exports){
'use strict'
var split = require(47)

module.exports =
function lines(limit){
  return split('\n', limit)
}

},{"47":47}],46:[function(require,module,exports){
'use strict'
var isString = require(26).isString

module.exports =
function nonEmpty(){
  return function(xf){
    return new NonEmpty(xf)
  }
}
function NonEmpty(xf){
  this.xf = xf
}
NonEmpty.prototype.init = function(){return this.xf.init()}
NonEmpty.prototype.step = function(result, input){
  if(isString(input) && input.trim().length){
    result = this.xf.step(result, input)
  }
  return result
}
NonEmpty.prototype.result = function(result){
  return this.xf.result(result)
}

},{"26":26}],47:[function(require,module,exports){
'use strict'
var reduced = require(22),
    isRegExp = require(26).isRegExp

module.exports =
function split(separator, limit){
  if(isRegExp(separator)){
    separator = cloneRegExp(separator)
  }
  return function(xf){
    return new Split(separator, limit, xf)
  }
}

function Split(separator, limit, xf){
  this.separator = separator
  this.xf = xf
  this.next = null
  this.idx = 0

  if(limit == void 0){
    limit = Infinity
  }
  this.limit = limit

  if(!isRegExp(separator) && separator !== ''){
    this.spliterate = spliterateString
  } else if(isRegExp(separator)){
    this.spliterate = spliterateRegExp
  } else {
    this.spliterate = spliterateChars
  }
}
Split.prototype.init = function(){return this.xf.init()}
Split.prototype.step = function(result, input){
  if(input === null || input === void 0){
    return result
  }

  var next = this.next,
      str = (next && next.value || '')+input,
      chunk = this.spliterate(str, this.separator)

  for(;;){
    this.next = next = chunk()
    if(next.done){
      break
    }

    result = this.xf.step(result, next.value)

    if(++this.idx >= this.limit){
      this.next = null
      result = reduced(result)
      break
    }
  }
  return result
}
Split.prototype.result = function(result){
  var next = this.next
  if(next && next.value !== null && next.value !== void 0){
    result = this.xf.step(result, next.value)
  }
  return this.xf.result(result)
}

function spliterateChars(str){
  var i = 0,  len = str.length,
      result = {done: false}
  return function(){
    result.value = str[i++]
    if(i >= len){
      result.done = true
    }
    return result
  }
}

function spliterateString(str, separator){
  var first, second, sepLen = separator.length,
      result = {done: false}
  return function(){
    first = (first === void 0) ? 0 : second + sepLen
    second = str.indexOf(separator, first)

    if(second < 0){
      result.done = true
      second = void 0
    }
    result.value = str.substring(first, second)
    return result
  }
}

function spliterateRegExp(str, pattern){
  var index, match,
      result = {done: false}
  pattern = cloneRegExp(pattern)
  return function(){
    match = pattern.exec(str)
    if(match){
      index = match.index
      result.value = str.substring(0, index)
      str = str.substring(index + match[0].length)
    } else {
      result.done = true
      result.value = str
    }
    return result
  }
}

function cloneRegExp(regexp){
  // From https://github.com/aheckmann/regexp-clone
  var flags = []
  if (regexp.global) flags.push('g')
  if (regexp.multiline) flags.push('m')
  if (regexp.ignoreCase) flags.push('i')
  return new RegExp(regexp.source, flags.join(''))
}

},{"22":22,"26":26}],48:[function(require,module,exports){
'use strict'
var compose = require(14),
    isNumber = require(26).isNumber,
    split = require(47),
    nonEmpty = require(46)

module.exports =
function words(delimiter, limit) {
  if(delimiter === void 0 || isNumber(delimiter)){
    limit  = delimiter
    delimiter = /\s+/
  }
  return compose(split(delimiter, limit), nonEmpty())
}

},{"14":14,"26":26,"46":46,"47":47}],49:[function(require,module,exports){
'use strict'
module.exports =
function _unique(f, buffer) {
   return function(xf){
     return new Uniq(f, !buffer, xf)
   }
}
function Uniq(f, isSorted, xf) {
  this.xf = xf
  this.f = f
  this.isSorted = isSorted
  this.seen = []
  this.i = 0
}
Uniq.prototype.init = function(){
  return this.xf.init()
}
Uniq.prototype.result = function(result){
  return this.xf.result(result)
}
Uniq.prototype.step = function(result, input){
  var seen = this.seen
  if (this.isSorted) {
    if (!this.i || seen !== input){
      result = this.xf.step(result, input)
    }
    this.seen = input
    this.i++
  } else if (this.f) {
    var computed = this.f(input)
    if (seen.indexOf(computed) < 0) {
      seen.push(computed)
      result = this.xf.step(result, input)
    }
  } else if (seen.indexOf(input) < 0) {
      seen.push(input)
      result = this.xf.step(result, input)
  }
  return result
}

},{}],50:[function(require,module,exports){
'use strict'

var reduced = require(22),
    isReduced = require(18),
    reduce = require(21)

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

},{"18":18,"21":21,"22":22}],51:[function(require,module,exports){
'use strict'
var _unique = require(49)

module.exports =
function dedupe(){
  return _unique()
}

},{"49":49}],52:[function(require,module,exports){
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

},{}],53:[function(require,module,exports){
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

},{}],54:[function(require,module,exports){
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

},{}],55:[function(require,module,exports){
'use strict'
module.exports = {
  map: require(56),
  filter: require(54),
  remove: require(60),
  take: require(61),
  takeWhile: require(62),
  drop: require(52),
  dropWhile: require(53),
  cat: require(50),
  mapcat: require(57),
  partitionAll: require(58),
  partitionBy: require(59),
  unique: require(64),
  dedupe: require(51),
  transformStep: require(63)
}

},{"50":50,"51":51,"52":52,"53":53,"54":54,"56":56,"57":57,"58":58,"59":59,"60":60,"61":61,"62":62,"63":63,"64":64}],56:[function(require,module,exports){
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

},{}],57:[function(require,module,exports){
'use strict'
var compose = require(14),
    map = require(56),
    cat = require(50)
module.exports =
function mapcat(callback) {
  return compose(map(callback), cat)
}

},{"14":14,"50":50,"56":56}],58:[function(require,module,exports){
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
  if(ins && ins.length){
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

},{}],59:[function(require,module,exports){
'use strict'
var isReduced = require(18)

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
  if(ins && ins.length){
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

},{"18":18}],60:[function(require,module,exports){
'use strict'
var filter = require(54)

module.exports = remove
function remove(p){
  return filter(function(x){
    return !p(x)
  })
}


},{"54":54}],61:[function(require,module,exports){
'use strict'

var reduced = require(22)

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

},{"22":22}],62:[function(require,module,exports){
'use strict'
var reduced = require(22)

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

},{"22":22}],63:[function(require,module,exports){
'use strict'
module.exports =
function transformStep(xfStep) {
  return function(xf){
    return new TransformStep(xfStep, xf)
  }
}
function TransformStep(xfStep, xf) {
  this.xf = xf
  this.xfStep = xfStep
  this.context = {}
}
TransformStep.prototype.init = function(){
  return this.xf.init()
}
TransformStep.prototype.step = function(result, input){
  return this.xfStep.call(this.context, this.xf, result, input)
}
TransformStep.prototype.result = function(result){
  return this.xf.result(result)
}

},{}],64:[function(require,module,exports){
'use strict'
var _unique = require(49)

module.exports =
function unique(f) {
  return _unique(f, true)
}

},{"49":49}]},{},[27])(27)
});