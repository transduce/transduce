## Duce
[![Build Status](https://secure.travis-ci.org/transduce/duce.svg)](http://travis-ci.org/transduce/duce)

Transducers for JavaScript using the [transduce][1] libraries.

Currently supports the following methods:

```javascript
transduce: function(xf, f, init, coll);
reduce: function(f, init, coll);
map: function(f);
filter: function(pred);
toArray: function(xf, coll):
```
Also mixes in all methods in [transduce-protocol][2].

[1]: https://github.com/transduce/transduce
[2]: https://github.com/transduce/transduce-protocol
