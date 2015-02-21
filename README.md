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

#### Browser

```bash
$ bower install transduce
```

* [Development](https://raw.githubusercontent.com/transduce/transduce/master/build/transduce.js)
* [Minified](https://raw.githubusercontent.com/transduce/transduce/master/build/transduce.min.js)

Structured to allow creation of custom builds by loading only desired libs.  For example, see:

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
var into = require('transduce/base/into'),
    compose = require('transduce/base/compose'),
    cat = require('transduce/base/cat'),
    map = require('transduce/base/map'),
    unshift = require('transduce/array/unshift')

var transducer = compose(cat, unshift(0), map(add(1)))
into([], transducer, [[1,2],[3,4],[5,6]])
// [1,2,3,4,5,6,7])

```

Too explicit? Require the packages:

```javascript
  var base = require('transduce/base'),
      array = require('transduce/array')
  var transducer = base.compose(base.cat, array.unshift(0), base.map(add(1)))
  base.into([], transducer, [[1,2],[3,4],[5,6]])
  // [1,2,3,4,5,6,7]
```

### Definitions

##### Input Source
A source of values, normally a collection, `coll`.  This library supports arrays, plain objects, strings, and anything that can be converted to iterators (see `iterator` package below).  Input sources can also be push based, see `push` package below.

##### Reducing Function
A two arity function, `rf`, appropriate for passing to `reduce`. The first argument is the accumulator and the second argument is the iteration value.  When using transducers, the accumulator is normally a collection, but it is not required.

##### Initial Value
The initial accumulator value, `init` to use with Reduce.

##### Transformer
An object that provides a reducing function, `step`, initial value function, `init`, and result extraction function, `result`.  Combines the steps of reduce into a single object.

##### Reduce
A function that folds over an input source to produce an Output Source.  Accepts a Reducing Function or Transformer, `xf`, as the first argument, an optional initial value, `init`, as the second argument and an Input Source, `coll` as the third argument.

Also known as `foldLeft` or `foldl` in other languages and libraries.

The function begins with calling the Reducing Function of `xf`, `step`, with the initial accumulator, `init`, and the first item of Input Source, `coll`.  The return value from the reducing function is used as the next accumulator with the next item in `coll`. The process repeats until either `coll` is exhausted or `xf` indicates early termination with `reduced`. Finally, the result extraction function of `xf`, `result`, is called with the final accumulator to perform potentially delayed actions and optionally convert the accumulator to the Output Source.

Reduce defines a Transducible Process.

##### Transducer
A function, `t`, that accepts a transformer, `xf`, and returns a transformer. All transformations are defined in terms of transducers, independent of the Transducible Process. Can be composed directly to create new transducers.

##### Transducible Process
A process that begins with an initial value accumulator, steps through items of an input source and optionally transforming with transducer, `t`, and optionally completes with a result.  Transduce is one transducible process. Transducible Processes can also be push based. See `push` package below or [transduce-stream][2] for a few examples.  The same transducer can be used with any transducible process.

### API

Supports the following functions:

```javascript
// core
reduce: function(xf, init?, coll)
transduce: function(t, xf, init?, coll)
eduction: function(t, coll)
into: function(init, t?, coll?)
sequence: function(t, value)

compose: function(/*fns*/)
isReduced: function(value)
reduced: function(value, force?)
unreduced: function(value)

completing: function(rf, result?)
transformer: function(value)
transformer.symbol: Symbol('transformer') || '@@transformer'

iterator: function(value)
iterator.symbol: Symbol.iterator || '@@iterator'

identity: function(value)

// common
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

push {
  tap: function(interceptor)
  asCallback: function(t, xf?)
  asyncCallback: function(t, continuation, xf?)
}

string {
  split: function(separator, limit?)
  join: function(separator)
  nonEmpty: function()
  lines: function(limit?)
  chars: function(limit?)
  words: function(delimiter?, limit?)
}

unique {
  dedupe: function()
  unique: function(f?)
}

iterators {
  toArray: function(value)
  range: function(start?, stop, step?)
  count: function(start?, step?)
  cycle: function(iter)
  repeat: function(elem, n?)
  chain: function(/*args*/)
}
```
#### Core

Core functionality mixed into `transduce` directly or available by explictly requiring from `transduce/core`, e.g. `require('transduce').reduce` or `require('transduce/core/reduce')`.

##### reduce(xf, init?, coll)
Reduces over a transformation. If `xf` is not a `transformer`, it is converted to one using `completing`. Arrays are special cased to reduce using for loop and to allow transducers using `reduced`.  If `coll` has a `reduce` method, it is called with `xf.step` and `init`. Otherwise,`coll` is converted to an `iterator`.  If the function is called with arity-2, the `xf.init()` is used as the `init` value.

##### transduce(t, xf, init?, coll)
Transduces over a transformation. The transducer `t` is initialized with `xf` and is passed to `reduce`. `xf` is converted to a `transformer` if it is not one already using `completing`. If the function is called with arity-3, the `xf.init()` is used as the `init` value.

##### eduction(t, coll)
Creates an iterable and reducible application of the collection `coll` transformed by transducer`t`.  The returned eduction will be iterable using `sequence` and have a `reduce(rf, init)` method using `transduce`.

##### into(init, t?, coll?)
Returns a new collection appending all items into `init` by passing all items from source collection `coll` through the optional transducer `t`.  Chooses transformer, `xf` from type of `init`.  Can be array, object, string or have `@@transformer`. `coll` is converted to an `iterator`.  If `coll` is not provided, returns a curried function using `transformer` from `init` and the same transformation can be used for multiple collections.

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

##### transformer.symbol
Symbol (or a string that acts as symbols) for [`@@transformer`][10] you can use to configure your custom objects.

##### iterator.iterator(value)
Returns the iterator for the parameter, invoking if has an iterator protocol or returning if has a next method. Returns `undefined` if cannot create an iterator.

The return value will either have a `next` function that can be invoked for iteration or will be undefined.

Converts arrays to iterators over each indexed item. Converts to functions to infinite iterators that always call function on next.

##### iterator.symbol
Symbol (or a string that acts as symbols) for `@@iterator` you can use to configure your custom objects.
##### identity(value)
Always returns value

#### Common
Common transducers mixed into `transduce` directly or available by explictly requiring from `transduce/common`, e.g. `require('transduce').map` or `require('transduce/common/map')`.

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

#### Array
Use Array methods as Transducers.  Treats each stepped item as an item in the array, and defines transducers that step items with the same contract as array methods.

##### array.forEach(callback)
Passes every item through unchanged, but after executing `callback(item, idx)`.  Can be useful for "tapping into" composed transducer pipelines.   The return value of the callback is ignored, item is passed unchanged.

##### array.find(predicate)
Like filter, but terminates transducer pipeline with the result of the first item that passes the predicate test. Will always step either 0 (if not found) or 1 (if found) values.

##### array.push(/*args*/)
Passes all items straight through until the result is requested.  Once completed, steps every argument through the pipeline, before returning the result.  This effectively pushes values on the end of the stream.

##### array.unshift(/*args*/)
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

##### math.min(f?) / math.max(f?)
Steps the min/max value on the result of the transformation. if `f` is provided, it is called with each item and the return value is used to compare values. Otherwise, the items are compared as numbers

#### Push
Normally transducers are used with pull streams: reduce "pulls" values out of an array, iterator, etc.  This library adds basic support for using transducers with push streams. See [transduce-stream][2] for using transducers with Node.js streams, or the [underscore-transducer][6] [demo][7] for an example of using transducers as event listeners.

##### push.tap(interceptor)
Transducer that invokes interceptor with each result and input, and then passes through input. The primary purpose of this method is to "tap into" a method chain, in order to perform operations on intermediate results within the chain.  Executes interceptor with current result and input.

##### push.asCallback(t, xf?)
Creates a callback that starts a transducer process and accepts parameter as a new item in the process. Each item advances the state of the transducer. If the transducer exhausts due to early termination, all subsequent calls to the callback will no-op and return the computed result. If the callback is called with no argument, the transducer terminates, and all subsequent calls will no-op and return the computed result. The callback returns undefined until completion. Once completed, the result is always returned. If `xf` is not defined, maintains `lastValue()` and does not buffer results.

##### push.asyncCallback(t, continuation, xf?)
Creates an async callback that starts a transducer process and accepts parameter cb(err, item) as a new item in the process. The returned callback and the optional continuation follow Node.js conventions with  fn(err, item). Each item advances the state  of the transducer, if the continuation is provided, it will be called on completion or error. An error will terminate the transducer and be propagated to the continuation.  If the transducer exhausts due to early termination, any further call will be a no-op. If the callback is called with no item, it will terminate the transducer process. If `xf` is not defined, maintains `lastValue()` and does not buffer results.

#### String
Transduce over sequences of strings. Particularly useful with [transduce-stream][2].

Treats every item as a substring, and splits across the entire transducer sequence.  This allows functions to work with chunks sent through streams.  When using transducers with streams, it is helpful to compose the transformation that you want with one of these functions to operate against a given line/word/etc.

##### string.split(separator, limit?)
Works like `''.split` but splits across entire sequence of items. Accepts separator (String or RegExp) and optional limit of words to send.

##### string.join(separator)
Buffers all items and joins results on transducer `result`.

##### string.nonEmpty()
Only steps items that are non empty strings (`input.trim().length > 0`).

##### string.lines(limit?) / string.chars(limit?) / string.words(delimiter?, limit?)
Split chunks into and steps each line/char/word with optional limit.

#### Unique
Transducers to remove duplicate values from the transformation.

##### unique.dedupe()
Removes consecutive duplicates from the transformation. Subsequent stepped values are checked for equality using `===`.

##### unique.unique(f?)
Produce a duplicate-free version of the transformation. If `f` is passed, it will be called with each item and the return value for uniqueness check.  Uniqueness is checked across all values already seen, and as such, the items (or computed checks) are buffered.

#### Iterators

##### iterators.toArray(value)
Converts the value to an iterator and iterates into an array.

##### iterators.range(start?, stop, step?)
Create a range of integers.  From start (default 0, inclusive) to stop (exclusive) incremented by step (default 1).

##### iterators.count(start?, step?)
Creates an infinite counting iterator from start (default 0) and incremented by step (default 1)

##### iterators.cycle(iter)
Creates an infinite iterator that accepts an iterable and repeatedly steps through every item of iterator. Once iterator completes, a new iterator is created from the iterable and steps through again.

##### iterators.repeat(elem, n?)
Repeats an elem up to n times.  If n is undefined, creates an infinite iterator that steps the element.

##### iterators.chain(/*args*/)
Combine multiple iterables into a chained iterable.  Once the first argument is exhausted, moves onto the next, until all argument iterables are exhausted.

### Credits

Extracted from [underscore-transducer][6], which was created initially as a translation from [Clojure][8]. Now compatible with and inspired by protocols defined by [transducers-js][4] and [transducers.js][5].

### License
MIT

[1]: https://github.com/transduce
[2]: https://github.com/transduce/transduce-stream
[3]: http://simplectic.com/blog/2014/transducers-explained-1/
[4]: https://github.com/cognitect-labs/transducers-js
[5]: https://github.com/jlongster/transducers.js
[6]: https://github.com/kevinbeaty/underscore-transducer
[7]: http://simplectic.com/projects/underscore-transducer/
[8]: http://clojure.org/transducers
[10]: https://github.com/jlongster/transducers.js#the-transformer-protocol
