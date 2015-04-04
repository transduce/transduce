(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.transduce = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict'
var core = require(9),
    merge = core.util.objectMerge
module.exports = merge(merge({}, core), require(27))

},{"27":27,"9":9}],2:[function(require,module,exports){
'use strict'
var isReduced = require(11),
    unreduced = require(20),
    iterable = require(12),
    protocols = require(13),
    tp = protocols.transducer,
    util = require(21),
    isArray = util.isArray,
    isFunction = util.isFunction

module.exports = {
  transduce: transduce,
  reduce: reduce
}

function transduce(t, xf, init, coll) {
  return reduce(t(xf), init, coll)
}

function reduce(xf, init, coll){
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
    value = xf[tp.step](value, arr[i])
    if(isReduced(value)){
      value = unreduced(value)
      break
    }
  }
  return xf[tp.result](value)
}

function methodReduce(xf, init, coll){
  var result = coll.reduce(function(result, value){
    return xf[tp.step](result, value)
  }, init)
  return xf[tp.result](result)
}

function iteratorReduce(xf, init, iter){
  var value = init, next
  iter = iterable(iter)[protocols.iterator]()
  while(true){
    next = iter.next()
    if(next.done){
      break
    }

    value = xf[tp.step](value, next.value)
    if(isReduced(value)){
      value = unreduced(value)
      break
    }
  }
  return xf[tp.result](value)
}

},{"11":11,"12":12,"13":13,"20":20,"21":21}],3:[function(require,module,exports){
'use strict'
var transformer = require(19),
    isFunction = require(21).isFunction,
    tp = require(13).transducer

module.exports = function(core){
  var reduce = core.reduce,
      transduce = core.transduce

  return function into(init, t, coll){
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
        return reduce(xf, xf[tp.init](), coll)
      }
      return transduce(t, xf, xf[tp.init](), coll)
    }
  }

  function intoCurryXfT(xf, t){
    return function intoXfT(coll){
      return transduce(t, xf, xf[tp.init](), coll)
    }
  }
}

},{"13":13,"19":19,"21":21}],4:[function(require,module,exports){
'use strict'
var completing = require(6),
    util = require(21),
    isFunction = util.isFunction,
    tp = require(13).transducer

module.exports = function(core){
  return function reduce(xf, init, coll){
    if(isFunction(xf)){
      xf = completing(xf)
    }

    if (arguments.length === 2) {
      coll = init
      init = xf[tp.init]()
    }
    return core.reduce(xf, init, coll)
  }
}

},{"13":13,"21":21,"6":6}],5:[function(require,module,exports){
'use strict'
var completing = require(6),
    util = require(21),
    isFunction = util.isFunction,
    tp = require(13).transducer

module.exports = function(core){
  return function transduce(t, xf, init, coll) {
    if(isFunction(xf)){
      xf = completing(xf)
    }
    xf = t(xf)
    if (arguments.length === 3) {
      coll = init
      init = xf[tp.init]()
    }
    return core.reduce(xf, init, coll)
  }
}

},{"13":13,"21":21,"6":6}],6:[function(require,module,exports){
'use strict'
var identity = require(21).identity,
    tp = require(13).transducer

module.exports =
// Turns a step function into a transfomer with init, step, result
// If init not provided, calls `step()`.  If result not provided, calls `idenity`
function completing(rf, result){
  return new Completing(rf, result)
}
function Completing(rf, result){
  this[tp.init] = rf
  this[tp.step] = rf
  this[tp.result] = result || identity
}

},{"13":13,"21":21}],7:[function(require,module,exports){
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

},{}],8:[function(require,module,exports){
'use strict'
var transduce = require(17),
    sequence = require(16),
    symbol = require(13).iterator

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

},{"13":13,"16":16,"17":17}],9:[function(require,module,exports){
'use strict'
module.exports = {
  reduce: require(14),
  transduce: require(17),
  eduction: require(8),
  into: require(10),
  sequence: require(16),
  compose: require(7),
  isReduced: require(11),
  reduced: require(15),
  unreduced: require(20),
  completing: require(6),
  transformer: require(19),
  iterable: require(12),
  protocols: require(13),
  util: require(21)
}

},{"10":10,"11":11,"12":12,"13":13,"14":14,"15":15,"16":16,"17":17,"19":19,"20":20,"21":21,"6":6,"7":7,"8":8}],10:[function(require,module,exports){
'use strict'
module.exports = require(3)(require(2))

},{"2":2,"3":3}],11:[function(require,module,exports){
'use strict'

var tp = require(13).transducer

module.exports =
function isReduced(value){
  return !!(value && value[tp.reduced])
}

},{"13":13}],12:[function(require,module,exports){
'use strict'
var symbol = require(13).iterator,
    util = require(21),
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

},{"13":13,"21":21}],13:[function(require,module,exports){
var /* global Symbol */
    /* jshint newcap:false */
    symbolExists = typeof Symbol !== 'undefined',
    iterator = symbolExists ? Symbol.iterator : '@@iterator'

module.exports = {
  iterator: iterator,
  transducer: {
    init: '@@transducer/init',
    step: '@@transducer/step',
    result: '@@transducer/result',
    reduced: '@@transducer/reduced',
    value: '@@transducer/value'
  }
}

},{}],14:[function(require,module,exports){
'use strict'
module.exports = require(4)(require(2))

},{"2":2,"4":4}],15:[function(require,module,exports){
'use strict'

var isReduced = require(11),
    tp = require(13).transducer

module.exports =
function reduced(value, force){
  if(force || !isReduced(value)){
    value = new Reduced(value)
  }
  return value
}

function Reduced(value){
  this[tp.value] = value
  this[tp.reduced] = true
}

},{"11":11,"13":13}],16:[function(require,module,exports){
'use strict'
var isReduced = require(11),
    iterable = require(12),
    protocols = require(13),
    tp = protocols.transducer

module.exports =
function sequence(t, coll) {
  return new LazyIterable(t, coll)
}

function LazyIterable(t, coll){
  this.t = t
  this.coll = coll
}
LazyIterable.prototype[protocols.iterator] = function(){
  var iter = iterable(this.coll)[protocols.iterator]()
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
function StepTransformer(){}
StepTransformer.prototype[tp.init] = function(){}
StepTransformer.prototype[tp.step] = function(lt, input){
  lt.values.push(input)
  return lt
}
StepTransformer.prototype[tp.result] = function(lt){
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
      xf[tp.result](lt)
      break
    }

    result = xf[tp.step](lt, next.value)
    if(isReduced(result)){
      xf[tp.result](lt)
      break
    }
  }
}


},{"11":11,"12":12,"13":13}],17:[function(require,module,exports){
'use strict'
module.exports = require(5)(require(2))

},{"2":2,"5":5}],18:[function(require,module,exports){
'use strict'
var tp = require(13).transducer

module.exports =
function transducer(step, result, init) {
  return function(xf){
    return new Transducer(xf, step, result, init)
  }
}
function Transducer(xf, step, result, init) {
  this.xf = xf

  this.init = init
  this.step = step
  this.result = result

  this.context = {
    init: bindXf(xf, tp.init),
    step: bindXf(xf, tp.step),
    result: bindXf(xf, tp.result)
  }
}
Transducer.prototype[tp.init] = function(){
  var that = this.context
  return this.init ? this.init.call(that, that.init) : that.init()
}
Transducer.prototype[tp.step] = function(value, input){
  var that = this.context
  return this.step ? this.step.call(that, that.step, value, input) : that.step(value, input)
}
Transducer.prototype[tp.result] = function(value){
  var that = this.context
  return this.result ? this.result.call(that, that.result, value) : that.result(value)
}
function bindXf(xf, p){
  return function(){
    return xf[p].apply(xf, arguments)
  }
}

},{"13":13}],19:[function(require,module,exports){
'use strict'
var tp = require(13).transducer,
    completing = require(6),
    util = require(21),
    identity = util.identity,
    isArray = util.isArray,
    isFunction = util.isFunction,
    isString = util.isString,
    objectMerge = util.objectMerge,
    arrayPush = util.arrayPush,
    stringAppend = util.stringAppend,
    slice = Array.prototype.slice,
    lastValue = {}

lastValue[tp.init] = function(){}
lastValue[tp.step] = function(result, input){return input}
lastValue[tp.result] = identity

module.exports =
function transformer(value){
  var xf
  if(value === void 0 || value === null){
    xf = lastValue
  } else if(isFunction(value[tp.step])){
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
ArrayTransformer.prototype[tp.init] = function(){
  return slice.call(this.defaultValue)
}
ArrayTransformer.prototype[tp.step] = arrayPush
ArrayTransformer.prototype[tp.result] = identity


// Appends value onto string, using optional constructor arg as default, or '' if not provided
// init will return the default
// step will append input onto string and return result
// result is identity
function StringTransformer(str){
  this.strDefault = str === void 0 ? '' : str
}
StringTransformer.prototype[tp.init] = function(){
  return this.strDefault
}
StringTransformer.prototype[tp.step] = stringAppend
StringTransformer.prototype[tp.result] = identity

// Merges value into object, using optional constructor arg as default, or {} if undefined
// init will clone the default
// step will merge input into object and return result
// result is identity
function ObjectTransformer(obj){
  this.objDefault = obj === void 0 ? {} : objectMerge({}, obj)
}
ObjectTransformer.prototype[tp.init] = function(){
  return objectMerge({}, this.objDefault)
}
ObjectTransformer.prototype[tp.step] = objectMerge
ObjectTransformer.prototype[tp.result] = identity

},{"13":13,"21":21,"6":6}],20:[function(require,module,exports){
'use strict'

var isReduced = require(11),
    tp = require(13).transducer

module.exports =
function unreduced(value){
  if(isReduced(value)){
    value = value[tp.value]
  }
  return value
}

},{"11":11,"13":13}],21:[function(require,module,exports){
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

},{}],22:[function(require,module,exports){
'use strict'
var reduced = require(15),
    isReduced = require(11),
    reduce = require(14),
    transducer = require(18),
    transducerReduce = transducer(reduce),
    preserveReduced = transducer(function(step, value, input){
      value = step(value, input)
      return isReduced(value) ? reduced(value, true) : value
    })

module.exports =
function cat(xf){
  return transducerReduce(preserveReduced(xf))
}

},{"11":11,"14":14,"15":15,"18":18}],23:[function(require,module,exports){
'use strict'
var transducer = require(18)

module.exports =
function dedupe(){
  return transducer(function(step, value, input){
    if (!this.sawFirst || this.last !== input){
      value = step(value, input)
    }
    this.last = input
    this.sawFirst = true
    return value
  })
}

},{"18":18}],24:[function(require,module,exports){
'use strict'
var transducer = require(18)

module.exports =
function drop(n){
  return transducer(function(step, value, item){
    if(this.n === void 0) this.n = n
    return (--this.n < 0) ? step(value, item) : value
  })
}

},{"18":18}],25:[function(require,module,exports){
'use strict'
var transducer = require(18)

module.exports =
function dropWhile(p){
  return transducer(function(step, value, input){
    if(!this.found){
      if(p(input)){
        return value
      }
      this.found = true
    }
    return step(value, input)
  })
}

},{"18":18}],26:[function(require,module,exports){
'use strict'
var transducer = require(18)

module.exports =
function filter(predicate) {
  return transducer(function(step, value, input) {
    return predicate(input) ? step(value, input) : value
  })
}

},{"18":18}],27:[function(require,module,exports){
'use strict'
module.exports = {
  map: require(28),
  filter: require(26),
  remove: require(32),
  take: require(33),
  takeWhile: require(34),
  drop: require(24),
  dropWhile: require(25),
  cat: require(22),
  mapcat: require(29),
  partitionAll: require(30),
  partitionBy: require(31),
  unique: require(36),
  dedupe: require(23),
  tap: require(35)
}

},{"22":22,"23":23,"24":24,"25":25,"26":26,"28":28,"29":29,"30":30,"31":31,"32":32,"33":33,"34":34,"35":35,"36":36}],28:[function(require,module,exports){
'use strict'
var transducer = require(18)

module.exports =
function map(callback) {
  return transducer(function(step, value, input) {
    return step(value, callback(input))
  })
}

},{"18":18}],29:[function(require,module,exports){
'use strict'
var compose = require(7),
    map = require(28),
    cat = require(22)

module.exports =
function mapcat(callback) {
  return compose(map(callback), cat)
}

},{"22":22,"28":28,"7":7}],30:[function(require,module,exports){
'use strict'
var transducer = require(18)

module.exports =
function partitionAll(n) {
  return transducer(
    function(step, value, input){
      if(this.inputs === void 0){
        this.inputs = []
      }
      var ins = this.inputs
      ins.push(input)
      if(n === ins.length){
        this.inputs = []
        value = step(value, ins)
      }
      return value
    },
    function(result, value){
      var ins = this.inputs
      if(ins && ins.length){
        this.inputs = []
        value = this.step(value, ins)
      }
      return result(value)
    })
}

},{"18":18}],31:[function(require,module,exports){
'use strict'
var transducer = require(18),
    isReduced = require(11)

module.exports =
function partitionBy(f) {
  return transducer(
    function(step, value, input){
      var ins = this.inputs,
          curr = f(input),
          prev = this.prev
      this.prev = curr
      if(ins === void 0){
        this.inputs = [input]
      } else if(prev === curr){
        ins.push(input)
      } else {
        this.inputs = []
        value = step(value, ins)
        if(!isReduced(value)){
          this.inputs.push(input)
        }
      }
      return value
    },
    function(result, value){
      var ins = this.inputs
      if(ins && ins.length){
        this.inputs = []
        value = this.step(value, ins)
      }
      return result(value)
    })
}

},{"11":11,"18":18}],32:[function(require,module,exports){
'use strict'
var filter = require(26)

module.exports = remove
function remove(p){
  return filter(function(x){
    return !p(x)
  })
}


},{"26":26}],33:[function(require,module,exports){
'use strict'
var transducer = require(18),
    reduced = require(15)

module.exports =
function take(n){
  return transducer(function(step, value, item){
    if(this.n === void 0){
      this.n = n
    }
    if(this.n-- > 0){
      value = step(value, item)
    }
    if(this.n <= 0){
      value = reduced(value)
    }
    return value
  })
}

},{"15":15,"18":18}],34:[function(require,module,exports){
'use strict'
var transducer = require(18),
    reduced = require(15)

module.exports =
function takeWhile(p){
  return transducer(function(step, value, input){
    return p(input) ? step(value, input) : reduced(value)
  })
}

},{"15":15,"18":18}],35:[function(require,module,exports){
'use strict'
var transducer = require(18)

module.exports =
function tap(interceptor) {
  return transducer(function(step, value, input){
    interceptor(value, input)
    return step(value, input)
  })
}

},{"18":18}],36:[function(require,module,exports){
'use strict'
var transducer = require(18),
    identity = require(21).identity

module.exports =
function unique(f) {
  f = f || identity
  return transducer(function(step, value, input){
    if(this.seen === void 0){
      this.seen = []
    }
    var seen = this.seen,
        computed = f(input)
    if (seen.indexOf(computed) < 0) {
      seen.push(computed)
      value = step(value, input)
    }
    return value
  })
}

},{"18":18,"21":21}]},{},[1])(1)
});