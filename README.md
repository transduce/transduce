## Transduce
[![Build Status](https://secure.travis-ci.org/transduce/transduce.svg)](http://travis-ci.org/transduce/transduce)

Transducers for JavaScript. Collected as a convenience for an aggregated API. Any function or transducer below can be bundled separately in browserify builds by requiring with path from `transduce`.

Compatible with and inspired by both [transducers-js][4] and [transducers.js][5].

If you are not familiar with transducers, check out [Transducers Explained][3].

## API

Currently supports the following functions:

```javascript
// base functions
reduce: function(f, init, coll)
transduce: function(xf, f, init, coll)
into: function(to, xf, from)
toArray: function(xf?, coll)

// base transducers
map: function(mappingFunction)
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

// base utils
compose: function(/*fns*/)
isReduced: function(value)
reduced: function(value, force?)
unreduced: function(value)

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
  asCallback: function(xf, reducer)
  asyncCallback: function(xf, continuation, reducer)
}

string {
  split: function(separator, limit)
  join: function(separator)
  nonEmpty: function()
  lines: function(limit)
  chars: function(limit)
  words: function(delimiter, limit)
}

unique {
  dedupe: function()
  unique: function(f?)
}

iterator {
  symbol: Symbol.iterator || '@@iterator'
  isIterable: function(value)
  isIterator: function(value)
  iterable: function(value)
  iterator: function(value)
  toArray: function(value)
  sequence: function(xf, value)
}

transformer {
  symbol: Symbol('transformer') || '@@transformer'
  isTransformer: function(value)
  transformer: function(value)
}

util {
  isFunction: function(value)
  isArray: function(value)
  isString: function(value)
  isRegExp: function(value)
  isNumber: function(value)
  isUndefined: function(value)
  identity: function(value)
  arrayPush: function(arr, item)
  objectMerge: function(obj, item)
  stringAppend: function(str, item)
}
```

##### reduce(f, init, coll)
Reduces over a transformation, `f` is converted to a `transformer` and coll is converted to an `iterator`.   Arrays are special cased to reduce using for loop.

##### transduce(xf, f, init, coll)
Transduces over a transformation, `f` is converted to a `transformer` and the initialized transformer is passed to reduce.

##### into(to, xf, from)
Returns a new collection appending all items into the empty collection `to` by passing all items from source collection `from` through the transformation `xf`.  Chooses appropriate step function from type of `to`.  Can be array, object, string or have `@@transformer`.

##### toArray(xf?, coll)
Transduce a collection into an array with an optional transformation.

### Transducers

##### map(mappingFunction)
Transducer that steps all items after applying a `mappingFunction` to each item.

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

##### partitionAll(n)
Partitions the source into arrays of size `n`. When transformer completes, the transformer will be stepped with any remaining items.

##### partitionBy(f)
Partitions the source into sub arrays when the value of the function `f` changes equality.  When transformer completes, the transformer will be stepped with any remaining items.

### Array
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

### Math

##### math.min(f?) / math.max(f?)
Steps the min/max value on the result of the transformation. if `f` is provided, it is called with each item and the return value is used to compare values. Otherwise, the items are compared as numbers

### Push
Normally transducers are used with pull streams: reduce "pulls" values out of an array, iterator, etc.  This library adds basic support for using transducers with push streams. See [transduce-stream][2] for using transducers with Node.js streams, or the [underscore-transducer][6] [demo][7] for an example of using transducers as event listeners.

##### push.tap(interceptor)
Transducer that invokes interceptor with each result and input, and then passes through input. The primary purpose of this method is to "tap into" a method chain, in order to perform operations on intermediate results within the chain.  Executes interceptor with current result and input.

##### push.asCallback(xf, reducer)
Creates a callback that starts a transducer process and accepts parameter as a new item in the process. Each item advances the state of the transducer. If the transducer exhausts due to early termination, all subsequent calls to the callback will no-op and return the computed result. If the callback is called with no argument, the transducer terminates, and all subsequent calls will no-op and return the computed result. The callback returns undefined until completion. Once completed, the result is always returned. If reducer is not defined, maintains last value and does not buffer results.

##### push.asyncCallback(xf, continuation, reducer)
Creates an async callback that starts a transducer process and accepts parameter cb(err, item) as a new item in the process. The returned callback and the optional continuation follow Node.js conventions with  fn(err, item). Each item advances the state  of the transducer, if the continuation is provided, it will be called on completion or error. An error will terminate the transducer and be propagated to the continuation.  If the transducer exhausts due to early termination, any further call will be a no-op. If the callback is called with no item, it will terminate the transducer process. If reducer is not defined, maintains last value and does not buffer results.


### String
Transduce over sequences of strings. Particularly useful with [transduce-stream][2].

Treats every item as a substring, and splits across the entire transducer sequence.  This allows functions to work with chunks sent through streams.  When using transducers with streams, it is helpful to compose the transformation that you want with one of these functions to operate against a given line/word/etc.

##### string.split(separator, limit)
Works like `''.split` but splits across entire sequence of items. Accepts separator (String or RegExp) and limit of words to send.

##### string.join(separator)
Buffers all items and joins results on transducer `result`.

##### string.nonEmpty()
Only steps items that are non empty strings (`input.trim().length > 0`).

##### string.lines(limit) / string.chars(limit) / string.words(delimiter, limit)
Split chunks into and steps each line/char/word.

### Unique
Transducers to remove duplicate values from the transformation.

##### unique.dedupe()
Removes consecutive duplicates from the transformation. Subsequent stepped values are checked for equality using `===`.

##### unique.unique(f?)
Produce a duplicate-free version of the transformation. If `f` is passed, it will be called with each item and the return value for uniqueness check.  Uniqueness is checked across all values already seen, and as such, the items (or computed checks) are buffered.

### Iterator Protocol

##### iterator.symbol

Symbol (or a string that acts as symbols) for `@@iterator` you can use to configure your custom objects.

##### iterator.isIterable(value)
Does the parameter conform to the iterable protocol?

##### iterator.iterable(value)
Returns the iterable for the parameter.  Returns value if conforms to iterable protocol. Returns `undefined` if cannot return en iterable.

The return value will either conform to iterator protocol that can be invoked for iteration or will be undefined.

Supports anything that returns true for `isIterable` and converts arrays to iterables over each indexed item. Converts to functions to infinite iterables that always call function on next

##### iterator.isIterator(value)
Does the parameter have an iterator protocol or have a next method?

##### iterator.iterator(value)
Returns the iterator for the parameter, invoking if has an iterator protocol or returning if has a next method. Returns `undefined` if cannot create an iterator.

The return value will either have a `next` function that can be invoked for iteration or will be undefined.

Supports anything that returns true for `isIterator` and converts arrays to iterators over each indexed item. Converts to functions to infinite iterators that always call function on next.

##### iterator.toArray(value)
Converts the value to an iterator and iterates into an array.

##### iterator.sequence(xf, value)
Create an ES6 Iterable by transforming an input source using transducer `xf`.


### Transformer Protocol

##### transformer.symbol
Symbol (or a string that acts as symbols) for [`@@transformer`][10] you can use to configure your custom objects.


##### transformer.isTransformer(value)
Does the parameter have a transformer protocol or have `init`, `step`, `result` functions?

##### transformer.transformer(value)
Attempts to convert the parameter into a transformer.  If cannot be converted, returns `undefined`.  If defined, the return value will have `init`, `step`, `result` functions that can be used for transformation.  Converts arrays (`arrayPush`), strings (`stringAppend`), objects (`objectMerge`), functions (wrap as reducing function) or anything that `isTransformer` into a transformer.

### Util

##### util.compose(/\*fns\*/)
Simple function composition of arguments. Useful for composing (combining) transducers.

##### util.isReduced(value)
Is the value reduced? (signal for early termination)

##### util.reduced(value, force?)
Ensures the value is reduced (useful for early termination). If `force` is not provided or `false`, only wraps with Reduced value if not already `isReduced`.  If `force` is `true`, always wraps value with Reduced value.

##### util.unreduced(value)
Ensure the value is not reduced (unwraps reduced values if necessary)

##### util.identity(value)
Always returns value

##### util.arrayPush(arr, item)
Array.push as a reducing function.  Calls push and returns array.

##### util.objectMerge(object, item)
Merges the item into the object.  If `item` is an array of length 2, uses first (0 index) as the key and the second (1 index) as the value.  Otherwise iterates over own properties of items and merges values with same keys into the result object.

##### util.stringAppend(string, item)
Appends item onto result using `+`.

[1]: https://github.com/transduce
[2]: https://github.com/transduce/transduce-stream
[3]: http://simplectic.com/blog/2014/transducers-explained-1/
[4]: https://github.com/cognitect-labs/transducers-js
[5]: https://github.com/jlongster/transducers.js
[6]: https://github.com/kevinbeaty/underscore-transducer
[7]: http://simplectic.com/projects/underscore-transducer/
[10]: https://github.com/jlongster/transducers.js#the-transformer-protocol
