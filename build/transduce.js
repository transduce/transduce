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
var transducer = require(40),
    reduced = require(37)

module.exports =
function every(predicate) {
  return transducer(
    function(step, value, input){
      if(!predicate(input)){
        this.found = true
        return reduced(step(value, false))
      }
      return value
    },
    function(result, value){
      if(!this.found){
        value = this.step(value, true)
      }
      return result(value)
    })
}

},{"37":37,"40":40}],3:[function(require,module,exports){
'use strict'
var transducer = require(40),
    reduced = require(37)

// Return the first value which passes a truth test. Aliased as `detect`.
module.exports =
function find(predicate) {
  return transducer(function(step, value, input){
    if(predicate(input)){
      value = reduced(step(value, input))
    }
    return value
  })
}

},{"37":37,"40":40}],4:[function(require,module,exports){
'use strict'
var transducer = require(40)

// Executes f with f(input, idx, result) for forEach item
// passed through transducer without changing the result.
module.exports =
function forEach(f) {
  return transducer(function(step, value, input){
    if(this.idx === void 0){
      this.idx = 0
    }
    f(input, this.idx++, value)
    return step(value, input)
  })
}

},{"40":40}],5:[function(require,module,exports){
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
var transducer = require(40),
    isReduced = require(33),
    unreduced = require(42)

// Returns everything but the last entry. Passing **n** will return all the values
// excluding the last N.
// Note that no items will be sent and all items will be buffered until completion.
module.exports =
function initial(n) {
  n = (n === void 0) ? 1 : (n > 0) ? n : 0
  return transducer(
    function(step, value, input){
      if(this.buffer === void 0){
        this.n = n
        this.idx = 0
        this.buffer = []
      }
      this.buffer[this.idx++] = input
      return value
    },
    function(result, value){
      var idx = 0, count = this.idx - this.n, buffer = this.buffer
      for(idx = 0; idx < count; idx++){
        value = this.step(value, buffer[idx])
        if(isReduced(value)){
          value = unreduced(value)
          break
        }
      }
      return result(value)
    })
}

},{"33":33,"40":40,"42":42}],7:[function(require,module,exports){
'use strict'
var transducer = require(40),
    isReduced = require(33),
    unreduced = require(42)

// Get the last element. Passing **n** will return the last N  values.
// Note that no items will be sent until completion.
module.exports =
function last(n) {
  if(n === void 0){
    n = 1
  } else {
    n = (n > 0) ? n : 0
  }
  return transducer(
    function(step, value, input){
      if(this.buffer === void 0){
        this.n = n
        this.idx = 0
        this.buffer = []
      }
      this.buffer[this.idx++ % this.n] = input
      return value
    },
    function(result, value){
      var n = this.n, count = n, buffer=this.buffer, idx=this.idx
      if(idx < count){
        count = idx
        idx = 0
      }
      while(count--){
        value = this.step(value, buffer[idx++ % n])
        if(isReduced(value)){
          value = unreduced(value)
          break
        }
      }
      return result(value)
    })
}

},{"33":33,"40":40,"42":42}],8:[function(require,module,exports){
'use strict'
var transducer = require(40),
    isReduced = require(33),
    unreduced = require(42),
    _slice = Array.prototype.slice

// Adds one or more items to the end of the sequence, like Array.prototype.push.
module.exports =
function push(){
  var toPush = _slice.call(arguments)
  return transducer(
    null,
    function(result, value){
      var idx, len = toPush.length
      for(idx = 0; idx < len; idx++){
        value = this.step(value, toPush[idx])
        if(isReduced(value)){
          value = unreduced(value)
          break
        }
      }
      return result(value)
    })
}

},{"33":33,"40":40,"42":42}],9:[function(require,module,exports){
'use strict'
var transducer = require(40),
    compose = require(29),
    reduced = require(37),
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
  return transducer(function(step, value, input){
    if(this.idx === void 0){

      this.idx = 0
    }
    if(this.idx++ >= begin){
      value = step(value, input)
    }
    if(this.idx >= end){
      value = reduced(value)
    }
    return value
  })
}

},{"29":29,"37":37,"40":40,"6":6,"7":7}],10:[function(require,module,exports){
'use strict'
var transducer = require(40),
    reduced = require(37)

// Determine if at least one element in the object matches a truth test.
// Aliased as `any`.
// Early termination if item matches predicate.
module.exports =
function some(predicate) {
  return transducer(
    function(step, value, input){
      if(predicate(input)){
        this.found = true
        return reduced(step(value, true))
      }
      return value
    },
    function(result, value){
      if(!this.found){
        value = this.step(value, false)
      }
      return result(value)
    })
}

},{"37":37,"40":40}],11:[function(require,module,exports){
'use strict'
var transducer = require(40), 
    isReduced = require(33),
    _slice = Array.prototype.slice

// Adds one or more items to the beginning of the sequence, like Array.prototype.unshift.
module.exports =
function unshift(){
  var toUnshift = _slice.call(arguments)
  return transducer(function(step, value, input){
    if(!this.done){
      var idx, len = toUnshift.length
      this.done = true
      for(idx = 0; idx < len; idx++){
        value = step(value, toUnshift[idx])
        if(isReduced(value)){
          return value
        }
      }
    }
    return step(value, input)
  })
}

},{"33":33,"40":40}],12:[function(require,module,exports){
'use strict'
var Prom = require(48),
    isReduced = require(33),
    unreduced = require(42),
    transformer = require(41),
    iterable = require(34),
    protocols = require(35),
    tp = protocols.transducer

module.exports = {
  transduce: transduce,
  reduce: reduce
}

var _transduce = spread(__transduce),
    _reduce = spread(__reduce)
function spread(fn, ctx){
  return function(arr){
    return fn.apply(ctx, arr)
  }
}

function transduce(t, xf, init, coll){
  return Prom
    .all([t, xf, init, coll])
    .then(_transduce)
}

function __transduce(t, xf, init, coll){
  xf = transformer(xf)
  xf = t(xf)
  return reduce(xf, init, coll)
}

function reduce(xf, init, coll){
  if(coll === void 0){
    coll = init
    init = xf.init()
  }
  return Prom
    .all([xf, init, coll])
    .then(_reduce)
}

function __reduce(xf, init, coll){
  xf = transformer(xf)
  var reduce = new Reduce(_iterator(coll), init, xf)
  return reduce.iterate()
}
function Reduce(iter, init, xf){
  var self = this
  self.xf = xf
  self.iter = iter
  self.value = init
  self._step = spread(self.__step, self)
  self._loop = spread(self.__loop, self)
}
Reduce.prototype.iterate = function(){
  var self = this
  return Prom
    .all([self.next()])
    .then(self._step)
}
Reduce.prototype.next = function(){
  var self = this
  return new Prom(function(resolve, reject){
    try {
      var item = self.iter.next()
      if(!item.done){
        item = Prom
          .all([item.value])
          .then(_iteratorValue)
      }
      resolve(item)
    } catch(e){
      reject(e)
    }
  })
}
Reduce.prototype.__step = function(item){
  var self = this
  return new Prom(function(resolve, reject){
    try {
      var result
      if(item.done){
        result = self.xf[tp.result](self.value)
      } else {
        result = Prom
          .all([self.xf[tp.step](self.value, item.value)])
          .then(self._loop)
      }
      resolve(result)
    } catch(e){
      reject(e)
    }
  })
}
Reduce.prototype.__loop = function(value){
  var self = this
  self.value = value
  return new Prom(function(resolve, reject){
    try {
      var result
      if(isReduced(value)){
        result = self.xf[tp.result](unreduced(value))
      } else {
        result = self.iterate()
      }
      resolve(result)
    } catch(e){
      reject(e)
    }
  })
}

function _iterator(coll){
  return iterable(coll)[protocols.iterator]()
}

function _iteratorValue(item){
  return {done: false, value: item[0]}
}

},{"33":33,"34":34,"35":35,"41":41,"42":42,"48":48}],13:[function(require,module,exports){
'use strict'
var isReduced = require(33),
    unreduced = require(42),
    transformer = require(41),
    tp = require(35).transducer

module.exports =
function callback(t, init, continuation){
  var done = false, stepper, value,
      xf = transformer(init)

  stepper = t(xf)
  value = stepper[tp.init]()

  function checkDone(err, item){
    if(done){
      return true
    }

    err = err || null

    // check if exhausted
    if(isReduced(value)){
      value = unreduced(value)
      done = true
    }

    if(err || done || item === void 0){
      value = stepper[tp.result](value)
      done = true
    }

    // notify if done
    if(done){
      if(continuation){
        continuation(err, value)
        continuation = null
        value = null
      } else if(err){
        value = null
        throw err
      }
    }

    return done
  }

  return function(err, item){
    if(!checkDone(err, item)){
      try {
        // step to next result.
        value = stepper[tp.step](value, item)
        checkDone(err, item)
      } catch(err2){
        checkDone(err2, item)
      }
    }
    if(done) return value
  }
}

},{"33":33,"35":35,"41":41,"42":42}],14:[function(require,module,exports){
'use strict'
var defer = require(15),
    comp = require(29)

module.exports =
function compose(/*args*/){
  var toArgs = [],
      fromArgs = arguments,
      len = fromArgs.length,
      i = 0
  for(; i < len; i++){
    toArgs.push(fromArgs[i])
    toArgs.push(defer())
  }
  return comp.apply(null, toArgs)
}

},{"15":15,"29":29}],15:[function(require,module,exports){
'use strict'
var delay = require(16)

module.exports =
function defer() {
  return delay()
}

},{"16":16}],16:[function(require,module,exports){
'use strict'
var Prom = require(48),
    tp = require(35).transducer

module.exports = 
function delay(wait) {
  return function(xf){
    return new Delay(wait, xf)
  }
}
function Delay(wait, xf) {
  var self = this,
      task = new DelayTask(wait, xf)
  self.xf = xf
  self.task = task
  self._step = spread(task.step, task)
  self._result = spread(task.result, task)
}

Delay.prototype[tp.init] = function(){
  var self = this,
      task = self.task
  if(task.resolved){
    return task.resolved
  }

  return Prom
    .resolve(self.xf[tp.init]())
}
Delay.prototype[tp.step] = function(value, input) {
  var self = this,
      task = self.task
  if(task.resolved){
    return task.resolved
  }

  return Prom
    .all([value, input])
    .then(self._step)
}
Delay.prototype[tp.result] = function(value){
  var self = this,
      task = self.task
  if(task.resolved){
    return task.resolved
  }

  return Prom
    .all([value])
    .then(self._result)
}

function DelayTask(wait, xf){
  this.wait = wait
  this.xf = xf
  this.q = []
}
DelayTask.prototype.call = function(){
  var next = this.q[0]
  if(next && !next.processing){
    next.processing = true

    var wait = next.wait
    if(wait > 0){
      setTimeout(next.fn, wait)
    } else {
      next.fn()
    }
  }
}
DelayTask.prototype.step = function(value, input){
  var task = this
  return new Prom(function(resolve, reject){
    task.q.push({fn: step, wait: task.wait})
    task.call()

    function step(){
      try {
        resolve(task.xf[tp.step](value, input))
        task.q.shift()
        if(task.q.length > 0){
          task.call()
        }
      } catch(e){
        reject(e)
      }
    }
  })
}
DelayTask.prototype.result = function(value){
  var task = this
  task.resolved = new Prom(function(resolve, reject){
    task.q.push({fn: result})
    task.call()
    function result(){
      try {
        task.q = []
        resolve(task.xf[tp.result](value))
      } catch(e){
        reject(e)
      }
    }
  })
  return task.resolved
}

function spread(fn, ctx){
  return function(arr){
    return fn.apply(ctx, arr)
  }
}

},{"35":35,"48":48}],17:[function(require,module,exports){
'use strict'
var compose = require(29),
    tap = require(69),
    callback = require(13)

module.exports =
function emitInto(to, t, from){
  var cb
  t = compose(t, tap(emitItem))
  cb = callback(t, null, continuation)
  from.on('data', onData)
  from.once('error', onError)
  from.once('end', onEnd)

  function emitItem(result, item){
    to.emit('data', item)
  }

  function continuation(err){
    if(err) to.emit('error', err)
    to.emit('end')
  }

  function onData(item){
    cb(null, item)
  }

  function onError(err){
    cb(err)
  }

  function onEnd(){
    cb()
    removeListeners()
  }

  function removeListeners(){
    from.removeListener(onData)
        .removeListener(onError)
        .removeListener(onEnd)
  }

  return to
}

},{"13":13,"29":29,"69":69}],18:[function(require,module,exports){
'use strict'

module.exports = {
  compose: require(14),
  transduce: require(22),
  reduce: require(21),
  into: require(19),
  defer: require(15),
  delay: require(16),
  callback: require(13),
  when: require(23),
  promiseTransform: require(20),
  emitInto: require(17)
}

},{"13":13,"14":14,"15":15,"16":16,"17":17,"19":19,"20":20,"21":21,"22":22,"23":23}],19:[function(require,module,exports){
'use strict'
module.exports = require(25)(require(12))

},{"12":12,"25":25}],20:[function(require,module,exports){
'use strict'
var Prom = require(48),
    callback = require(13)

module.exports =
function promiseTransform(t){
  return function(item){
    return new Prom(function(resolve, reject){
      var cb = callback(t, null, function(err, result){
        if(err) reject(err)
        else resolve(result)
      })
      cb(null, item)
      cb()
    })
  }
}

},{"13":13,"48":48}],21:[function(require,module,exports){
'use strict'
module.exports = require(26)(require(12))

},{"12":12,"26":26}],22:[function(require,module,exports){
'use strict'
module.exports = require(27)(require(12))

},{"12":12,"27":27}],23:[function(require,module,exports){
'use strict'
var Prom = require(48),
    promiseTransform = require(20)

module.exports =
function when(promiseOrValue, t){
  return new Prom(function(resolve){
    resolve(promiseOrValue)
  }).then(promiseTransform(t))
}

},{"20":20,"48":48}],24:[function(require,module,exports){
'use strict'
var isReduced = require(33),
    unreduced = require(42),
    iterable = require(34),
    protocols = require(35),
    tp = protocols.transducer,
    util = require(43),
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

},{"33":33,"34":34,"35":35,"42":42,"43":43}],25:[function(require,module,exports){
'use strict'
var transformer = require(41),
    isFunction = require(43).isFunction,
    tp = require(35).transducer

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

},{"35":35,"41":41,"43":43}],26:[function(require,module,exports){
'use strict'
var completing = require(28),
    util = require(43),
    isFunction = util.isFunction,
    tp = require(35).transducer

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

},{"28":28,"35":35,"43":43}],27:[function(require,module,exports){
'use strict'
var completing = require(28),
    util = require(43),
    isFunction = util.isFunction,
    tp = require(35).transducer

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

},{"28":28,"35":35,"43":43}],28:[function(require,module,exports){
'use strict'
var identity = require(43).identity,
    tp = require(35).transducer

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

},{"35":35,"43":43}],29:[function(require,module,exports){
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

},{}],30:[function(require,module,exports){
'use strict'
var transduce = require(39),
    sequence = require(38),
    symbol = require(35).iterator

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

},{"35":35,"38":38,"39":39}],31:[function(require,module,exports){
'use strict'
module.exports = {
  reduce: require(36),
  transduce: require(39),
  eduction: require(30),
  into: require(32),
  sequence: require(38),
  compose: require(29),
  isReduced: require(33),
  reduced: require(37),
  unreduced: require(42),
  completing: require(28),
  transformer: require(41),
  iterable: require(34),
  transducer: require(40),
  protocols: require(35),
  util: require(43)
}

},{"28":28,"29":29,"30":30,"32":32,"33":33,"34":34,"35":35,"36":36,"37":37,"38":38,"39":39,"40":40,"41":41,"42":42,"43":43}],32:[function(require,module,exports){
'use strict'
module.exports = require(25)(require(24))

},{"24":24,"25":25}],33:[function(require,module,exports){
'use strict'

var tp = require(35).transducer

module.exports =
function isReduced(value){
  return !!(value && value[tp.reduced])
}

},{"35":35}],34:[function(require,module,exports){
'use strict'
var symbol = require(35).iterator,
    util = require(43),
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

},{"35":35,"43":43}],35:[function(require,module,exports){
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

},{}],36:[function(require,module,exports){
'use strict'
module.exports = require(26)(require(24))

},{"24":24,"26":26}],37:[function(require,module,exports){
'use strict'

var isReduced = require(33),
    tp = require(35).transducer

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

},{"33":33,"35":35}],38:[function(require,module,exports){
'use strict'
var isReduced = require(33),
    iterable = require(34),
    protocols = require(35),
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


},{"33":33,"34":34,"35":35}],39:[function(require,module,exports){
'use strict'
module.exports = require(27)(require(24))

},{"24":24,"27":27}],40:[function(require,module,exports){
'use strict'
var tp = require(35).transducer

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

},{"35":35}],41:[function(require,module,exports){
'use strict'
var tp = require(35).transducer,
    completing = require(28),
    util = require(43),
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

},{"28":28,"35":35,"43":43}],42:[function(require,module,exports){
'use strict'

var isReduced = require(33),
    tp = require(35).transducer

module.exports =
function unreduced(value){
  if(isReduced(value)){
    value = value[tp.value]
  }
  return value
}

},{"33":33,"35":35}],43:[function(require,module,exports){
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

},{}],44:[function(require,module,exports){
'use strict'
var core = require(31),
    merge = core.util.objectMerge
module.exports = merge(merge({
    array: require(5),
    string: require(50),
    math: require(45),
    async: require(18)
  }, core), require(61))

},{"18":18,"31":31,"45":45,"5":5,"50":50,"61":61}],45:[function(require,module,exports){
'use strict'
module.exports = {
  min: require(47),
  max: require(46)
}

},{"46":46,"47":47}],46:[function(require,module,exports){
'use strict'
var transducer = require(40),
    identity = require(43).identity

// Return the maximum element (or element-based computation).
module.exports =
function max(f) {
  if(!f){
    f = identity
  }
  return transducer(
    function(step, value, input){
      if(this.lastComputed === void 0){
        this.computedResult = -Infinity
        this.lastComputed = -Infinity
      }
      var computed = f(input)
      if (computed > this.lastComputed ||
          computed === -Infinity && this.computedResult === -Infinity) {
        this.computedResult = input
        this.lastComputed = computed
      }
      return value
    },
    function(result, value){
      if(this.lastComputed === void 0){
        value = this.step(value, -Infinity)
      } else {
        value = this.step(value, this.computedResult)
      }
      return result(value)
    })
}

},{"40":40,"43":43}],47:[function(require,module,exports){
'use strict'
var transducer = require(40),
    identity = require(43).identity

// Return the minimum element (or element-based computation).
module.exports =
function min(f) {
  if(!f){
    f = identity
  }
  return transducer(
    function(step, value, input){
      if(this.lastComputed === void 0){
        this.computedResult = Infinity
        this.lastComputed = Infinity
      }
      var computed = f(input)
      if (computed < this.lastComputed ||
          computed === Infinity && this.computedResult === Infinity) {
        this.computedResult = input
        this.lastComputed = computed
      }
      return value
    },
    function(result, value){
      if(this.lastComputed === void 0){
        value = this.step(value, Infinity)
      } else {
        value = this.step(value, this.computedResult)
      }
      return result(value)
    })
}

},{"40":40,"43":43}],48:[function(require,module,exports){
module.exports = Promise;

},{}],49:[function(require,module,exports){
'use strict'
var split = require(54)

module.exports =
function chars(limit){
  return split('', limit)
}

},{"54":54}],50:[function(require,module,exports){
'use strict'
module.exports = {
  split: require(54),
  join: require(51),
  nonEmpty: require(53),
  lines: require(52),
  chars: require(49),
  words: require(55)
}

},{"49":49,"51":51,"52":52,"53":53,"54":54,"55":55}],51:[function(require,module,exports){
'use strict'
var transducer = require(40)

module.exports =
function join(separator){
  return transducer(
    function(step, value, input){
      if(this.buffer === void 0){
        this.buffer = []
      }
      this.buffer.push(input)
      return value
    },
    function(result, value){
      value = this.step(value, this.buffer.join(separator))
      return result(value)
    })
}

},{"40":40}],52:[function(require,module,exports){
'use strict'
var split = require(54)

module.exports =
function lines(limit){
  return split('\n', limit)
}

},{"54":54}],53:[function(require,module,exports){
'use strict'
var transducer = require(40),
    isString = require(43).isString

module.exports =
function nonEmpty(){
  return transducer(function(step, value, input){
    if(isString(input) && input.trim().length){
      value = step(value, input)
    }
    return value
  })
}

},{"40":40,"43":43}],54:[function(require,module,exports){
'use strict'
var reduced = require(37),
    isRegExp = require(43).isRegExp,
    tp = require(35).transducer

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
Split.prototype[tp.init] = function(){return this.xf.init()}
Split.prototype[tp.step] = function(result, input){
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

    result = this.xf[tp.step](result, next.value)

    if(++this.idx >= this.limit){
      this.next = null
      result = reduced(result)
      break
    }
  }
  return result
}
Split.prototype[tp.result] = function(result){
  var next = this.next
  if(next && next.value !== null && next.value !== void 0){
    result = this.xf[tp.step](result, next.value)
  }
  return this.xf[tp.result](result)
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

},{"35":35,"37":37,"43":43}],55:[function(require,module,exports){
'use strict'
var compose = require(29),
    isNumber = require(43).isNumber,
    split = require(54),
    nonEmpty = require(53)

module.exports =
function words(delimiter, limit) {
  if(delimiter === void 0 || isNumber(delimiter)){
    limit  = delimiter
    delimiter = /\s+/
  }
  return compose(split(delimiter, limit), nonEmpty())
}

},{"29":29,"43":43,"53":53,"54":54}],56:[function(require,module,exports){
'use strict'
var reduced = require(37),
    isReduced = require(33),
    reduce = require(36),
    transducer = require(40),
    transducerReduce = transducer(reduce),
    preserveReduced = transducer(function(step, value, input){
      value = step(value, input)
      return isReduced(value) ? reduced(value, true) : value
    })

module.exports =
function cat(xf){
  return transducerReduce(preserveReduced(xf))
}

},{"33":33,"36":36,"37":37,"40":40}],57:[function(require,module,exports){
'use strict'
var transducer = require(40)

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

},{"40":40}],58:[function(require,module,exports){
'use strict'
var transducer = require(40)

module.exports =
function drop(n){
  return transducer(function(step, value, item){
    if(this.n === void 0) this.n = n
    return (--this.n < 0) ? step(value, item) : value
  })
}

},{"40":40}],59:[function(require,module,exports){
'use strict'
var transducer = require(40)

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

},{"40":40}],60:[function(require,module,exports){
'use strict'
var transducer = require(40)

module.exports =
function filter(predicate) {
  return transducer(function(step, value, input) {
    return predicate(input) ? step(value, input) : value
  })
}

},{"40":40}],61:[function(require,module,exports){
'use strict'
module.exports = {
  map: require(62),
  filter: require(60),
  remove: require(66),
  take: require(67),
  takeWhile: require(68),
  drop: require(58),
  dropWhile: require(59),
  cat: require(56),
  mapcat: require(63),
  partitionAll: require(64),
  partitionBy: require(65),
  unique: require(70),
  dedupe: require(57),
  tap: require(69)
}

},{"56":56,"57":57,"58":58,"59":59,"60":60,"62":62,"63":63,"64":64,"65":65,"66":66,"67":67,"68":68,"69":69,"70":70}],62:[function(require,module,exports){
'use strict'
var transducer = require(40)

module.exports =
function map(callback) {
  return transducer(function(step, value, input) {
    return step(value, callback(input))
  })
}

},{"40":40}],63:[function(require,module,exports){
'use strict'
var compose = require(29),
    map = require(62),
    cat = require(56)

module.exports =
function mapcat(callback) {
  return compose(map(callback), cat)
}

},{"29":29,"56":56,"62":62}],64:[function(require,module,exports){
'use strict'
var transducer = require(40)

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

},{"40":40}],65:[function(require,module,exports){
'use strict'
var transducer = require(40),
    isReduced = require(33)

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

},{"33":33,"40":40}],66:[function(require,module,exports){
'use strict'
var filter = require(60)

module.exports = remove
function remove(p){
  return filter(function(x){
    return !p(x)
  })
}


},{"60":60}],67:[function(require,module,exports){
'use strict'
var transducer = require(40),
    reduced = require(37)

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

},{"37":37,"40":40}],68:[function(require,module,exports){
'use strict'
var transducer = require(40),
    reduced = require(37)

module.exports =
function takeWhile(p){
  return transducer(function(step, value, input){
    return p(input) ? step(value, input) : reduced(value)
  })
}

},{"37":37,"40":40}],69:[function(require,module,exports){
'use strict'
var transducer = require(40)

module.exports =
function tap(interceptor) {
  return transducer(function(step, value, input){
    interceptor(value, input)
    return step(value, input)
  })
}

},{"40":40}],70:[function(require,module,exports){
'use strict'
var transducer = require(40),
    identity = require(43).identity

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

},{"40":40,"43":43}]},{},[44])(44)
});