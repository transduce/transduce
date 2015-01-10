!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.transduce=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict'
var some = require('./some')

// Determine if contains a given value (using `===`).
// Aliased as `include`.
// Early termination when item found.
module.exports =
function contains(target) {
  return some(function(x){return x === target })
}

},{"./some":9}],2:[function(require,module,exports){
'use strict'
var reduced = require('../util/reduced')

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

},{"../util/reduced":65}],3:[function(require,module,exports){
'use strict'
var reduced = require('../util/reduced')

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

},{"../util/reduced":65}],4:[function(require,module,exports){
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
var isReduced = require('../util/isReduced'),
    unreduced = require('../util/unreduced')

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

},{"../util/isReduced":60,"../util/unreduced":67}],6:[function(require,module,exports){
'use strict'
var isReduced = require('../util/isReduced'),
    unreduced = require('../util/unreduced')

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

},{"../util/isReduced":60,"../util/unreduced":67}],7:[function(require,module,exports){
'use strict'
var isReduced = require('../util/isReduced'),
    unreduced = require('../util/unreduced'),
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

},{"../util/isReduced":60,"../util/unreduced":67}],8:[function(require,module,exports){
'use strict'
var compose = require('../util/compose'),
    reduced = require('../util/reduced'),
    initial = require('./initial'),
    last = require('./last')

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


},{"../util/compose":55,"../util/reduced":65,"./initial":5,"./last":6}],9:[function(require,module,exports){
'use strict'
var reduced = require('../util/reduced')

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

},{"../util/reduced":65}],10:[function(require,module,exports){
'use strict'
var isReduced = require('../util/isReduced'),
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

},{"../util/isReduced":60}],11:[function(require,module,exports){
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

},{"./reduce":34,"./util/isReduced":60,"./util/reduced":65}],12:[function(require,module,exports){
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

},{}],13:[function(require,module,exports){
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

},{}],14:[function(require,module,exports){
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

},{}],15:[function(require,module,exports){
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
  forEach: require('./array/forEach'),
  find: require('./array/find'),
  every: require('./array/every'),
  some: require('./array/some'),
  contains: require('./array/contains'),
  push: require('./array/push'),
  unshift: require('./array/unshift'),
  slice: require('./array/slice'),
  initial: require('./array/initial'),
  last: require('./array/last'),
  min: require('./math/min'),
  max: require('./math/max'),
  tap: require('./push/tap'),
  asCallback: require('./push/asCallback'),
  asyncCallback: require('./push/asyncCallback'),
  lastValue: require('./push/lastValue'),
  split: require('./string/split'),
  join: require('./string/join'),
  nonEmpty: require('./string/nonEmpty'),
  lines: require('./string/lines'),
  chars: require('./string/chars'),
  words: require('./string/words'),
  unique: require('./unique/unique'),
  dedupe: require('./unique/dedupe'),
  isIterable: require('./iterator/isIterable'),
  isIterator: require('./iterator/isIterator'),
  iterable: require('./iterator/iterable'),
  iterator: require('./iterator/iterator'),
  sequence: require('./iterator/sequence'),
  iteratorToArray: require('./iterator/iteratorToArray'),
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

},{"./array/contains":1,"./array/every":2,"./array/find":3,"./array/forEach":4,"./array/initial":5,"./array/last":6,"./array/push":7,"./array/slice":8,"./array/some":9,"./array/unshift":10,"./cat":11,"./drop":12,"./dropWhile":13,"./filter":14,"./into":16,"./iterator/isIterable":17,"./iterator/isIterator":18,"./iterator/iterable":19,"./iterator/iterator":20,"./iterator/iteratorToArray":21,"./iterator/sequence":22,"./iterator/symbol":23,"./map":24,"./mapcat":25,"./math/max":26,"./math/min":27,"./partitionAll":28,"./partitionBy":29,"./push/asCallback":30,"./push/asyncCallback":31,"./push/lastValue":32,"./push/tap":33,"./reduce":34,"./remove":35,"./string/chars":36,"./string/join":37,"./string/lines":38,"./string/nonEmpty":39,"./string/split":40,"./string/words":41,"./take":42,"./takeWhile":43,"./toArray":44,"./transduce":45,"./transformer/isTransformer":46,"./transformer/symbol":47,"./transformer/transformer":48,"./unique/dedupe":50,"./unique/unique":51,"./util/arrayPush":54,"./util/compose":55,"./util/identity":56,"./util/isArray":57,"./util/isFunction":58,"./util/isNumber":59,"./util/isReduced":60,"./util/isRegExp":61,"./util/isString":62,"./util/isUndefined":63,"./util/objectMerge":64,"./util/reduced":65,"./util/stringAppend":66,"./util/unreduced":67}],16:[function(require,module,exports){
'use strict'
var transduce = require('./transduce')

module.exports =
function into(to, xf, from){
  return transduce(xf, to, to, from)
}

},{"./transduce":45}],17:[function(require,module,exports){
'use strict'
var symbol = require('./symbol')

module.exports =
function isIterable(value){
  return (value[symbol] !== void 0)
}

},{"./symbol":23}],18:[function(require,module,exports){
'use strict'
var isIterable = require('./isIterable'),
    isFunction = require('../util/isFunction')

module.exports =
function isIterator(value){
  return isIterable(value) ||
    isFunction(value.next)
}

},{"../util/isFunction":58,"./isIterable":17}],19:[function(require,module,exports){
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

},{"../util/isArray":57,"../util/isFunction":58,"../util/isString":62,"./isIterable":17,"./symbol":23}],20:[function(require,module,exports){
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

},{"../util/isFunction":58,"./iterable":19,"./symbol":23}],21:[function(require,module,exports){
'use strict'
var iterator = require('./iterator')

module.exports =
function toArray(iter){
  iter = iterator(iter)
  var next = iter.next(),
      arr = []
  while(!next.done){
    arr.push(next.value)
    next = iter.next()
  }
  return arr
}

},{"./iterator":20}],22:[function(require,module,exports){
'use strict'
var iterator = require('./iterator'),
    symbol = require('./symbol'),
    isReduced = require('../util/isReduced')

module.exports =
function sequence(xform, coll) {
  return new LazyIterable(xform, coll)
}

function LazyIterable(xform, coll){
  this.xform = xform
  this.coll = coll
}
LazyIterable.prototype[symbol] = function(){
  var iter = iterator(this.coll)
  return new LazyIterator(new Stepper(this.xform, iter))
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

function Stepper(xform, iter){
  this.xf = xform(stepTransformer)
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


},{"../util/isReduced":60,"./iterator":20,"./symbol":23}],23:[function(require,module,exports){
'use strict'
var /* global Symbol */
    /* jshint newcap:false */
    symbolExists = typeof Symbol !== 'undefined'
module.exports = symbolExists ? Symbol.iterator : '@@iterator'

},{}],24:[function(require,module,exports){
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

},{}],25:[function(require,module,exports){
'use strict'
var compose = require('./util/compose'),
    map = require('./map'),
    cat = require('./cat')
module.exports =
function mapcat(callback) {
  return compose(map(callback), cat)
}

},{"./cat":11,"./map":24,"./util/compose":55}],26:[function(require,module,exports){
'use strict'

var identity = require('../util/identity')

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

},{"../util/identity":56}],27:[function(require,module,exports){
'use strict'

var identity = require('../util/identity')

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

},{"../util/identity":56}],28:[function(require,module,exports){
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

},{}],29:[function(require,module,exports){
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

},{"./util/isReduced":60}],30:[function(require,module,exports){
'use strict'
var isReduced = require('../util/isReduced'),
    unreduced = require('../util/unreduced'),
    lastValue = require('./lastValue')

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
// If reducer is not defined, maintains last value and does not buffer results.
module.exports =
function asCallback(xf, reducer){
  var done = false, stepper, result

  if(reducer === void 0){
    reducer = lastValue
  }

  stepper = xf(reducer)
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

},{"../util/isReduced":60,"../util/unreduced":67,"./lastValue":32}],31:[function(require,module,exports){
'use strict'
var isReduced = require('../util/isReduced'),
    unreduced = require('../util/unreduced'),
    lastValue = require('./lastValue')

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
// If reducer is not defined, maintains last value and does not buffer results.
module.exports =
function asyncCallback(xf, continuation, reducer){
  var done = false, stepper, result

  if(reducer === void 0){
    reducer = lastValue
  }

  stepper = xf(reducer)
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

},{"../util/isReduced":60,"../util/unreduced":67,"./lastValue":32}],32:[function(require,module,exports){
'use strict'

module.exports = {
  init: function(){},
  step: function(result, input){return input},
  result: function(result){return result}
}

},{}],33:[function(require,module,exports){
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

},{}],34:[function(require,module,exports){
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

},{"./iterator/iterator":20,"./transformer/transformer":48,"./util/isArray":57,"./util/isReduced":60,"./util/unreduced":67}],35:[function(require,module,exports){
'use strict'
var filter = require('./filter')

module.exports = remove
function remove(p){
  return filter(function(x){
    return !p(x)
  })
}


},{"./filter":14}],36:[function(require,module,exports){
'use strict'
var split = require('./split')

module.exports =
function chars(limit){
  return split('', limit)
}

},{"./split":40}],37:[function(require,module,exports){
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

},{}],38:[function(require,module,exports){
'use strict'
var split = require('./split')

module.exports =
function lines(limit){
  return split('\n', limit)
}

},{"./split":40}],39:[function(require,module,exports){
'use strict'
var isString = require('../util/isString')

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

},{"../util/isString":62}],40:[function(require,module,exports){
'use strict'
var reduced = require('../util/reduced'),
    isRegExp = require('../util/isRegExp')

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

},{"../util/isRegExp":61,"../util/reduced":65}],41:[function(require,module,exports){
'use strict'
var compose = require('../util/compose'),
    isNumber = require('../util/isNumber'),
    split = require('./split'),
    nonEmpty = require('./nonEmpty')

module.exports =
function words(delimiter, limit) {
  if(delimiter === void 0 || isNumber(delimiter)){
    limit  = delimiter
    delimiter = /\s+/
  }
  return compose(split(delimiter, limit), nonEmpty())
}

},{"../util/compose":55,"../util/isNumber":59,"./nonEmpty":39,"./split":40}],42:[function(require,module,exports){
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

},{"./util/reduced":65}],43:[function(require,module,exports){
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

},{"./util/reduced":65}],44:[function(require,module,exports){
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

},{"./reduce":34,"./transduce":45,"./util/arrayPush":54}],45:[function(require,module,exports){
'use strict'
var transformer = require('./transformer/transformer'),
    reduce = require('./reduce')

module.exports =
function transduce(xf, f, init, coll){
  f = transformer(f)
  return reduce(xf(f), init, coll)
}

},{"./reduce":34,"./transformer/transformer":48}],46:[function(require,module,exports){
'use strict'
var symbol = require('./symbol'),
    isFunction = require('../util/isFunction')

module.exports =
function isTransformer(value){
  return (value[symbol] !== void 0) ||
    (isFunction(value.step) && isFunction(value.result))
}

},{"../util/isFunction":58,"./symbol":47}],47:[function(require,module,exports){
'use strict'
var /* global Symbol */
    /* jshint newcap:false */
    symbolExists = typeof Symbol !== 'undefined'
module.exports = symbolExists ? Symbol('transformer') : '@@transformer'

},{}],48:[function(require,module,exports){
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

},{"../util/arrayPush":54,"../util/identity":56,"../util/isArray":57,"../util/isFunction":58,"../util/isString":62,"../util/objectMerge":64,"../util/stringAppend":66,"./isTransformer":46,"./symbol":47}],49:[function(require,module,exports){
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
var _unique = require('./_unique')

module.exports =
function dedupe(){
  return _unique()
}

},{"./_unique":49}],51:[function(require,module,exports){
'use strict'
var _unique = require('./_unique')

module.exports =
function unique(f) {
  return _unique(f, true)
}

},{"./_unique":49}],52:[function(require,module,exports){
'use strict'

module.exports =
function Reduced(value){
  this.value = value
  this.__transducers_reduced__ = true
}

},{}],53:[function(require,module,exports){
'use strict'
var toString = Object.prototype.toString

module.exports =
function predicateToString(type){
  var str = '[object '+type+']'
  return function(value){
    return toString.call(value) === str
  }
}

},{}],54:[function(require,module,exports){
'use strict'

module.exports =
function push(result, input){
  result.push(input)
  return result
}

},{}],55:[function(require,module,exports){
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

},{}],56:[function(require,module,exports){
'use strict'

module.exports =
function identity(result){
  return result
}

},{}],57:[function(require,module,exports){
module.exports = Array.isArray || require('./_predicateToString')('Array')

},{"./_predicateToString":53}],58:[function(require,module,exports){
'use strict'

module.exports =
function isFunction(value){
  return typeof value === 'function'
}

},{}],59:[function(require,module,exports){
module.exports = require('./_predicateToString')('Number')

},{"./_predicateToString":53}],60:[function(require,module,exports){
'use strict'

module.exports =
function isReduced(value){
  return !!(value && value.__transducers_reduced__)
}

},{}],61:[function(require,module,exports){
module.exports = require('./_predicateToString')('RegExp')

},{"./_predicateToString":53}],62:[function(require,module,exports){
module.exports = require('./_predicateToString')('String')

},{"./_predicateToString":53}],63:[function(require,module,exports){
'use strict'

module.exports =
function isUndefined(value){
  return value === void 0
}

},{}],64:[function(require,module,exports){
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

},{"./isArray":57}],65:[function(require,module,exports){
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

},{"./_Reduced":52,"./isReduced":60}],66:[function(require,module,exports){
'use strict'

module.exports =
function stringAppend(result, input){
  return result + input
}

},{}],67:[function(require,module,exports){
'use strict'

var isReduced = require('./isReduced')

module.exports =
function unreduced(value){
  if(isReduced(value)){
    value = value.value
  }
  return value
}

},{"./isReduced":60}]},{},[15])(15)
});