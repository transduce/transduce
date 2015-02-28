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
var reduced = require(37)

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

},{"37":37}],3:[function(require,module,exports){
'use strict'
var reduced = require(37)

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

},{"37":37}],4:[function(require,module,exports){
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
var isReduced = require(33),
    unreduced = require(41)

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

},{"33":33,"41":41}],7:[function(require,module,exports){
'use strict'
var isReduced = require(33),
    unreduced = require(41)

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

},{"33":33,"41":41}],8:[function(require,module,exports){
'use strict'
var isReduced = require(33),
    unreduced = require(41),
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

},{"33":33,"41":41}],9:[function(require,module,exports){
'use strict'
var compose = require(29),
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


},{"29":29,"37":37,"6":6,"7":7}],10:[function(require,module,exports){
'use strict'
var reduced = require(37)

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

},{"37":37}],11:[function(require,module,exports){
'use strict'
var isReduced = require(33),
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

},{"33":33}],12:[function(require,module,exports){
'use strict'
var Prom = require(54),
    isReduced = require(33),
    unreduced = require(41),
    transformer = require(40),
    iterable = require(34),
    protocols = require(35)

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

function transduce(xf, f, init, coll){
  return Prom
    .all([xf, f, init, coll])
    .then(_transduce)
}

function __transduce(xf, f, init, coll){
  f = transformer(f)
  xf = xf(f)
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
        result = self.xf.result(self.value)
      } else {
        result = Prom
          .all([self.xf.step(self.value, item.value)])
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
        result = self.xf.result(unreduced(value))
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

},{"33":33,"34":34,"35":35,"40":40,"41":41,"54":54}],13:[function(require,module,exports){
'use strict'
var isReduced = require(33),
    unreduced = require(41),
    transformer = require(40)

module.exports =
function callback(t, init, continuation){
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
        result = null
      } else if(err){
        result = null
        throw err
      }
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
    if(done) return result
  }
}

},{"33":33,"40":40,"41":41}],14:[function(require,module,exports){
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
var Prom = require(54)

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

Delay.prototype.init = function(){
  var self = this,
      task = self.task
  if(task.resolved){
    return task.resolved
  }

  return Prom
    .resolve(self.xf.init())
}
Delay.prototype.step = function(value, input) {
  var self = this,
      task = self.task
  if(task.resolved){
    return task.resolved
  }

  return Prom
    .all([value, input])
    .then(self._step)
}
Delay.prototype.result = function(value){
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
        resolve(task.xf.step(value, input))
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
        resolve(task.xf.result(value))
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

},{"54":54}],17:[function(require,module,exports){
'use strict'
var compose = require(29),
    tap = require(76),
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

},{"13":13,"29":29,"76":76}],18:[function(require,module,exports){
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
var Prom = require(54),
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

},{"13":13,"54":54}],21:[function(require,module,exports){
'use strict'
module.exports = require(26)(require(12))

},{"12":12,"26":26}],22:[function(require,module,exports){
'use strict'
module.exports = require(27)(require(12))

},{"12":12,"27":27}],23:[function(require,module,exports){
'use strict'
var Prom = require(54),
    promiseTransform = require(20)

module.exports =
function when(promiseOrValue, t){
  return new Prom(function(resolve){
    resolve(promiseOrValue)
  }).then(promiseTransform(t))
}

},{"20":20,"54":54}],24:[function(require,module,exports){
'use strict'
var isReduced = require(33),
    unreduced = require(41),
    iterable = require(34),
    protocols = require(35),
    util = require(42),
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

},{"33":33,"34":34,"35":35,"41":41,"42":42}],25:[function(require,module,exports){
'use strict'
var transformer = require(40),
    isFunction = require(42).isFunction

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
}

},{"40":40,"42":42}],26:[function(require,module,exports){
'use strict'
var completing = require(28),
    util = require(42),
    isFunction = util.isFunction

module.exports = function(core){
  return function reduce(xf, init, coll){
    if(isFunction(xf)){
      xf = completing(xf)
    }

    if (arguments.length === 2) {
      coll = init
      init = xf.init()
    }
    return core.reduce(xf, init, coll)
  }
}

},{"28":28,"42":42}],27:[function(require,module,exports){
'use strict'
var completing = require(28),
    util = require(42),
    isFunction = util.isFunction

module.exports = function(core){
  return function transduce(t, xf, init, coll) {
    if(isFunction(xf)){
      xf = completing(xf)
    }
    xf = t(xf)
    if (arguments.length === 3) {
      coll = init
      init = xf.init()
    }
    return core.reduce(xf, init, coll)
  }
}

},{"28":28,"42":42}],28:[function(require,module,exports){
'use strict'
var identity = require(42).identity

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

},{"42":42}],29:[function(require,module,exports){
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
  unreduced: require(41),
  completing: require(28),
  transformer: require(40),
  iterable: require(34),
  protocols: require(35),
  util: require(42)
}

},{"28":28,"29":29,"30":30,"32":32,"33":33,"34":34,"35":35,"36":36,"37":37,"38":38,"39":39,"40":40,"41":41,"42":42}],32:[function(require,module,exports){
'use strict'
module.exports = require(25)(require(24))

},{"24":24,"25":25}],33:[function(require,module,exports){
'use strict'

module.exports =
function isReduced(value){
  return !!(value && value.__transducers_reduced__)
}

},{}],34:[function(require,module,exports){
'use strict'
var symbol = require(35).iterator,
    util = require(42),
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

},{"35":35,"42":42}],35:[function(require,module,exports){
var /* global Symbol */
    /* jshint newcap:false */
    symbolExists = typeof Symbol !== 'undefined',
    iterator = symbolExists ? Symbol.iterator : '@@iterator'
    transformer = symbolExists ? Symbol('transformer') : '@@transformer'

module.exports = {
  iterator: iterator,
  transformer: transformer
}

},{}],36:[function(require,module,exports){
'use strict'
module.exports = require(26)(require(24))

},{"24":24,"26":26}],37:[function(require,module,exports){
'use strict'

var isReduced = require(33)

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

},{"33":33}],38:[function(require,module,exports){
'use strict'
var isReduced = require(33),
    iterable = require(34),
    symbol = require(35).iterator

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


},{"33":33,"34":34,"35":35}],39:[function(require,module,exports){
'use strict'
module.exports = require(27)(require(24))

},{"24":24,"27":27}],40:[function(require,module,exports){
'use strict'
var symbol = require(35).transformer,
    completing = require(28),
    util = require(42),
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
  if(value === void 0 || value === null){
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

},{"28":28,"35":35,"42":42}],41:[function(require,module,exports){
'use strict'

var isReduced = require(33)

module.exports =
function unreduced(value){
  if(isReduced(value)){
    value = value.value
  }
  return value
}

},{"33":33}],42:[function(require,module,exports){
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

},{}],43:[function(require,module,exports){
'use strict'
var core = require(31),
    merge = core.util.objectMerge
module.exports = merge(merge({
    array: require(5),
    string: require(56),
    math: require(51),
    iterators: require(47),
    async: require(18)
  }, core), require(68))

},{"18":18,"31":31,"47":47,"5":5,"51":51,"56":56,"68":68}],44:[function(require,module,exports){
'use strict'
var iterable = require(34),
    symbol = require(35).iterator,
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

},{"34":34,"35":35}],45:[function(require,module,exports){
"use strict"
var symbol = require(35).iterator

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

},{"35":35}],46:[function(require,module,exports){
'use strict'
var iterable = require(34),
    symbol = require(35).iterator

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

},{"34":34,"35":35}],47:[function(require,module,exports){
'use strict'
module.exports = {
  toArray: require(50),
  range: require(48),
  count: require(45),
  cycle: require(46),
  repeat: require(49),
  chain: require(44)
}

},{"44":44,"45":45,"46":46,"48":48,"49":49,"50":50}],48:[function(require,module,exports){
'use strict'
var symbol = require(35).iterator

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

},{"35":35}],49:[function(require,module,exports){
'use strict'
var iterable = require(34),
    symbol = require(35).iterator

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

},{"34":34,"35":35}],50:[function(require,module,exports){
'use strict'
var iterable = require(34),
    symbol = require(35).iterator

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

},{"34":34,"35":35}],51:[function(require,module,exports){
'use strict'
module.exports = {
  min: require(53),
  max: require(52)
}

},{"52":52,"53":53}],52:[function(require,module,exports){
'use strict'

var identity = require(42).identity

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

},{"42":42}],53:[function(require,module,exports){
'use strict'

var identity = require(42).identity

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

},{"42":42}],54:[function(require,module,exports){
module.exports = Promise;

},{}],55:[function(require,module,exports){
'use strict'
var split = require(60)

module.exports =
function chars(limit){
  return split('', limit)
}

},{"60":60}],56:[function(require,module,exports){
'use strict'
module.exports = {
  split: require(60),
  join: require(57),
  nonEmpty: require(59),
  lines: require(58),
  chars: require(55),
  words: require(61)
}

},{"55":55,"57":57,"58":58,"59":59,"60":60,"61":61}],57:[function(require,module,exports){
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

},{}],58:[function(require,module,exports){
'use strict'
var split = require(60)

module.exports =
function lines(limit){
  return split('\n', limit)
}

},{"60":60}],59:[function(require,module,exports){
'use strict'
var isString = require(42).isString

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

},{"42":42}],60:[function(require,module,exports){
'use strict'
var reduced = require(37),
    isRegExp = require(42).isRegExp

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

},{"37":37,"42":42}],61:[function(require,module,exports){
'use strict'
var compose = require(29),
    isNumber = require(42).isNumber,
    split = require(60),
    nonEmpty = require(59)

module.exports =
function words(delimiter, limit) {
  if(delimiter === void 0 || isNumber(delimiter)){
    limit  = delimiter
    delimiter = /\s+/
  }
  return compose(split(delimiter, limit), nonEmpty())
}

},{"29":29,"42":42,"59":59,"60":60}],62:[function(require,module,exports){
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

},{}],63:[function(require,module,exports){
'use strict'

var reduced = require(37),
    isReduced = require(33),
    reduce = require(36)

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

},{"33":33,"36":36,"37":37}],64:[function(require,module,exports){
'use strict'
var _unique = require(62)

module.exports =
function dedupe(){
  return _unique()
}

},{"62":62}],65:[function(require,module,exports){
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

},{}],66:[function(require,module,exports){
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

},{}],67:[function(require,module,exports){
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

},{}],68:[function(require,module,exports){
'use strict'
module.exports = {
  map: require(69),
  filter: require(67),
  remove: require(73),
  take: require(74),
  takeWhile: require(75),
  drop: require(65),
  dropWhile: require(66),
  cat: require(63),
  mapcat: require(70),
  partitionAll: require(71),
  partitionBy: require(72),
  unique: require(78),
  dedupe: require(64),
  tap: require(76),
  transformStep: require(77)
}

},{"63":63,"64":64,"65":65,"66":66,"67":67,"69":69,"70":70,"71":71,"72":72,"73":73,"74":74,"75":75,"76":76,"77":77,"78":78}],69:[function(require,module,exports){
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

},{}],70:[function(require,module,exports){
'use strict'
var compose = require(29),
    map = require(69),
    cat = require(63)
module.exports =
function mapcat(callback) {
  return compose(map(callback), cat)
}

},{"29":29,"63":63,"69":69}],71:[function(require,module,exports){
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

},{}],72:[function(require,module,exports){
'use strict'
var isReduced = require(33)

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

},{"33":33}],73:[function(require,module,exports){
'use strict'
var filter = require(67)

module.exports = remove
function remove(p){
  return filter(function(x){
    return !p(x)
  })
}


},{"67":67}],74:[function(require,module,exports){
'use strict'

var reduced = require(37)

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

},{"37":37}],75:[function(require,module,exports){
'use strict'
var reduced = require(37)

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

},{"37":37}],76:[function(require,module,exports){
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

},{}],77:[function(require,module,exports){
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

},{}],78:[function(require,module,exports){
'use strict'
var _unique = require(62)

module.exports =
function unique(f) {
  return _unique(f, true)
}

},{"62":62}]},{},[43])(43)
});