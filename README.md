# Transduce
[![Build Status](https://secure.travis-ci.org/transduce/transduce.svg)](http://travis-ci.org/transduce/transduce)

Transducers for JavaScript.

> Transducers are composable algorithmic transformations. They are independent from the context of their input and output sources and specify only the essence of the transformation in terms of an individual element. Because transducers are decoupled from input or output sources, they can be used in many different processes - collections, streams, channels, observables, etc. Transducers compose directly, without awareness of input or creation of intermediate aggregates.

http://clojure.org/transducers

If you are not familiar with transducers, check out [Transducers Explained][3].

### Install and Usage

```bash
$ npm install transduce
```

If using async package, also install a Promise library of your choice.  Works with [any-promise](https://github.com/kevinbeaty/any-promise) library (a pollyfill, es6-promise, promise, native-promise-only, bluebird, rsvp, when, q).  Just install the Promise library preference and it will be auto detected and used.

#### Browser

```bash
$ bower install transduce
```

* [Development](https://raw.githubusercontent.com/transduce/transduce/master/build/transduce.js)
* [Minified](https://raw.githubusercontent.com/transduce/transduce/master/build/transduce.min.js)

Structured to allow creation of custom builds by loading only desired libs.  For example, the base build contains only top-level `core` and `transducers`:

* [Base Development](https://raw.githubusercontent.com/transduce/transduce/master/build/transduce.base.js)
* [Base Minified](https://raw.githubusercontent.com/transduce/transduce/master/build/transduce.base.min.js)

#### Explicit Require and Custom Bundles

Collected as a convenience for an aggregated API. Any function or transducer below can be bundled separately in browserify builds by requiring with path from `transduce`.

What does this mean? You can require the whole thing:

```javascript
var tr = require('transduce')
tr.into([], [1,2,3,4,5,6])
// [1,2,3,4,5,6]

tr.into('', [1,2,3,4,5,6])
// '123456'

tr.into([], tr.filter(isEven), [1,2,3,4,5,6])
// [2,4,6]

tr.into([], tr.cat, [[1,2],[3,4],[5,6]])
// [1,2,3,4,5,6])

tr.into({}, [[1,2],[3,4],[5,6]])
// {1:2,3:4,5:6}

var transducer = tr.compose(tr.cat, tr.array.unshift(0), tr.map(add(1)))
tr.into([], transducer, [[1,2],[3,4],[5,6]])
// [1,2,3,4,5,6,7]
```

If you want to be reduce bundle size (or just like to be explicit), require with path from `transduce`.

```javascript
var into = require('transduce/core/into'),
    compose = require('transduce/core/compose'),
    cat = require('transduce/transducers/cat'),
    map = require('transduce/transducers/map'),
    unshift = require('transduce/array/unshift')

var transducer = compose(cat, unshift(0), map(add(1)))
into([], transducer, [[1,2],[3,4],[5,6]])
// [1,2,3,4,5,6,7])

```

Too explicit? Require the packages:

```javascript
  var core = require('transduce/core'),
      transducers = require('transduce/transducers'),
      array = require('transduce/array')
  var transducer = core.compose(transducers.cat, array.unshift(0), transducers.map(add(1)))
  base.into([], transducer, [[1,2],[3,4],[5,6]])
  // [1,2,3,4,5,6,7]
```

### Definitions

##### Input Source
A source of values, normally a collection, `coll`.  This library supports arrays, plain objects, strings, and anything that can be converted to iterators (see `iterator` function below).  Input sources can also be push based, see `async` package below.

##### Reducing Function
A two arity function, `rf`, appropriate for passing to `reduce`. The first argument is the accumulator and the second argument is the iteration value.  When using transducers, the accumulator is normally a collection, but it is not required.

##### Initial Value
The initial accumulator value, `init` to use with Reduce.

##### Transformer
An object that provides a reducing function, `@@transducer/step`, initial value function, `@@transducer/init`, and result extraction function, `@@transducer/result`.  Combines the steps of reduce into a single object.

##### Reduce
A function that folds over an input source to produce an Output Source.  Accepts a Reducing Function or Transformer, `xf`, as the first argument, an optional initial value, `init`, as the second argument and an Input Source, `coll` as the third argument.

Also known as `foldLeft` or `foldl` in other languages and libraries.

The function begins with calling the Reducing Function of `xf`, `@@transducer/step`, with the initial accumulator, `init`, and the first item of Input Source, `coll`.  The return value from the reducing function is used as the next accumulator with the next item in `coll`. The process repeats until either `coll` is exhausted or `xf` indicates early termination with `reduced`. Finally, the result extraction function of `xf`, `@@transducer/result`, is called with the final accumulator to perform potentially delayed actions and optionally convert the accumulator to the Output Source.

Reduce defines a Transducible Process.

##### Transducer
A function, `t`, that accepts a transformer, `xf`, and returns a transformer. All transformations are defined in terms of transducers, independent of the Transducible Process. Can be composed directly to create new transducers.

##### Transducible Process
A process that begins with an initial value accumulator, steps through items of an input source and optionally transforming with transducer, `t`, and optionally completes with a result.  Transduce is one transducible process. Transducible Processes can also be push based. See `async` package below or [transduce-stream][2] for a few examples.  The same transducer can be used with any transducible process.

### API

Supports the following functions:

```javascript
// core
into: function(init, t?, coll?)
reduce: function(xf, init?, coll)
transduce: function(t, xf, init?, coll)
eduction: function(t, coll)
sequence: function(t, value)

compose: function(/*fns*/)
isReduced: function(value)
reduced: function(value, force?)
unreduced: function(value)

completing: function(rf, result?)
transformer: function(value)
iterable: function(value)
transducer: function(step?, result?, init?)

protocols: {
  iterator: Symbol.iterator || '@@iterator'
  transducer: {
    init: '@@transducer/init',
    step: '@@transducer/step',
    result: '@@transducer/result',
    reduced: '@@transducer/reduced',
    value: '@@transducer/value'
  }
}

// transducers
map: function(f)
filter: function(predicate)
remove: function(predicate)
take: function(n)
takeWhile: function(predicate)
drop: function(n)
dropWhile: function(predicate)
cat: transducer
mapcat: function(f)
partitionAll: function(n)
partitionBy: function(f)
dedupe: function()
unique: function(f?)
tap: function(interceptor)

array {
  forEach: function(callback)
  find: function(predicate)
  push: function(/*args*/)
  unshift: function(/*args*/)
  every: function(predicate)
  some: function(predicate)
  contains: function(target)
  slice: function(begin?, end?)
  initial: function(n?)
  last: function(n?)
}

math {
  min: function(f?)
  max: function(f?)
}

string {
  split: function(separator, limit?)
  join: function(separator)
  nonEmpty: function()
  lines: function(limit?)
  chars: function(limit?)
  words: function(delimiter?, limit?)
}

async {
  defer: function()
  delay: function(wait)
  compose: function(/*args*/)
  into: function(init, t?, coll?)
  transduce: function(t, xf, init?, coll)
  reduce: function(xf, init?, coll)
  when: function(promiseOrValue, t)
  promiseTransform: function(t)
  emitInto: function(to, t, from)
  callback: function(t, init?, continuation?)
}
```

#### Core

Core functionality mixed into `transduce` directly or available by explictly requiring from `transduce/core`.  The following are equivalent:

- `require('transduce').into`
- `require('transduce/core/into')`
- `require('transduce/core').into`

##### into(init, t?, coll?)
Returns a new collection appending all items into `init` by passing all items from source collection `coll` through the optional transducer `t`.  Chooses transformer, `xf` from type of `init`.  Can be array, object, string or have `@@transformer`. `coll` is converted to an `iterator`.

The function is automatically curried. If `coll` is not provided, returns a curried function using `transformer` from `init` and the same transformation can be used for multiple collections.

```javascript
var tr = require('transduce')

// init, t and coll provided
tr.into([], tr.filter(isEven), [1,2,3,4,5,6]) // [2,4,6]

// init and coll, no t
tr.into([], [1,2,3,4,5,6]) // [1,2,3,4,5,6]
tr.into('hi ', [1,2,3,4,5,6]) // 'hi 123456'

// Curry on init
var toArray = tr.into([])
toArray([1,2,3]) // [1,2,3]
toArray(tr.map(add(1)), [1,2,3]) // [2,3,4]

// Curry on init and t
var add1 =  into([], tr.map(add(1)))
var add1 =  toArray(tr.map(add(1)))
add1([1,2,3]) // [2,3,4])

// Iterator coll
toArray(range(1,4)) // [1,2,3])
var add2 = toArray(tr.map(add(2)))
add2(range(3)) // [2,3,4])

// Object coll
var toObject = tr.into({})
toObject([['a', 'b'], ['b', 'c']]) // {a: 'b', b: 'c'})
var part2 = toObject(tr.partitionAll(2))
part2(['a', 'b', 'b', 'c']) // {a: 'b', b: 'c'})
```

##### reduce(xf, init?, coll)
Reduces over a transformation. If `xf` is not a `transformer`, it is converted to one using `completing`. Arrays are special cased to reduce using for loop and to allow transducers using `reduced`.  If `coll` has a `reduce` method, it is called with `xf.step` and `init`. Otherwise,`coll` is converted to an `iterator`.  If the function is called with arity-2, the `xf.init()` is used as the `init` value.

##### transduce(t, xf, init?, coll)
Transduces over a transformation. The transducer `t` is initialized with `xf` and is passed to `reduce`. `xf` is converted to a `transformer` if it is not one already using `completing`. If the function is called with arity-3, the `xf.init()` is used as the `init` value.

##### eduction(t, coll)
Creates an iterable and reducible application of the collection `coll` transformed by transducer`t`.  The returned eduction will be iterable using `sequence` and have a `reduce(rf, init)` method using `transduce`.

##### sequence(t, value)
Create an ES6 Iterable by transforming an input source using transducer `t`.

##### compose(/\*fns\*/)
Simple function composition of arguments. Useful for composing (combining) transducers.

##### isReduced(value)
Is the value reduced? (signal for early termination)

##### reduced(value, force?)
Ensures the value is reduced (useful for early termination). If `force` is not provided or `false`, only wraps with Reduced value if not already `isReduced`.  If `force` is `true`, always wraps value with Reduced value.

##### unreduced(value)
Ensure the value is not reduced (unwraps reduced values if necessary)

##### completing(rf, result?)
Lifts a reducing function, `rf`, into a transformer, `xf`.  Uses `identity` if `result` function is not provided. The `init` function calls `rf` with no arguments.

##### transformer(value)
Attempts to convert the parameter into a transformer.  If cannot be converted, returns `undefined`.  If defined, the return value will have `init`, `step`, `result` functions that can be used for transformation.  Converts arrays, strings, objects, functions (`completing`) or anything that follows the transformer protocol into a transformer.

Objects support pairs or objects. If `item` is an array of length 2, uses first (0 index) as the key and the second (1 index) as the value.  Otherwise iterates over own properties of items and merges values with same keys into the result object.

If `value` is `undefined`, returns a transformer that maintains the last value and does not buffer results. Ignores the accumulator and returns the input on every `step`. The `init` value will be `undefined`.

##### iterable(value)
Returns the iterable for the parameter, returning if has an iterator protocol or wrapping in proper iterable if has a next method. Returns `undefined` if cannot create an iterator.

Converts arrays to iterables over each indexed item. Converts to functions to infinite iterables that always call function on next. Converts objects to iterables of key, value pairs.

The iterable is an object that has a function identified by `protocols.iterator` that should be called with no args and returns an iterator object that has a `next` method to cycle through the iterator.

##### protocols.iterator
Symbol (or a string that acts as symbols) for `@@iterator` you can use to configure your custom objects.

##### protocols.transducer
String that acts as symbols for supporting the transducer protocol. Used to define transformers and reduced values.

##### transducer(step?, result?, init?)
Creates a transducer from a reducing function, `step`, result extraction function `result` and initial value function `init`.  If any function is `null` or `undefined`, default is to forward directly to wrapped transformer.

The `@@transducer/step` function of the resulting transformer calls `step(xfStep, result, input)` bound to an empty context, where `xfStep` calls `step` on the wrapped transformer. The `init` and `result` functions behave similarly.

All functions are called with a bound context (`this` parameter) that contains `init`, `step` and `result` functions that forward to wrapped transformer. The context can be used to implement stateful transducers. 

```javascript
// Map from a step function
function map(callback) {
  return transducer(function(step, value, input) {
    return step(value, callback(input))
  })
}

// using reduced
function takeWhile(p){
  return transducer(function(step, value, input){
    return p(input) ? step(value, input) : reduced(value)
  })
}

// using context for stateful transducers
function drop(n){
  return transducer(function(step, value, item){
    if(this.n === void 0) this.n = n
    return (--this.n < 0) ? step(value, item) : value
  })
}

// using custom result
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
```

#### Transducers
Common transducers mixed into `transduce` directly or available by explictly requiring from `transduce/transducers`. The following are equivalent:
- `require('transduce').map`
- `require('transduce/transducers/map')`
- `require('transduce/transducers).map`

##### map(f)
Transducer that steps all items after applying a mapping function `f` to each item.

##### filter(predicate)
Transducer that steps items which pass predicate test.

##### remove(predicate)
Transducer that removes all items that pass predicate.

##### take(n)
Transducer that steps first `n` items and then terminates with `reduced`.

##### takeWhile(predicate)
Transducer that take items until predicate returns true. Terminates with reduce when predicate returns true.

##### drop(n)
Transducer that drops first `n` items and steps remaining untouched.

##### dropWhile(predicate)
Transducer that drops items until predicate returns true and steps remaining untouched.

##### cat
Concatenating transducer.  Reducing over every item in the transformation using provided transformer.

##### mapcat(mappingFunction)
Transducer that applies a `mappingFunction` to each item, then concatenates the result of the mapping function.  Same is `compose(map(mappingFunction), cat)`

##### partitionAll(n?)
Partitions the source into arrays of size `n`. When transformer completes, the transformer will be stepped with any remaining items. If `n` is not provided or size `0` it will collect all values and step with this value.

##### partitionBy(f)
Partitions the source into sub arrays when the value of the function `f` changes equality.  When transformer completes, the transformer will be stepped with any remaining items.

##### dedupe()
Removes consecutive duplicates from the transformation. Subsequent stepped values are checked for equality using `===`.

##### unique(f?)
Produce a duplicate-free version of the transformation. If `f` is passed, it will be called with each item and the return value for uniqueness check.  Uniqueness is checked across all values already seen, and as such, the items (or computed checks) are buffered.

##### tap(interceptor)
Transducer that invokes interceptor with each result and input, and then passes through input. The primary purpose of this method is to "tap into" a method chain, in order to perform operations on intermediate results within the chain.  Executes interceptor with current result and input.

#### Array
Use Array methods as Transducers.  Treats each stepped item as an item in the array, and defines transducers that step items with the same contract as array methods.

Mixed into `transduce.array` or available by explictly requiring from `transduce/array`.  The following are equivalent:

- `require('transduce').array.forEach`
- `require('transduce/array/forEach')`
- `require('transduce/array').forEach`

##### array.forEach(callback)
Passes every item through unchanged, but after executing `callback(item, idx)`.  Can be useful for "tapping into" composed transducer pipelines.   The return value of the callback is ignored, item is passed unchanged.

##### array.find(predicate)
Like filter, but terminates transducer pipeline with the result of the first item that passes the predicate test. Will always step either 0 (if not found) or 1 (if found) values.

##### array.push(/\*args\*/)
Passes all items straight through until the result is requested.  Once completed, steps every argument through the pipeline, before returning the result.  This effectively pushes values on the end of the stream.

##### array.unshift(/\*args\*/)
Before stepping the first item, steps all arguments through the pipeline, then passes every item through unchanged.  This effectively unshifts values onto the beginning of the stream.

##### array.every(predicate)
Checks to see if every item passes the predicate test.  Steps a single item `true` or `false`.  Early termination on `false`.

##### array.some(predicate)
Checks to see if some item passes the predicate test.  Steps a single item `true` or `false`.  Early termination on `true`.

##### array.contains(target)
Does the stream contain the target value (`target === item`)? Steps a single item `true` or `false`. Early termination on `true`.

##### array.slice(begin?, end?)
Like array slice, but with transducers.  Steps items between `begin` (inclusive) and `end` (exclusive).  If either index is negative, indexes from end of transformation.  If `end` is undefined, steps until result of transformation. If `begin` is undefined, begins at 0.

Note that if either index is negative, items will be buffered until completion.

##### array.initial(n?)
Steps everything but the last entry. Passing `n` will step all values excluding the last N.

Note that no items will be sent and all items will be buffered until completion.

##### array.last(n?)
Step the last element. Passing `n` will step the last N  values.

Note that no items will be sent until completion.

#### Math

Mixed into `transduce.math` or available by explictly requiring from `transduce/math`.  The following are equivalent:

- `require('transduce').math.min`
- `require('transduce/math/min')`
- `require('transduce/math').min`

##### math.min(f?)
Steps the minimum value on the result of the transformation. if `f` is provided, it is called with each item and the return value is used to compare values. Otherwise, the items are compared as numbers

#####  math.max(f?)
Steps the maximum value on the result of the transformation. if `f` is provided, it is called with each item and the return value is used to compare values. Otherwise, the items are compared as numbers

#### String
Transduce over sequences of strings. Particularly useful with [transduce-stream][2].

Treats every item as a substring, and splits across the entire transducer sequence.  This allows functions to work with chunks sent through streams.  When using transducers with streams, it is helpful to compose the transformation that you want with one of these functions to operate against a given line/word/etc.

Mixed into `transduce.string` or available by explictly requiring from `transduce/string`.  The following are equivalent:

- `require('transduce').string.split`
- `require('transduce/string/split')`
- `require('transduce/string').split`

##### string.split(separator, limit?)
Works like `''.split` but splits across entire sequence of items. Accepts separator (String or RegExp) and optional limit of words to send.

##### string.join(separator)
Buffers all items and joins results on transducer `result`.

##### string.nonEmpty()
Only steps items that are non empty strings (`input.trim().length > 0`).

##### string.lines(limit?)
Split chunks into lines and steps each line with optional limit (number of lines).

##### string.chars(limit?)
Split chunks into characters and steps each char with optional limit (number of chars).

##### string.words(delimiter?, limit?)
Split chunks into words using `delimiter` (default `/\s+/`) and steps each word with optional limit (number of words).

#### Async
Use Transducers with async iterators and observables by supporting Promises in iterators and transformers. Inspired by [this talk](http://channel9.msdn.com/Events/Lang-NEXT/Lang-NEXT-2014/Keynote-Duality) from Erik Meijer.

Mixed into `transduce.async` or available by explictly requiring from `transduce/async`.  The following are equivalent:

- `require('transduce').async.defer`
- `require('transduce/async/defer')`
- `require('transduce/async').defer`

##### async.defer()
Create a deferred transducer that allows wrapped transformer to `step` or `result` a Promise in addition to a value. All items will be queued and processed in order. The wrapped transformer is called with value of resolved Promise.

##### async.delay(wait)
Create a deferred transducer that delays step of wrapped transformer by `wait` milliseconds. All items will be queued and delayed and `step` will return a promise that will resolve after `wait` milliseconds for each item.

##### async.compose(/\*fns\*/)
Like a normal compose, except all arguments are interleaved with `defer`.  This allows any transducer in composed pipeline to `step` or `result` a Promise in addition to a value.  The wrapped transformer is called with value of resolved Promise.

##### async.transduce(t, xf, init?, coll)
Like a normal transduce, except `init` and `coll` can be a Promise and `xf` can be a deferred transducer. The value of `coll` can be anything that can be converted to an iterator. The return value is a Promise for the result of the transformation.

##### async.reduce(xf, init?, coll)
Like a normal reduce, except `init` and `coll` can be a Promise and `xf` can be a deferred transducer. The value of `coll` can be anything that can be converted to an iterator. The return value is a Promise for the result of the reduction.

##### async.into(init, t?, coll?)
Async version of into. Returns a Promise for a new collection appending all items into `init` by passing all items from source collection `coll` through the optional transducer `t`.  Chooses transformer, `xf` from type of `init`.  Can be array, object, string or have `@@transformer`. `coll` is converted to an `iterator`.

The function is automatically curried. If `coll` is not provided, returns a curried function using `transformer` from `init` and the same transformation can be used for multiple collections.

##### async.when(promiseOrValue, t)
Resolves promise or value as a promise, then transforms promise result with the transducer `t` as a single item.

##### async.promiseTransform(t)
Creates a callback useable for promise sucess that transforms the result with the transducer `t`as a single item.

##### async.emitInto(to, t, from)
Registers listener for events on `from` emitter and emits events on `to` emitter after transforming data events through the transducer, `t`. Assumes both `to` and `from` support the `EventEmitter` API from Node.js.

Supports following events:

- `emit('data', item)`: Listened and emitted for each item in transformation.
- `emit('error', error)`: Listened and emitted on error in transformation
- `emit('end')`: Emitted when transformer completes, regardless of error or result.

##### async.callback(t, init?, continuation?)
Creates an async callback that starts a transducer process and accepts parameter `cb(err, item)` as a new item in the process. The returned callback and the optional continuation follow Node.js conventions with  `fn(err, item)`. Each item advances the state  of the transducer, if the continuation is provided, it will be called on completion or error. An error will terminate the transducer and be propagated to the continuation.

If the transducer exhausts due to early termination, all subsequent calls to the callback will no-op and return the computed result. If the callback is called with no item, the transducer terminates, and all subsequent calls will no-op and return the computed result. The callback returns `undefined` until completion. Once completed, the final `result` is always returned.

Like `into`, chooses transformer, `xf`, based on the type of `init` using `transformer`.  If `init` is not defined, maintains last value and does not buffer results. This can be used with `tap` or other methods to process items incrementally instead of waiting and buffering results.


### Credits

Extracted from [underarm][6], which was created initially as a translation from [Clojure][8]. Now compatible with and inspired by protocols defined by [transducers-js][4] and [transducers.js][5].

### License
MIT

[1]: https://github.com/transduce
[2]: https://github.com/transduce/transduce-stream
[3]: http://simplectic.com/blog/2014/transducers-explained-1/
[4]: https://github.com/cognitect-labs/transducers-js
[5]: https://github.com/jlongster/transducers.js
[6]: https://github.com/kevinbeaty/underarm
[7]: http://simplectic.com/projects/underarm
[8]: http://clojure.org/transducers
[10]: https://github.com/jlongster/transducers.js#the-transformer-protocol
