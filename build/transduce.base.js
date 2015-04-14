(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.transduce = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports = require(3)

},{"3":3}],2:[function(require,module,exports){
'use strict';

var _lastValue;

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

exports.__esModule = true;

// given a reduce implementation, returns a transduce implementation
// that delegates to the implementation after handling multiple arity
// and dynamic argument types
exports.transduceImpl = transduceImpl;

// given a reduce implementation, returns a reduce implementation
// that delegates to reduce after handling multiple arity
// and dynamic argument types
exports.reduceImpl = reduceImpl;

// given a reduce implementation, returns an into implementation
// that delegates to reduce after handling currying, multiple arity
// and dynamic argument types
exports.intoImpl = intoImpl;
exports.iterator = iterator;
exports.iterable = iterable;
exports.transformer = transformer;

var _protocols$isReduced$unreduced$identity$isArray$isFunction$isString = require(6);

var _protocols$transducer = _protocols$isReduced$unreduced$identity$isArray$isFunction$isString.protocols.transducer;
var tInit = _protocols$transducer.init;
var tStep = _protocols$transducer.step;
var tResult = _protocols$transducer.result;

var symIter = _protocols$isReduced$unreduced$identity$isArray$isFunction$isString.protocols.iterator;
function transduceImpl(reduce) {
  return function transduce(t, xf, init, coll) {
    if (_protocols$isReduced$unreduced$identity$isArray$isFunction$isString.isFunction(xf)) {
      xf = completing(xf);
    }
    xf = t(xf);
    if (arguments.length === 3) {
      coll = init;
      init = xf[tInit]();
    }
    return reduce(xf, init, coll);
  };
}

function reduceImpl(_reduce) {
  return function reduce(xf, init, coll) {
    if (_protocols$isReduced$unreduced$identity$isArray$isFunction$isString.isFunction(xf)) {
      xf = completing(xf);
    }
    if (arguments.length === 2) {
      coll = init;
      init = xf[tInit]();
    }
    return _reduce(xf, init, coll);
  };
}

function intoImpl(reduce) {
  return function into(init, t, coll) {
    var xf = transformer(init),
        len = arguments.length;

    if (len === 1) {
      return intoCurryXf(xf);
    }

    if (len === 2) {
      if (_protocols$isReduced$unreduced$identity$isArray$isFunction$isString.isFunction(t)) {
        return intoCurryXfT(xf, t);
      }
      coll = t;
      return reduce(xf, init, coll);
    }
    return reduce(t(xf), init, coll);
  };

  function intoCurryXf(xf) {
    return function intoXf(t, coll) {
      if (arguments.length === 1) {
        if (_protocols$isReduced$unreduced$identity$isArray$isFunction$isString.isFunction(t)) {
          return intoCurryXfT(xf, t);
        }
        coll = t;
        return reduce(xf, xf[tInit](), coll);
      }
      return reduce(t(xf), xf[tInit](), coll);
    };
  }

  function intoCurryXfT(xf, t) {
    return function intoXfT(coll) {
      return reduce(t(xf), xf[tInit](), coll);
    };
  }
}

// Turns a step function into a transfomer with init, step, result
// If init not provided, calls `step()`.  If result not provided, calls `idenity`
var completing = function completing(rf, result) {
  return new Completing(rf, result);
};
exports.completing = completing;
function Completing(rf, result) {
  this[tInit] = rf;
  this[tStep] = rf;
  this[tResult] = result || _protocols$isReduced$unreduced$identity$isArray$isFunction$isString.identity;
}

// Convert a value to an iterable
var has = ({}).hasOwnProperty;

function iterator(value) {
  return iterable(value)[symIter]();
}

function iterable(value) {
  var it;
  if (value[symIter] !== void 0) {
    it = value;
  } else if (_protocols$isReduced$unreduced$identity$isArray$isFunction$isString.isArray(value) || _protocols$isReduced$unreduced$identity$isArray$isFunction$isString.isString(value)) {
    it = new ArrayIterable(value);
  } else if (_protocols$isReduced$unreduced$identity$isArray$isFunction$isString.isFunction(value)) {
    it = new FunctionIterable(function () {
      return { done: false, value: value() };
    });
  } else if (_protocols$isReduced$unreduced$identity$isArray$isFunction$isString.isFunction(value.next)) {
    it = new FunctionIterable(function () {
      return value.next();
    });
  } else {
    it = new ObjectIterable(value);
  }
  return it;
}

var ArrayIterable = (function () {
  function ArrayIterable(arr) {
    _classCallCheck(this, ArrayIterable);

    this.arr = arr;
  }

  ArrayIterable.prototype[symIter] = function () {
    var _this = this;

    var idx = 0;
    return {
      next: function next() {
        if (idx >= _this.arr.length) {
          return { done: true };
        }
        return { done: false, value: _this.arr[idx++] };
      }
    };
  };

  return ArrayIterable;
})();

exports.ArrayIterable = ArrayIterable;

var FunctionIterable = (function () {
  function FunctionIterable(fn) {
    _classCallCheck(this, FunctionIterable);

    this.fn = fn;
  }

  FunctionIterable.prototype[symIter] = function () {
    return { next: this.fn };
  };

  return FunctionIterable;
})();

exports.FunctionIterable = FunctionIterable;

var ObjectIterable = (function () {
  function ObjectIterable(obj) {
    _classCallCheck(this, ObjectIterable);

    this.obj = obj;
    this.keys = Object.keys(obj);
  }

  ObjectIterable.prototype[symIter] = function () {
    var _this2 = this;

    var idx = 0;
    return {
      next: function next() {
        if (idx >= _this2.keys.length) {
          return { done: true };
        }
        var key = _this2.keys[idx++];
        return { done: false, value: [key, _this2.obj[key]] };
      }
    };
  };

  return ObjectIterable;
})();

exports.ObjectIterable = ObjectIterable;

// converts a value to a transformer
var slice = Array.prototype.slice;

var lastValue = (_lastValue = {}, _lastValue[tInit] = function () {}, _lastValue[tStep] = function (result, input) {
  return input;
}, _lastValue[tResult] = _protocols$isReduced$unreduced$identity$isArray$isFunction$isString.identity, _lastValue);

function transformer(value) {
  var xf;
  if (value === void 0 || value === null) {
    xf = lastValue;
  } else if (_protocols$isReduced$unreduced$identity$isArray$isFunction$isString.isFunction(value[tStep])) {
    xf = value;
  } else if (_protocols$isReduced$unreduced$identity$isArray$isFunction$isString.isFunction(value)) {
    xf = completing(value);
  } else if (_protocols$isReduced$unreduced$identity$isArray$isFunction$isString.isArray(value)) {
    xf = new ArrayTransformer(value);
  } else if (_protocols$isReduced$unreduced$identity$isArray$isFunction$isString.isString(value)) {
    xf = new StringTransformer(value);
  } else {
    xf = new ObjectTransformer(value);
  }
  return xf;
}

// Pushes value on array, using optional constructor arg as default, or [] if not provided
// init will clone the default
// step will push input onto array and return result
// result is identity

var ArrayTransformer = (function () {
  function ArrayTransformer(defaultValue) {
    _classCallCheck(this, ArrayTransformer);

    this.defaultValue = defaultValue === void 0 ? [] : defaultValue;
  }

  ArrayTransformer.prototype[tInit] = function () {
    return slice.call(this.defaultValue);
  };

  ArrayTransformer.prototype[tStep] = function (result, input) {
    result.push(input);
    return result;
  };

  ArrayTransformer.prototype[tResult] = function (value) {
    return value;
  };

  return ArrayTransformer;
})();

exports.ArrayTransformer = ArrayTransformer;

// Appends value onto string, using optional constructor arg as default, or '' if not provided
// init will return the default
// step will append input onto string and return result
// result is identity

var StringTransformer = (function () {
  function StringTransformer(str) {
    _classCallCheck(this, StringTransformer);

    this.strDefault = str === void 0 ? '' : str;
  }

  StringTransformer.prototype[tInit] = function () {
    return this.strDefault;
  };

  StringTransformer.prototype[tStep] = function (result, input) {
    return result + input;
  };

  StringTransformer.prototype[tResult] = function (value) {
    return value;
  };

  return StringTransformer;
})();

exports.StringTransformer = StringTransformer;

// Merges value into object, using optional constructor arg as default, or {} if undefined
// init will clone the default
// step will merge input into object and return result
// result is identity

var ObjectTransformer = (function () {
  function ObjectTransformer(obj) {
    _classCallCheck(this, ObjectTransformer);

    this.objDefault = obj === void 0 ? {} : objectMerge({}, obj);
  }

  ObjectTransformer.prototype[tInit] = function () {
    return objectMerge({}, this.objDefault);
  };

  ObjectTransformer.prototype[tResult] = function (value) {
    return value;
  };

  return ObjectTransformer;
})();

exports.ObjectTransformer = ObjectTransformer;

ObjectTransformer.prototype[tStep] = objectMerge;
function objectMerge(result, input) {
  if (_protocols$isReduced$unreduced$identity$isArray$isFunction$isString.isArray(input) && input.length === 2) {
    result[input[0]] = input[1];
  } else {
    var prop;
    for (prop in input) {
      if (has.call(input, prop)) {
        result[prop] = input[prop];
      }
    }
  }
  return result;
}
//# sourceMappingURL=_internal.js.map
},{"6":6}],3:[function(require,module,exports){
'use strict';

var _interopRequireWildcard = function (obj) { return obj && obj.__esModule ? obj : { 'default': obj }; };

var _defaults = function (obj, defaults) { var keys = Object.getOwnPropertyNames(defaults); for (var i = 0; i < keys.length; i++) { var key = keys[i]; var value = Object.getOwnPropertyDescriptor(defaults, key); if (value && value.configurable && obj[key] === undefined) { Object.defineProperty(obj, key, value); } } return obj; };

exports.__esModule = true;

var _core = require(4);

_defaults(exports, _interopRequireWildcard(_core));

var _transducers = require(5);

_defaults(exports, _interopRequireWildcard(_transducers));
//# sourceMappingURL=base.js.map
},{"4":4,"5":5}],4:[function(require,module,exports){
'use strict';

var _stepTransformer;

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

exports.__esModule = true;

// sequence
exports.sequence = sequence;

var _Transducer$compose$identity$protocols$isReduced$reduced$unreduced$isArray$isFunction$isIterable$isIterator = require(6);

// Transformer, iterable, completing

var _transduceImpl$reduceImpl$intoImpl$ArrayIterable$FunctionIterable$ObjectIterable$ArrayTransformer$StringTransformer$ObjectTransformer$transformer$iterable$iterator$completing = require(2);

var _protocols$transducer = _Transducer$compose$identity$protocols$isReduced$reduced$unreduced$isArray$isFunction$isIterable$isIterator.protocols.transducer;
var tInit = _protocols$transducer.init;
var tStep = _protocols$transducer.step;
var tResult = _protocols$transducer.result;
var tReduce = _protocols$transducer.reduce;

var symIter = _Transducer$compose$identity$protocols$isReduced$reduced$unreduced$isArray$isFunction$isIterable$isIterator.protocols.iterator;exports.transformer = _transduceImpl$reduceImpl$intoImpl$ArrayIterable$FunctionIterable$ObjectIterable$ArrayTransformer$StringTransformer$ObjectTransformer$transformer$iterable$iterator$completing.transformer;
exports.iterable = _transduceImpl$reduceImpl$intoImpl$ArrayIterable$FunctionIterable$ObjectIterable$ArrayTransformer$StringTransformer$ObjectTransformer$transformer$iterable$iterator$completing.iterable;
exports.iterator = _transduceImpl$reduceImpl$intoImpl$ArrayIterable$FunctionIterable$ObjectIterable$ArrayTransformer$StringTransformer$ObjectTransformer$transformer$iterable$iterator$completing.iterator;
exports.completing = _transduceImpl$reduceImpl$intoImpl$ArrayIterable$FunctionIterable$ObjectIterable$ArrayTransformer$StringTransformer$ObjectTransformer$transformer$iterable$iterator$completing.completing;
exports.compose = _Transducer$compose$identity$protocols$isReduced$reduced$unreduced$isArray$isFunction$isIterable$isIterator.compose;
exports.identity = _Transducer$compose$identity$protocols$isReduced$reduced$unreduced$isArray$isFunction$isIterable$isIterator.identity;
exports.protocols = _Transducer$compose$identity$protocols$isReduced$reduced$unreduced$isArray$isFunction$isIterable$isIterator.protocols;
exports.isReduced = _Transducer$compose$identity$protocols$isReduced$reduced$unreduced$isArray$isFunction$isIterable$isIterator.isReduced;
exports.reduced = _Transducer$compose$identity$protocols$isReduced$reduced$unreduced$isArray$isFunction$isIterable$isIterator.reduced;
exports.unreduced = _Transducer$compose$identity$protocols$isReduced$reduced$unreduced$isArray$isFunction$isIterable$isIterator.unreduced;
exports.Transducer = _Transducer$compose$identity$protocols$isReduced$reduced$unreduced$isArray$isFunction$isIterable$isIterator.Transducer;
exports.isIterable = _Transducer$compose$identity$protocols$isReduced$reduced$unreduced$isArray$isFunction$isIterable$isIterator.isIterable;
exports.isIterator = _Transducer$compose$identity$protocols$isReduced$reduced$unreduced$isArray$isFunction$isIterable$isIterator.isIterator;
exports.ArrayIterable = _transduceImpl$reduceImpl$intoImpl$ArrayIterable$FunctionIterable$ObjectIterable$ArrayTransformer$StringTransformer$ObjectTransformer$transformer$iterable$iterator$completing.ArrayIterable;
exports.FunctionIterable = _transduceImpl$reduceImpl$intoImpl$ArrayIterable$FunctionIterable$ObjectIterable$ArrayTransformer$StringTransformer$ObjectTransformer$transformer$iterable$iterator$completing.FunctionIterable;
exports.ObjectIterable = _transduceImpl$reduceImpl$intoImpl$ArrayIterable$FunctionIterable$ObjectIterable$ArrayTransformer$StringTransformer$ObjectTransformer$transformer$iterable$iterator$completing.ObjectIterable;
exports.ArrayTransformer = _transduceImpl$reduceImpl$intoImpl$ArrayIterable$FunctionIterable$ObjectIterable$ArrayTransformer$StringTransformer$ObjectTransformer$transformer$iterable$iterator$completing.ArrayTransformer;
exports.StringTransformer = _transduceImpl$reduceImpl$intoImpl$ArrayIterable$FunctionIterable$ObjectIterable$ArrayTransformer$StringTransformer$ObjectTransformer$transformer$iterable$iterator$completing.StringTransformer;
exports.ObjectTransformer = _transduceImpl$reduceImpl$intoImpl$ArrayIterable$FunctionIterable$ObjectIterable$ArrayTransformer$StringTransformer$ObjectTransformer$transformer$iterable$iterator$completing.ObjectTransformer;

// Transduce, reduce, into
var reduce = _transduceImpl$reduceImpl$intoImpl$ArrayIterable$FunctionIterable$ObjectIterable$ArrayTransformer$StringTransformer$ObjectTransformer$transformer$iterable$iterator$completing.reduceImpl(_reduce);
exports.reduce = reduce;
var transduce = _transduceImpl$reduceImpl$intoImpl$ArrayIterable$FunctionIterable$ObjectIterable$ArrayTransformer$StringTransformer$ObjectTransformer$transformer$iterable$iterator$completing.transduceImpl(_reduce);
exports.transduce = transduce;
var into = _transduceImpl$reduceImpl$intoImpl$ArrayIterable$FunctionIterable$ObjectIterable$ArrayTransformer$StringTransformer$ObjectTransformer$transformer$iterable$iterator$completing.intoImpl(_reduce);

exports.into = into;
function _reduce(xf, init, coll) {
  if (_Transducer$compose$identity$protocols$isReduced$reduced$unreduced$isArray$isFunction$isIterable$isIterator.isArray(coll)) {
    return arrayReduce(xf, init, coll);
  }
  if (_Transducer$compose$identity$protocols$isReduced$reduced$unreduced$isArray$isFunction$isIterable$isIterator.isFunction(coll[tReduce])) {
    return methodReduce(xf, init, coll);
  }
  return iteratorReduce(xf, init, coll);
}

function arrayReduce(xf, init, arr) {
  var value = init,
      i = 0,
      len = arr.length;
  for (; i < len; i++) {
    value = xf[tStep](value, arr[i]);
    if (_Transducer$compose$identity$protocols$isReduced$reduced$unreduced$isArray$isFunction$isIterable$isIterator.isReduced(value)) {
      value = _Transducer$compose$identity$protocols$isReduced$reduced$unreduced$isArray$isFunction$isIterable$isIterator.unreduced(value);
      break;
    }
  }
  return xf[tResult](value);
}

function methodReduce(xf, init, coll) {
  var value = coll[tReduce](xf[tStep].bind(xf), init);
  return xf[tResult](value);
}

function iteratorReduce(xf, init, iter) {
  var value = init,
      next;
  iter = _transduceImpl$reduceImpl$intoImpl$ArrayIterable$FunctionIterable$ObjectIterable$ArrayTransformer$StringTransformer$ObjectTransformer$transformer$iterable$iterator$completing.iterator(iter);
  while (true) {
    next = iter.next();
    if (next.done) {
      break;
    }

    value = xf[tStep](value, next.value);
    if (_Transducer$compose$identity$protocols$isReduced$reduced$unreduced$isArray$isFunction$isIterable$isIterator.isReduced(value)) {
      value = _Transducer$compose$identity$protocols$isReduced$reduced$unreduced$isArray$isFunction$isIterable$isIterator.unreduced(value);
      break;
    }
  }
  return xf[tResult](value);
}

// transducer
var transducer = function transducer(step, result, init) {
  return function (xf) {
    return new FnTransducer(xf, step, result, init);
  };
};
exports.transducer = transducer;

var FnTransducer = (function (_Transducer) {
  function FnTransducer(xf, step, result, init) {
    _classCallCheck(this, FnTransducer);

    _Transducer.call(this, xf);

    this._init = init;
    this._step = step;
    this._result = result;

    this.xfInit = this.xfInit.bind(this);
    this.xfStep = this.xfStep.bind(this);
    this.xfResult = this.xfResult.bind(this);
  }

  _inherits(FnTransducer, _Transducer);

  FnTransducer.prototype[tInit] = function () {
    return this._init ? this._init(this.xfInit) : this.xfInit();
  };

  FnTransducer.prototype[tStep] = function (value, input) {
    return this._step ? this._step(this.xfStep, value, input) : this.xfStep(value, input);
  };

  FnTransducer.prototype[tResult] = function (value) {
    return this._result ? this._result(this.xfResult, value) : this.xfResult(value);
  };

  return FnTransducer;
})(_Transducer$compose$identity$protocols$isReduced$reduced$unreduced$isArray$isFunction$isIterable$isIterator.Transducer);

// eduction
var eduction = function eduction(t, coll) {
  return new Eduction(t, coll);
};
exports.eduction = eduction;

var Eduction = (function () {
  function Eduction(t, coll) {
    _classCallCheck(this, Eduction);

    this.t = t;
    this.coll = coll;
  }

  Eduction.prototype[symIter] = function () {
    return _transduceImpl$reduceImpl$intoImpl$ArrayIterable$FunctionIterable$ObjectIterable$ArrayTransformer$StringTransformer$ObjectTransformer$transformer$iterable$iterator$completing.iterator(sequence(this.t, this.coll));
  };

  Eduction.prototype[tReduce] = function (rf, init) {
    return transduce(this.t, rf, init, this.coll);
  };

  return Eduction;
})();

function sequence(t, coll) {
  return new LazyIterable(t, coll);
}

var LazyIterable = (function () {
  function LazyIterable(t, coll) {
    _classCallCheck(this, LazyIterable);

    this.t = t;
    this.coll = coll;
  }

  LazyIterable.prototype[symIter] = function () {
    return new LazyIterator(new Stepper(this.t, _transduceImpl$reduceImpl$intoImpl$ArrayIterable$FunctionIterable$ObjectIterable$ArrayTransformer$StringTransformer$ObjectTransformer$transformer$iterable$iterator$completing.iterator(this.coll)));
  };

  return LazyIterable;
})();

var LazyIterator = (function () {
  function LazyIterator(stepper) {
    _classCallCheck(this, LazyIterator);

    this.stepper = stepper;
    this.values = [];
  }

  LazyIterator.prototype.next = function next() {
    if (this.stepper && this.values.length === 0) {
      this.stepper.step(this);
    }
    return this.values.length ? { done: false, value: this.values.shift() } : { done: true };
  };

  return LazyIterator;
})();

var stepTransformer = (_stepTransformer = {}, _stepTransformer[tInit] = function () {}, _stepTransformer[tStep] = function (lt, input) {
  lt.values.push(input);
  return lt;
}, _stepTransformer[tResult] = function (lt) {
  lt.stepper = null;
  return lt;
}, _stepTransformer);

var Stepper = (function () {
  function Stepper(t, iter) {
    _classCallCheck(this, Stepper);

    this.xf = t(stepTransformer);
    this.iter = iter;
  }

  Stepper.prototype.step = function step(lt) {
    var next,
        result,
        values = lt.values,
        prevLen = values.length;
    while (prevLen === values.length) {
      next = this.iter.next();
      if (next.done) {
        this.xf[tResult](lt);
        break;
      }

      result = this.xf[tStep](lt, next.value);
      if (_Transducer$compose$identity$protocols$isReduced$reduced$unreduced$isArray$isFunction$isIterable$isIterator.isReduced(result)) {
        this.xf[tResult](lt);
        break;
      }
    }
  };

  return Stepper;
})();
//# sourceMappingURL=core.js.map
},{"2":2,"6":6}],5:[function(require,module,exports){
'use strict';

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

exports.__esModule = true;

var _Transducer$reduced$isReduced$unreduced$protocols$identity$compose = require(6);

var _reduce = require(4);

var _protocols$transducer = _Transducer$reduced$isReduced$unreduced$protocols$identity$compose.protocols.transducer;
var tStep = _protocols$transducer.step;
var tResult = _protocols$transducer.result;
var map = function map(f) {
  return function (xf) {
    return new Map(f, xf);
  };
};
exports.map = map;

var Map = (function (_Transducer) {
  function Map(f, xf) {
    _classCallCheck(this, Map);

    _Transducer.call(this, xf);
    this.f = f;
  }

  _inherits(Map, _Transducer);

  Map.prototype[tStep] = function (value, input) {
    return this.xfStep(value, this.f(input));
  };

  return Map;
})(_Transducer$reduced$isReduced$unreduced$protocols$identity$compose.Transducer);

var filter = function filter(p) {
  return function (xf) {
    return new Filter(p, xf);
  };
};
exports.filter = filter;

var Filter = (function (_Transducer2) {
  function Filter(p, xf) {
    _classCallCheck(this, Filter);

    _Transducer2.call(this, xf);
    this.p = p;
  }

  _inherits(Filter, _Transducer2);

  Filter.prototype[tStep] = function (value, input) {
    return this.p(input) ? this.xfStep(value, input) : value;
  };

  return Filter;
})(_Transducer$reduced$isReduced$unreduced$protocols$identity$compose.Transducer);

var remove = function remove(p) {
  return filter(function (x) {
    return !p(x);
  });
};

exports.remove = remove;
var take = function take(n) {
  return function (xf) {
    return new Take(n, xf);
  };
};
exports.take = take;

var Take = (function (_Transducer3) {
  function Take(n, xf) {
    _classCallCheck(this, Take);

    _Transducer3.call(this, xf);
    this.n = n;
  }

  _inherits(Take, _Transducer3);

  Take.prototype[tStep] = function (value, input) {
    if (this.n-- > 0) {
      value = this.xfStep(value, input);
    }
    if (this.n <= 0) {
      value = _Transducer$reduced$isReduced$unreduced$protocols$identity$compose.reduced(value);
    }
    return value;
  };

  return Take;
})(_Transducer$reduced$isReduced$unreduced$protocols$identity$compose.Transducer);

var takeWhile = function takeWhile(p) {
  return function (xf) {
    return new TakeWhile(p, xf);
  };
};
exports.takeWhile = takeWhile;

var TakeWhile = (function (_Transducer4) {
  function TakeWhile(p, xf) {
    _classCallCheck(this, TakeWhile);

    _Transducer4.call(this, xf);
    this.p = p;
  }

  _inherits(TakeWhile, _Transducer4);

  TakeWhile.prototype[tStep] = function (value, input) {
    return this.p(input) ? this.xfStep(value, input) : _Transducer$reduced$isReduced$unreduced$protocols$identity$compose.reduced(value);
  };

  return TakeWhile;
})(_Transducer$reduced$isReduced$unreduced$protocols$identity$compose.Transducer);

var drop = function drop(n) {
  return function (xf) {
    return new Drop(n, xf);
  };
};
exports.drop = drop;

var Drop = (function (_Transducer5) {
  function Drop(n, xf) {
    _classCallCheck(this, Drop);

    _Transducer5.call(this, xf);
    this.n = n;
  }

  _inherits(Drop, _Transducer5);

  Drop.prototype[tStep] = function (value, input) {
    return --this.n < 0 ? this.xfStep(value, input) : value;
  };

  return Drop;
})(_Transducer$reduced$isReduced$unreduced$protocols$identity$compose.Transducer);

var dropWhile = function dropWhile(p) {
  return function (xf) {
    return new DropWhile(p, xf);
  };
};
exports.dropWhile = dropWhile;

var DropWhile = (function (_Transducer6) {
  function DropWhile(p, xf) {
    _classCallCheck(this, DropWhile);

    _Transducer6.call(this, xf);
    this.p = p;
    this.found = false;
  }

  _inherits(DropWhile, _Transducer6);

  DropWhile.prototype[tStep] = function (value, input) {
    if (!this.found) {
      if (this.p(input)) {
        return value;
      }
      this.found = true;
    }
    return this.xfStep(value, input);
  };

  return DropWhile;
})(_Transducer$reduced$isReduced$unreduced$protocols$identity$compose.Transducer);

var cat = function cat(xf) {
  return new Cat(xf);
};
exports.cat = cat;

var Cat = (function (_Transducer7) {
  function Cat(xf) {
    _classCallCheck(this, Cat);

    _Transducer7.call(this, new PreserveReduced(xf));
  }

  _inherits(Cat, _Transducer7);

  Cat.prototype[tStep] = function (value, input) {
    return _reduce.reduce(this.xf, value, input);
  };

  return Cat;
})(_Transducer$reduced$isReduced$unreduced$protocols$identity$compose.Transducer);

var PreserveReduced = (function (_Transducer8) {
  function PreserveReduced(xf) {
    _classCallCheck(this, PreserveReduced);

    _Transducer8.call(this, xf);
  }

  _inherits(PreserveReduced, _Transducer8);

  PreserveReduced.prototype[tStep] = function (value, input) {
    value = this.xfStep(value, input);
    if (_Transducer$reduced$isReduced$unreduced$protocols$identity$compose.isReduced(value)) {
      value = _Transducer$reduced$isReduced$unreduced$protocols$identity$compose.reduced(value, true);
    }
    return value;
  };

  return PreserveReduced;
})(_Transducer$reduced$isReduced$unreduced$protocols$identity$compose.Transducer);

var mapcat = function mapcat(f) {
  return _Transducer$reduced$isReduced$unreduced$protocols$identity$compose.compose(map(f), cat);
};

exports.mapcat = mapcat;
var partitionAll = function partitionAll(n) {
  return function (xf) {
    return new PartitionAll(n, xf);
  };
};
exports.partitionAll = partitionAll;

var PartitionAll = (function (_Transducer9) {
  function PartitionAll(n, xf) {
    _classCallCheck(this, PartitionAll);

    _Transducer9.call(this, xf);
    this.n = n;
    this.inputs = [];
  }

  _inherits(PartitionAll, _Transducer9);

  PartitionAll.prototype[tStep] = function (value, input) {
    var ins = this.inputs;
    ins.push(input);
    if (this.n === ins.length) {
      this.inputs = [];
      value = this.xfStep(value, ins);
    }
    return value;
  };

  PartitionAll.prototype[tResult] = function (value) {
    var ins = this.inputs;
    if (ins && ins.length) {
      this.inputs = [];
      value = this.xfStep(value, ins);
    }
    return this.xfResult(value);
  };

  return PartitionAll;
})(_Transducer$reduced$isReduced$unreduced$protocols$identity$compose.Transducer);

var partitionBy = function partitionBy(f) {
  return function (xf) {
    return new PartitionBy(f, xf);
  };
};
exports.partitionBy = partitionBy;

var PartitionBy = (function (_Transducer10) {
  function PartitionBy(f, xf) {
    _classCallCheck(this, PartitionBy);

    _Transducer10.call(this, xf);
    this.f = f;
  }

  _inherits(PartitionBy, _Transducer10);

  PartitionBy.prototype[tStep] = function (value, input) {
    var ins = this.inputs,
        curr = this.f(input),
        prev = this.prev;
    this.prev = curr;
    if (ins === void 0) {
      this.inputs = [input];
    } else if (prev === curr) {
      ins.push(input);
    } else {
      this.inputs = [];
      value = this.xfStep(value, ins);
      if (!_Transducer$reduced$isReduced$unreduced$protocols$identity$compose.isReduced(value)) {
        this.inputs.push(input);
      }
    }
    return value;
  };

  PartitionBy.prototype[tResult] = function (value) {
    var ins = this.inputs;
    if (ins && ins.length) {
      this.inputs = [];
      value = this.xfStep(value, ins);
    }
    return this.xfResult(value);
  };

  return PartitionBy;
})(_Transducer$reduced$isReduced$unreduced$protocols$identity$compose.Transducer);

var dedupe = function dedupe() {
  return function (xf) {
    return new Dedupe(xf);
  };
};
exports.dedupe = dedupe;

var Dedupe = (function (_Transducer11) {
  function Dedupe(xf) {
    _classCallCheck(this, Dedupe);

    _Transducer11.call(this, xf);
    this.sawFirst = false;
  }

  _inherits(Dedupe, _Transducer11);

  Dedupe.prototype[tStep] = function (value, input) {
    if (!this.sawFirst || this.last !== input) {
      value = this.xfStep(value, input);
    }
    this.last = input;
    this.sawFirst = true;
    return value;
  };

  return Dedupe;
})(_Transducer$reduced$isReduced$unreduced$protocols$identity$compose.Transducer);

var unique = function unique(f) {
  return function (xf) {
    return new Unique(f, xf);
  };
};
exports.unique = unique;

var Unique = (function (_Transducer12) {
  function Unique(f, xf) {
    _classCallCheck(this, Unique);

    _Transducer12.call(this, xf);
    this.seen = [];
    this.f = f || _Transducer$reduced$isReduced$unreduced$protocols$identity$compose.identity;
  }

  _inherits(Unique, _Transducer12);

  Unique.prototype[tStep] = function (value, input) {
    var computed = this.f(input);
    if (this.seen.indexOf(computed) < 0) {
      this.seen.push(computed);
      value = this.xfStep(value, input);
    }
    return value;
  };

  return Unique;
})(_Transducer$reduced$isReduced$unreduced$protocols$identity$compose.Transducer);

var tap = function tap(f) {
  return function (xf) {
    return new Tap(f, xf);
  };
};
exports.tap = tap;

var Tap = (function (_Transducer13) {
  function Tap(f, xf) {
    _classCallCheck(this, Tap);

    _Transducer13.call(this, xf);
    this.f = f;
  }

  _inherits(Tap, _Transducer13);

  Tap.prototype[tStep] = function (value, input) {
    this.f(value, input);
    return this.xfStep(value, input);
  };

  return Tap;
})(_Transducer$reduced$isReduced$unreduced$protocols$identity$compose.Transducer);

var interpose = function interpose(separator) {
  return function (xf) {
    return new Interpose(separator, xf);
  };
};
exports.interpose = interpose;

var Interpose = (function (_Transducer14) {
  function Interpose(separator, xf) {
    _classCallCheck(this, Interpose);

    _Transducer14.call(this, xf);
    this.separator = separator;
    this.started = false;
  }

  _inherits(Interpose, _Transducer14);

  Interpose.prototype[tStep] = function (value, input) {
    if (this.started) {
      var withSep = this.xf[tStep](value, this.separator);
      if (_Transducer$reduced$isReduced$unreduced$protocols$identity$compose.isReduced(withSep)) {
        return withSep;
      } else {
        return this.xfStep(withSep, input);
      }
    } else {
      this.started = true;
      return this.xfStep(value, input);
    }
  };

  return Interpose;
})(_Transducer$reduced$isReduced$unreduced$protocols$identity$compose.Transducer);
//# sourceMappingURL=transducers.js.map
},{"4":4,"6":6}],6:[function(require,module,exports){
'use strict';

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

exports.__esModule = true;
exports.isIterable = isIterable;
exports.isIterator = isIterator;
exports.compose = compose;
exports.reduced = reduced;
exports.unreduced = unreduced;
var toString = Object.prototype.toString;
var has = ({}).hasOwnProperty;

// type checks
var isArray = Array.isArray || predicateToString('Array');
exports.isArray = isArray;
var isFunction = function isFunction(value) {
  return typeof value === 'function';
};
exports.isFunction = isFunction;
var isUndefined = function isUndefined(value) {
  return value === void 0;
};
exports.isUndefined = isUndefined;
var isNumber = predicateToString('Number');
exports.isNumber = isNumber;
var isRegExp = predicateToString('RegExp');
exports.isRegExp = isRegExp;
var isString = predicateToString('String');
exports.isString = isString;
function predicateToString(type) {
  var str = '[object ' + type + ']';
  return function (value) {
    return str === toString.call(value);
  };
}

function isIterable(value) {
  return !!(isString(value) || isArray(value) || value && value[protocols.iterator]);
}

function isIterator(value) {
  return !!(value && isFunction(value.next));
}

// convenience functions
var identity = function identity(v) {
  return v;
};

exports.identity = identity;

function compose() {
  var fns = arguments;
  return function (xf) {
    var i = fns.length;
    while (i--) {
      xf = fns[i](xf);
    }
    return xf;
  };
}

// protocol symbols for iterators and transducers
var symbolExists = typeof Symbol !== 'undefined';
var protocols = {
  iterator: symbolExists ? Symbol.iterator : '@@iterator',
  transducer: {
    init: '@@transducer/init',
    step: '@@transducer/step',
    result: '@@transducer/result',
    reduce: '@@transducer/reduce',
    reduced: '@@transducer/reduced',
    value: '@@transducer/value'
  }
};

exports.protocols = protocols;
// reduced wrapper object
var _protocols$transducer = protocols.transducer;
var tValue = _protocols$transducer.value;
var tReduced = _protocols$transducer.reduced;
var isReduced = function isReduced(value) {
  return !!(value && value[tReduced]);
};

exports.isReduced = isReduced;

function reduced(value, force) {
  if (force || !isReduced(value)) {
    value = new Reduced(value);
  }
  return value;
}

function Reduced(value) {
  this[tValue] = value;
  this[tReduced] = true;
}

function unreduced(value) {
  if (isReduced(value)) {
    value = value[tValue];
  }
  return value;
}

// Base class for transducers with default implementation
// delegating to wrapped transformer, xf
var _protocols$transducer2 = protocols.transducer;
var tInit = _protocols$transducer2.init;
var tStep = _protocols$transducer2.step;
var tResult = _protocols$transducer2.result;

var Transducer = (function () {
  function Transducer(xf) {
    _classCallCheck(this, Transducer);

    this.xf = xf;
  }

  Transducer.prototype[tInit] = function () {
    return this.xfInit();
  };

  Transducer.prototype.xfInit = function xfInit() {
    return this.xf[tInit]();
  };

  Transducer.prototype[tStep] = function (value, input) {
    return this.xfStep(value, input);
  };

  Transducer.prototype.xfStep = function xfStep(value, input) {
    return this.xf[tStep](value, input);
  };

  Transducer.prototype[tResult] = function (value) {
    return this.xfResult(value);
  };

  Transducer.prototype.xfResult = function xfResult(value) {
    return this.xf[tResult](value);
  };

  return Transducer;
})();

exports.Transducer = Transducer;
//# sourceMappingURL=util.js.map
},{}]},{},[1])(1)
});