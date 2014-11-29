## Transduce
[![Build Status](https://secure.travis-ci.org/transduce/transduce.svg)](http://travis-ci.org/transduce/transduce)

Transducers for JavaScript using the [transduce][1] libraries. Collected as a convenience for an aggregated API. Any library below can be installed standalone and bundled seperately in browserify builds. 

Compatible with and inspired by both [transducers-js][4] and [transducers.js][5].

If you are not familiar with transducers, check out [Transducers Explained][3].

## API

Currently supports the following methods:

```javascript
reduce: function(f, init, coll);
transduce: function(xf, f, init, coll);
into: function(to, xf, from);
toArray: function(xf?, coll);

// transducers
map: function(mappingFunction);
filter: function(predicate);
remove: function(predicate);
take: function(n);
takeWhile: function(predicate);
drop: function(n);
dropWhile: function(predicate);
cat: transducer
mapcat: function(f);
partitionAll: function(n);
partitionBy: function(f);

// iterator-protocol
isIterable: function(value);
isIterator: function(value);
iterable: function(value);
iterator: function(value);

// transformer-protocol
isTransformer: function(value){},
transformer: function(value){},

// transduce-reduced
isReduced: function(value){}
reduced: function(value, force?){}
unreduced: function(value){}
deref: unreduced

// transduce-util
protocols: {iterator, transformer}
isFunction: function(value){}
isArray: function(value){}
isString: function(value){}
isRegExp: function(value){}
isNumber: function(value){}
isUndefined: function(value){}
identity: function(value){}
compose: function(/*fns*/){}
arrayPush: function(arr, item){}
objectMerge: function(obj, item){}
stringAppend: function(str, item){}
```

##### reduce(f, init, coll)
Reduces over a transformation, `f` is converted to a `transformer` and coll is converted to an `iterator` using [transduce-protocol][1]. Arrays are special cased to reduce using for loop.

From [transduce-reduce](https://github.com/transduce/transduce-reduce)

##### transduce(xf, f, init, coll)
Transduces over a transformation, `f` is converted to a `transformer` using [transduce-protocol][1] and the initialized transformer is passed to [transduce-reduce][4].

From [transduce-transduce](https://github.com/transduce/transduce-transduce)

##### into(to, xf, from)
Returns a new collection appending all items into the empty collection `to` by passing all items from source collection `from` through the transformation `xf`.  Chooses appropriate step function from type of `to`.  Can be array, object, string or have `@@transformer`.

From [transduce-into](https://github.com/transduce/transduce-into)

##### toArray(xf?, coll)
Transduce a collection into an array with an optional transformation.

From [transduce-toarray](https://github.com/transduce/transduce-toarray)

### Transducers

##### map(mappingFunction)
Transducer that steps all items after applying a `mappingFunction` to each item.

From [transduce-map](https://github.com/transduce/transduce-map)

##### filter(predicate)
Transducer that steps items which pass predicate test.

From [transduce-filter](https://github.com/transduce/transduce-filter)

##### remove(predicate)
Transducer that removes all items that pass predicate.

From [transduce-remove](https://github.com/transduce/transduce-remove)

##### take(n)
Transducer that steps first `n` items and then terminates with `reduced`.

From [transduce-take](https://github.com/transduce/transduce-take)

##### takeWhile(predicate)
Transducer that take items until predicate returns true. Terminates with reduce when predicate returns true.

From [transduce-takewhile](https://github.com/transduce/transduce-takewhile)

##### drop(n)
Transducer that drops first `n` items and steps remaining untouched.
From [transduce-drop](https://github.com/transduce/transduce-drop)

##### dropWhile(predicate)
Transducer that drops items until predicate returns true and steps remaining untouched.

From [transduce-dropwhile](https://github.com/transduce/transduce-dropwhile)

##### cat
Concatenating transducer.  Reducing over every item in the transformation using provided transformer.

From [transduce-cat](https://github.com/transduce/transduce-cat)

##### mapcat(mappingFunction)
Transducer that applies a `mappingFunction` to each item, then concatenates the result of the mapping function.  Same is `compose(map(mappingFunction), cat)`

From [transduce-mapcat](https://github.com/transduce/transduce-mapcat)

##### partitionAll(n)
Partitions the source into arrays of size `n`. When transformer completes, the transformer will be stepped with any remaining items.

From [transduce-partitionall](https://github.com/transduce/transduce-partitionall)

##### partitionBy(f)
Partitions the source into sub arrays when the value of the function `f` changes equality.  When transformer completes, the transformer will be stepped with any remaining items.

From [transduce-partitionby](https://github.com/transduce/transduce-partitionby)

### Iterator Protocol
Mixes in all methods and [iterator-protocol][11].

##### isIterable(value)
Does the parameter conform to the iterable protocol?

##### iterable(value)
Returns the iterable for the parameter.  Returns value if conforms to iterable protocol. Returns `undefined` if cannot return en iterable.

The return value will either conform to iterator protocol that can be invoked for iteration or will be undefined.

Supports anything that returns true for `isIterable` and converts arrays to iterables over each indexed item. Converts to functions to infinite iterables that always call function on next

##### isIterator(value)
Does the parameter have an iterator protocol or have a next method?

##### iterator(value)
Returns the iterator for the parameter, invoking if has an iterator protocol or returning if has a next method. Returns `undefined` if cannot create an iterator.

The return value will either have a `next` function that can be invoked for iteration or will be undefined.

Supports anything that returns true for `isIterator` and converts arrays to iterators over each indexed item. Converts to functions to infinite iterators that always call function on next.

### Transformer Protocol
Mixes in all methods [transformer-protocol][14].

##### isTransformer(value)
Does the parameter have a [transformer protocol][10] or have `init`, `step`, `result` methods?

##### transformer(value)
Attempts to convert the parameter into a transformer.  If cannot be converted, returns `undefined`.  If defined, the return value will have `init`, `step`, `result` methods that can be used for transformation.  Converts arrays (`arrayPush`), strings (`stringAppend`), objects (`objectMerge`), functions (wrap as reducing function) or anything that `isTransformer` into a transformer.

### Reduced
Mixes in all methods from [transduce-reduced][13].

##### isReduced(value)
Is the value reduced? (signal for early termination)

#### reduced(value, force?)
Ensures the value is reduced (useful for early termination). If `force` is not provided or `false`, only wraps with Reduced value if not already `isReduced`.  If `force` is `true`, always wraps value with Reduced value.

##### unreduced/deref(value)
Ensure the value is not reduced (unwraps reduced values if necessary)

### Util 

Mixes in all methods from [transduce-util][12].

##### protocols
Symbols (or strings that act as symbols) for `@@iterator` and [`@@transformer`][10] that you can use to configure your custom objects.

##### identity(value)
Always returns value

##### compose()
Simple function composition of arguments. Useful for composing (combining) transducers.

##### arrayPush(arr, item)
Array.push as a reducing function.  Calls push and returns array;

##### objectMerge(object, item)
Merges the item into the object.  If `item` is an array of length 2, uses first (0 index) as the key and the second (1 index) as the value.  Otherwise iterates over own properties of items and merges values with same keys into the result object.

##### stringAppend(string, item)
Appends item onto result using `+`.

[1]: https://github.com/transduce
[3]: http://simplectic.com/blog/2014/transducers-explained-1/
[4]: https://github.com/cognitect-labs/transducers-js
[5]: https://github.com/jlongster/transducers.js
[10]: https://github.com/jlongster/transducers.js#the-transformer-protocol
[11]: https://github.com/transduce/iterator-protocol
[12]: https://github.com/transduce/transduce-util
[13]: https://github.com/transduce/transduce-reduced
[14]: https://github.com/transduce/transformer-protocol
