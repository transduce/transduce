(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.transduce = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports = require(5)

},{"5":5}],2:[function(require,module,exports){
'use strict';

exports.__esModule = true;

var _lastValue, _arrayTransformer, _stringTransformer, _objectTransformer;

exports.transduceImpl = transduceImpl;
exports.reduceImpl = reduceImpl;
exports.intoImpl = intoImpl;
exports.iterator = iterator;
exports.iterable = iterable;
exports.transformer = transformer;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _util = require(9);

var _protocols$transducer = _util.protocols.transducer;
var tInit = _protocols$transducer.init;
var tStep = _protocols$transducer.step;
var tResult = _protocols$transducer.result;

var symIter = _util.protocols.iterator;

// given a reduce implementation, returns a transduce implementation
// that delegates to the implementation after handling multiple arity
// and dynamic argument types

function transduceImpl(reduce) {
  return function transduce(t, xf, init, coll) {
    if (_util.isFunction(xf)) {
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

// given a reduce implementation, returns a reduce implementation
// that delegates to reduce after handling multiple arity
// and dynamic argument types

function reduceImpl(_reduce) {
  return function reduce(xf, init, coll) {
    if (_util.isFunction(xf)) {
      xf = completing(xf);
    }
    if (arguments.length === 2) {
      coll = init;
      init = xf[tInit]();
    }
    return _reduce(xf, init, coll);
  };
}

// given a reduce implementation, returns an into implementation
// that delegates to reduce after handling currying, multiple arity
// and dynamic argument types

function intoImpl(reduce) {
  return function into(init, t, coll) {
    var xf = transformer(init),
        len = arguments.length;

    if (len === 1) {
      return intoCurryInitXf(intoInit(init, xf), xf);
    }

    if (len === 2) {
      if (_util.isFunction(t)) {
        return intoCurryInitXfT(intoInit(init, xf), xf, t);
      }
      coll = t;
      return reduce(xf, init, coll);
    }
    return reduce(t(xf), init, coll);
  };

  function intoCurryInitXf(init, xf) {
    return function intoInitXf(t, coll) {
      if (arguments.length === 1) {
        if (_util.isFunction(t)) {
          return intoCurryInitXfT(init, xf, t);
        }
        coll = t;
        return reduce(xf, init(), coll);
      }
      return reduce(t(xf), init(), coll);
    };
  }

  function intoCurryInitXfT(init, xf, t) {
    return function intoInitXfT(coll) {
      return reduce(t(xf), init(), coll);
    };
  }

  function intoInit(init, xf) {
    return function () {
      return reduce(xf, xf[tInit](), init);
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
  this[tResult] = result || _util.identity;
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
  } else if (_util.isArray(value) || _util.isString(value)) {
    it = new ArrayIterable(value);
  } else if (_util.isFunction(value)) {
    it = new FunctionIterable(function () {
      return { done: false, value: value() };
    });
  } else if (_util.isFunction(value.next)) {
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
    var _ref,
        _this = this;

    var idx = 0;
    return _ref = {
      next: function next() {
        if (idx >= _this.arr.length) {
          return { done: true };
        }
        return { done: false, value: _this.arr[idx++] };
      }
    }, _ref[symIter] = symIterReturnSelf, _ref;
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
    var _ref2;

    return _ref2 = { next: this.fn }, _ref2[symIter] = symIterReturnSelf, _ref2;
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
    var _ref3,
        _this2 = this;

    var idx = 0;
    return _ref3 = {
      next: function next() {
        if (idx >= _this2.keys.length) {
          return { done: true };
        }
        var key = _this2.keys[idx++];
        return { done: false, value: [key, _this2.obj[key]] };
      }
    }, _ref3[symIter] = symIterReturnSelf, _ref3;
  };

  return ObjectIterable;
})();

exports.ObjectIterable = ObjectIterable;

var lastValue = (_lastValue = {}, _lastValue[tInit] = function () {}, _lastValue[tStep] = function (result, input) {
  return input;
}, _lastValue[tResult] = _util.identity, _lastValue);

function transformer(value) {
  var xf;
  if (value === void 0 || value === null) {
    xf = lastValue;
  } else if (_util.isFunction(value[tStep])) {
    xf = value;
  } else if (_util.isFunction(value)) {
    xf = completing(value);
  } else if (_util.isArray(value)) {
    xf = arrayTransformer;
  } else if (_util.isString(value)) {
    xf = stringTransformer;
  } else {
    xf = objectTransformer;
  }
  return xf;
}

// Pushes value on array, using optional constructor arg as default, or [] if not provided
// init will clone the default
// step will push input onto array and return result
// result is identity
var arrayTransformer = (_arrayTransformer = {}, _arrayTransformer[tInit] = function () {
  return [];
}, _arrayTransformer[tStep] = function (result, input) {
  result.push(input);
  return result;
}, _arrayTransformer[tResult] = _util.identity, _arrayTransformer);

// Appends value onto string, using optional constructor arg as default, or '' if not provided
// init will return the default
// step will append input onto string and return result
// result is identity
var stringTransformer = (_stringTransformer = {}, _stringTransformer[tInit] = function () {
  return '';
}, _stringTransformer[tStep] = function (result, input) {
  return result + input;
}, _stringTransformer[tResult] = _util.identity, _stringTransformer);

// Merges value into object, using optional constructor arg as default, or {} if undefined
// init will clone the default
// step will merge input into object and return result
// result is identity
var objectTransformer = (_objectTransformer = {}, _objectTransformer[tInit] = function () {
  return {};
}, _objectTransformer[tStep] = function objectMerge(result, input) {
  if (_util.isArray(input) && input.length === 2) {
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
}, _objectTransformer[tResult] = _util.identity, _objectTransformer);

function symIterReturnSelf() {
  return this;
}


},{"9":9}],3:[function(require,module,exports){
'use strict';

exports.__esModule = true;
exports.push = push;
exports.unshift = unshift;
exports.slice = slice;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _util = require(9);

var _protocols$transducer = _util.protocols.transducer;
var tStep = _protocols$transducer.step;
var tResult = _protocols$transducer.result;
var forEach = function forEach(f) {
  return function (xf) {
    return new ForEach(f, xf);
  };
};
exports.forEach = forEach;

var ForEach = (function (_Transducer) {
  _inherits(ForEach, _Transducer);

  function ForEach(f, xf) {
    _classCallCheck(this, ForEach);

    _Transducer.call(this, xf);
    this.f = f;
    this.idx = 0;
  }

  ForEach.prototype[tStep] = function (value, input) {
    this.f(input, this.idx++, value);
    return this.xfStep(value, input);
  };

  return ForEach;
})(_util.Transducer);

var find = function find(p) {
  return function (xf) {
    return new Find(p, xf);
  };
};
exports.find = find;

var Find = (function (_Transducer2) {
  _inherits(Find, _Transducer2);

  function Find(p, xf) {
    _classCallCheck(this, Find);

    _Transducer2.call(this, xf);
    this.p = p;
  }

  Find.prototype[tStep] = function (value, input) {
    if (this.p(input)) {
      value = _util.reduced(this.xfStep(value, input));
    }
    return value;
  };

  return Find;
})(_util.Transducer);

var every = function every(p) {
  return function (xf) {
    return new Every(p, xf);
  };
};
exports.every = every;

var Every = (function (_Transducer3) {
  _inherits(Every, _Transducer3);

  function Every(p, xf) {
    _classCallCheck(this, Every);

    _Transducer3.call(this, xf);
    this.p = p;
    this.found = false;
  }

  Every.prototype[tStep] = function (value, input) {
    if (!this.p(input)) {
      this.found = true;
      return _util.reduced(this.xfStep(value, false));
    }
    return value;
  };

  Every.prototype[tResult] = function (value) {
    if (!this.found) {
      value = this.xfStep(value, true);
    }
    return this.xfResult(value);
  };

  return Every;
})(_util.Transducer);

var some = function some(p) {
  return function (xf) {
    return new Some(p, xf);
  };
};
exports.some = some;

var Some = (function (_Transducer4) {
  _inherits(Some, _Transducer4);

  function Some(p, xf) {
    _classCallCheck(this, Some);

    _Transducer4.call(this, xf);
    this.p = p;
    this.found = false;
  }

  Some.prototype[tStep] = function (value, input) {
    if (this.p(input)) {
      this.found = true;
      return _util.reduced(this.xfStep(value, true));
    }
    return value;
  };

  Some.prototype[tResult] = function (value) {
    if (!this.found) {
      value = this.xfStep(value, false);
    }
    return this.xfResult(value);
  };

  return Some;
})(_util.Transducer);

var contains = function contains(target) {
  return some(function (x) {
    return x === target;
  });
};

exports.contains = contains;

function push() {
  for (var _len = arguments.length, toPush = Array(_len), _key = 0; _key < _len; _key++) {
    toPush[_key] = arguments[_key];
  }

  return function (xf) {
    return new Push(toPush, xf);
  };
}

var Push = (function (_Transducer5) {
  _inherits(Push, _Transducer5);

  function Push(toPush, xf) {
    _classCallCheck(this, Push);

    _Transducer5.call(this, xf);
    this.toPush = toPush;
  }

  Push.prototype[tResult] = function (value) {
    var idx;
    var len = this.toPush.length;
    for (idx = 0; idx < len; idx++) {
      value = this.xfStep(value, this.toPush[idx]);
      if (_util.isReduced(value)) {
        value = _util.unreduced(value);
        break;
      }
    }
    return this.xfResult(value);
  };

  return Push;
})(_util.Transducer);

function unshift() {
  for (var _len2 = arguments.length, toUnshift = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
    toUnshift[_key2] = arguments[_key2];
  }

  return function (xf) {
    return new Unshift(toUnshift, xf);
  };
}

var Unshift = (function (_Transducer6) {
  _inherits(Unshift, _Transducer6);

  function Unshift(toUnshift, xf) {
    _classCallCheck(this, Unshift);

    _Transducer6.call(this, xf);
    this.toUnshift = toUnshift;
    this.done = false;
  }

  Unshift.prototype[tStep] = function (value, input) {
    if (!this.done) {
      var idx;
      var len = this.toUnshift.length;
      this.done = true;
      for (idx = 0; idx < len; idx++) {
        value = this.xfStep(value, this.toUnshift[idx]);
        if (_util.isReduced(value)) {
          return value;
        }
      }
    }
    return this.xfStep(value, input);
  };

  return Unshift;
})(_util.Transducer);

var initial = function initial(n) {
  return function (xf) {
    return new Initial(n, xf);
  };
};
exports.initial = initial;

var Initial = (function (_Transducer7) {
  _inherits(Initial, _Transducer7);

  function Initial(n, xf) {
    _classCallCheck(this, Initial);

    _Transducer7.call(this, xf);
    n = n === void 0 ? 1 : n > 0 ? n : 0;
    this.n = n;
    this.idx = 0;
    this.buffer = [];
  }

  Initial.prototype[tStep] = function (value, input) {
    this.buffer[this.idx++] = input;
    return value;
  };

  Initial.prototype[tResult] = function (value) {
    var idx = 0;
    var count = this.idx - this.n;
    for (idx = 0; idx < count; idx++) {
      value = this.xfStep(value, this.buffer[idx]);
      if (_util.isReduced(value)) {
        value = _util.unreduced(value);
        break;
      }
    }
    return this.xfResult(value);
  };

  return Initial;
})(_util.Transducer);

var last = function last(n) {
  return function (xf) {
    return new Last(n, xf);
  };
};
exports.last = last;

var Last = (function (_Transducer8) {
  _inherits(Last, _Transducer8);

  function Last(n, xf) {
    _classCallCheck(this, Last);

    _Transducer8.call(this, xf);
    if (n === void 0) {
      n = 1;
    } else {
      n = n > 0 ? n : 0;
    }
    this.n = n;
    this.idx = 0;
    this.buffer = [];
  }

  Last.prototype[tStep] = function (value, input) {
    this.buffer[this.idx++ % this.n] = input;
    return value;
  };

  Last.prototype[tResult] = function (value) {
    var count = this.n,
        idx = this.idx;
    if (idx < count) {
      count = idx;
      idx = 0;
    }
    while (count--) {
      value = this.xfStep(value, this.buffer[idx++ % this.n]);
      if (_util.isReduced(value)) {
        value = _util.unreduced(value);
        break;
      }
    }
    return this.xfResult(value);
  };

  return Last;
})(_util.Transducer);

function slice(begin, end) {
  if (begin === void 0) {
    begin = 0;
  }
  if (begin < 0) {
    if (end === void 0) {
      return last(-begin);
    }
    if (end >= 0) {
      return _util.compose(last(-begin), slice(0, end + begin + 1));
    }
  }
  if (end < 0) {
    if (begin === 0) {
      return initial(-end);
    }
    return _util.compose(slice(begin), initial(-end));
  }
  return function (xf) {
    return new Slice(begin, end, xf);
  };
}

var Slice = (function (_Transducer9) {
  _inherits(Slice, _Transducer9);

  function Slice(begin, end, xf) {
    _classCallCheck(this, Slice);

    _Transducer9.call(this, xf);
    this.begin = begin;
    this.end = end;
    this.idx = 0;
  }

  Slice.prototype[tStep] = function (value, input) {
    if (this.idx++ >= this.begin) {
      value = this.xfStep(value, input);
    }
    if (this.idx >= this.end) {
      value = _util.reduced(value);
    }
    return value;
  };

  return Slice;
})(_util.Transducer);


},{"9":9}],4:[function(require,module,exports){
'use strict';

exports.__esModule = true;

var _stepTransformer;

exports.sequence = sequence;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _util = require(9);

// Transformer, iterable, completing

var _internal = require(2);

var _protocols$transducer = _util.protocols.transducer;
var tInit = _protocols$transducer.init;
var tStep = _protocols$transducer.step;
var tResult = _protocols$transducer.result;
var tReduce = _protocols$transducer.reduce;

var symIter = _util.protocols.iterator;exports.transformer = _internal.transformer;
exports.iterable = _internal.iterable;
exports.iterator = _internal.iterator;
exports.completing = _internal.completing;
exports.compose = _util.compose;
exports.identity = _util.identity;
exports.protocols = _util.protocols;
exports.isReduced = _util.isReduced;
exports.reduced = _util.reduced;
exports.unreduced = _util.unreduced;
exports.Transducer = _util.Transducer;
exports.isIterable = _util.isIterable;
exports.isIterator = _util.isIterator;

// Transduce, reduce, into
var reduce = _internal.reduceImpl(_reduce);
exports.reduce = reduce;
var transduce = _internal.transduceImpl(_reduce);
exports.transduce = transduce;
var into = _internal.intoImpl(_reduce);

exports.into = into;
function _reduce(xf, init, coll) {
  if (_util.isArray(coll)) {
    return arrayReduce(xf, init, coll);
  }
  if (_util.isFunction(coll[tReduce])) {
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
    if (_util.isReduced(value)) {
      value = _util.unreduced(value);
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
  iter = _internal.iterator(iter);
  while (true) {
    next = iter.next();
    if (next.done) {
      break;
    }

    value = xf[tStep](value, next.value);
    if (_util.isReduced(value)) {
      value = _util.unreduced(value);
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
  _inherits(FnTransducer, _Transducer);

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

  // eduction

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
})(_util.Transducer);

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

  // sequence

  Eduction.prototype[symIter] = function () {
    return _internal.iterator(sequence(this.t, this.coll));
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
    return new LazyIterator(new Stepper(this.t, _internal.iterator(this.coll)));
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
      if (_util.isReduced(result)) {
        this.xf[tResult](lt);
        break;
      }
    }
  };

  return Stepper;
})();


},{"2":2,"9":9}],5:[function(require,module,exports){
'use strict';

exports.__esModule = true;

function _interopExportWildcard(obj, defaults) { var newObj = defaults({}, obj); delete newObj['default']; return newObj; }

function _defaults(obj, defaults) { var keys = Object.getOwnPropertyNames(defaults); for (var i = 0; i < keys.length; i++) { var key = keys[i]; var value = Object.getOwnPropertyDescriptor(defaults, key); if (value && value.configurable && obj[key] === undefined) { Object.defineProperty(obj, key, value); } } return obj; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

var _array = require(3);

var array = _interopRequireWildcard(_array);

var _string = require(7);

var string = _interopRequireWildcard(_string);

var _math = require(6);

var math = _interopRequireWildcard(_math);

var _core = require(4);

_defaults(exports, _interopExportWildcard(_core, _defaults));

var _transducers = require(8);

_defaults(exports, _interopExportWildcard(_transducers, _defaults));

exports.array = array;
exports.string = string;
exports.math = math;


},{"3":3,"4":4,"6":6,"7":7,"8":8}],6:[function(require,module,exports){
'use strict';

exports.__esModule = true;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _util = require(9);

var _protocols$transducer = _util.protocols.transducer;
var tStep = _protocols$transducer.step;
var tResult = _protocols$transducer.result;
var max = function max(f) {
  return function (xf) {
    return new Max(f, xf);
  };
};
exports.max = max;

var Max = (function (_Transducer) {
  _inherits(Max, _Transducer);

  function Max(f, xf) {
    _classCallCheck(this, Max);

    _Transducer.call(this, xf);
    this.f = f || _util.identity;
    this.computedResult = -Infinity;
    this.lastComputed = -Infinity;
  }

  Max.prototype[tStep] = function (value, input) {
    var computed = this.f(input);
    if (computed > this.lastComputed || computed === -Infinity && this.computedResult === -Infinity) {
      this.computedResult = input;
      this.lastComputed = computed;
    }
    return value;
  };

  Max.prototype[tResult] = function (value) {
    return this.xfResult(this.xfStep(value, this.computedResult));
  };

  return Max;
})(_util.Transducer);

var min = function min(f) {
  return function (xf) {
    return new Min(f, xf);
  };
};
exports.min = min;

var Min = (function (_Transducer2) {
  _inherits(Min, _Transducer2);

  function Min(f, xf) {
    _classCallCheck(this, Min);

    _Transducer2.call(this, xf);
    this.f = f || _util.identity;
    this.computedResult = Infinity;
    this.lastComputed = Infinity;
  }

  Min.prototype[tStep] = function (value, input) {
    var computed = this.f(input);
    if (computed < this.lastComputed || computed === Infinity && this.computedResult === Infinity) {
      this.computedResult = input;
      this.lastComputed = computed;
    }
    return value;
  };

  Min.prototype[tResult] = function (value) {
    return this.xfResult(this.xfStep(value, this.computedResult));
  };

  return Min;
})(_util.Transducer);


},{"9":9}],7:[function(require,module,exports){
'use strict';

exports.__esModule = true;
exports.words = words;
exports.split = split;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _util = require(9);

var _protocols$transducer = _util.protocols.transducer;
var tStep = _protocols$transducer.step;
var tResult = _protocols$transducer.result;
var join = function join(separator) {
  return function (xf) {
    return new Join(separator, xf);
  };
};
exports.join = join;

var Join = (function (_Transducer) {
  _inherits(Join, _Transducer);

  function Join(separator, xf) {
    _classCallCheck(this, Join);

    _Transducer.call(this, xf);
    this.buffer = [];
    this.separator = separator;
  }

  Join.prototype[tStep] = function (value, input) {
    this.buffer.push(input);
    return value;
  };

  Join.prototype[tResult] = function (value) {
    value = this.xfStep(value, this.buffer.join(this.separator));
    return this.xfResult(value);
  };

  return Join;
})(_util.Transducer);

var nonEmpty = function nonEmpty() {
  return function (xf) {
    return new NonEmpty(xf);
  };
};
exports.nonEmpty = nonEmpty;

var NonEmpty = (function (_Transducer2) {
  _inherits(NonEmpty, _Transducer2);

  function NonEmpty(xf) {
    _classCallCheck(this, NonEmpty);

    _Transducer2.call(this, xf);
  }

  NonEmpty.prototype[tStep] = function (value, input) {
    if (_util.isString(input) && input.trim().length) {
      value = this.xfStep(value, input);
    }
    return value;
  };

  return NonEmpty;
})(_util.Transducer);

var lines = function lines(limit) {
  return split('\n', limit);
};
exports.lines = lines;
var chars = function chars(limit) {
  return split('', limit);
};

exports.chars = chars;

function words(delimiter, limit) {
  if (delimiter === void 0 || _util.isNumber(delimiter)) {
    limit = delimiter;
    delimiter = /\s+/;
  }
  return _util.compose(split(delimiter, limit), nonEmpty());
}

function split(separator, limit) {
  return function (xf) {
    return new Split(separator, limit, xf);
  };
}

var Split = (function (_Transducer3) {
  _inherits(Split, _Transducer3);

  function Split(separator, limit, xf) {
    _classCallCheck(this, Split);

    _Transducer3.call(this, xf);
    if (_util.isRegExp(separator)) {
      separator = cloneRegExp(separator);
    }
    this.separator = separator;
    this.next = null;
    this.idx = 0;

    if (limit == void 0) {
      limit = Infinity;
    }
    this.limit = limit;

    if (!_util.isRegExp(separator) && separator !== '') {
      this.spliterate = spliterateString;
    } else if (_util.isRegExp(separator)) {
      this.spliterate = spliterateRegExp;
    } else {
      this.spliterate = spliterateChars;
    }
  }

  Split.prototype[tStep] = function (value, input) {
    if (input === null || input === void 0) {
      return value;
    }

    var str = (this.next && this.next.value || '') + input,
        chunk = this.spliterate(str, this.separator);

    for (;;) {
      this.next = chunk();
      if (this.next.done) {
        break;
      }

      value = this.xfStep(value, this.next.value);

      if (++this.idx >= this.limit) {
        this.next = null;
        value = _util.reduced(value);
        break;
      }
    }
    return value;
  };

  Split.prototype[tResult] = function (value) {
    if (this.next && this.next.value !== null && this.next.value !== void 0) {
      value = this.xfStep(value, this.next.value);
    }
    return this.xfResult(value);
  };

  return Split;
})(_util.Transducer);

function spliterateChars(str) {
  var i = 0,
      len = str.length,
      result = { done: false };
  return function () {
    result.value = str[i++];
    if (i >= len) {
      result.done = true;
    }
    return result;
  };
}

function spliterateString(str, separator) {
  var first,
      second,
      sepLen = separator.length,
      result = { done: false };
  return function () {
    first = first === void 0 ? 0 : second + sepLen;
    second = str.indexOf(separator, first);

    if (second < 0) {
      result.done = true;
      second = void 0;
    }
    result.value = str.substring(first, second);
    return result;
  };
}

function spliterateRegExp(str, pattern) {
  var index,
      match,
      result = { done: false };
  pattern = cloneRegExp(pattern);
  return function () {
    match = pattern.exec(str);
    if (match) {
      index = match.index;
      result.value = str.substring(0, index);
      str = str.substring(index + match[0].length);
    } else {
      result.done = true;
      result.value = str;
    }
    return result;
  };
}

function cloneRegExp(regexp) {
  // From https://github.com/aheckmann/regexp-clone
  var flags = [];
  if (regexp.global) flags.push('g');
  if (regexp.multiline) flags.push('m');
  if (regexp.ignoreCase) flags.push('i');
  return new RegExp(regexp.source, flags.join(''));
}


},{"9":9}],8:[function(require,module,exports){
'use strict';

exports.__esModule = true;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _util = require(9);

var _core = require(4);

var _protocols$transducer = _util.protocols.transducer;
var tStep = _protocols$transducer.step;
var tResult = _protocols$transducer.result;
var map = function map(f) {
  return function (xf) {
    return new Map(f, xf);
  };
};
exports.map = map;

var Map = (function (_Transducer) {
  _inherits(Map, _Transducer);

  function Map(f, xf) {
    _classCallCheck(this, Map);

    _Transducer.call(this, xf);
    this.f = f;
  }

  Map.prototype[tStep] = function (value, input) {
    return this.xfStep(value, this.f(input));
  };

  return Map;
})(_util.Transducer);

var filter = function filter(p) {
  return function (xf) {
    return new Filter(p, xf);
  };
};
exports.filter = filter;

var Filter = (function (_Transducer2) {
  _inherits(Filter, _Transducer2);

  function Filter(p, xf) {
    _classCallCheck(this, Filter);

    _Transducer2.call(this, xf);
    this.p = p;
  }

  Filter.prototype[tStep] = function (value, input) {
    return this.p(input) ? this.xfStep(value, input) : value;
  };

  return Filter;
})(_util.Transducer);

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
  _inherits(Take, _Transducer3);

  function Take(n, xf) {
    _classCallCheck(this, Take);

    _Transducer3.call(this, xf);
    this.n = n;
  }

  Take.prototype[tStep] = function (value, input) {
    if (this.n-- > 0) {
      value = this.xfStep(value, input);
    }
    if (this.n <= 0) {
      value = _util.reduced(value);
    }
    return value;
  };

  return Take;
})(_util.Transducer);

var takeWhile = function takeWhile(p) {
  return function (xf) {
    return new TakeWhile(p, xf);
  };
};
exports.takeWhile = takeWhile;

var TakeWhile = (function (_Transducer4) {
  _inherits(TakeWhile, _Transducer4);

  function TakeWhile(p, xf) {
    _classCallCheck(this, TakeWhile);

    _Transducer4.call(this, xf);
    this.p = p;
  }

  TakeWhile.prototype[tStep] = function (value, input) {
    return this.p(input) ? this.xfStep(value, input) : _util.reduced(value);
  };

  return TakeWhile;
})(_util.Transducer);

var drop = function drop(n) {
  return function (xf) {
    return new Drop(n, xf);
  };
};
exports.drop = drop;

var Drop = (function (_Transducer5) {
  _inherits(Drop, _Transducer5);

  function Drop(n, xf) {
    _classCallCheck(this, Drop);

    _Transducer5.call(this, xf);
    this.n = n;
  }

  Drop.prototype[tStep] = function (value, input) {
    return --this.n < 0 ? this.xfStep(value, input) : value;
  };

  return Drop;
})(_util.Transducer);

var dropWhile = function dropWhile(p) {
  return function (xf) {
    return new DropWhile(p, xf);
  };
};
exports.dropWhile = dropWhile;

var DropWhile = (function (_Transducer6) {
  _inherits(DropWhile, _Transducer6);

  function DropWhile(p, xf) {
    _classCallCheck(this, DropWhile);

    _Transducer6.call(this, xf);
    this.p = p;
    this.found = false;
  }

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
})(_util.Transducer);

var cat = function cat(xf) {
  return new Cat(xf);
};
exports.cat = cat;

var Cat = (function (_Transducer7) {
  _inherits(Cat, _Transducer7);

  function Cat(xf) {
    _classCallCheck(this, Cat);

    _Transducer7.call(this, new PreserveReduced(xf));
  }

  Cat.prototype[tStep] = function (value, input) {
    return _core.reduce(this.xf, value, input);
  };

  return Cat;
})(_util.Transducer);

var PreserveReduced = (function (_Transducer8) {
  _inherits(PreserveReduced, _Transducer8);

  function PreserveReduced(xf) {
    _classCallCheck(this, PreserveReduced);

    _Transducer8.call(this, xf);
  }

  PreserveReduced.prototype[tStep] = function (value, input) {
    value = this.xfStep(value, input);
    if (_util.isReduced(value)) {
      value = _util.reduced(value, true);
    }
    return value;
  };

  return PreserveReduced;
})(_util.Transducer);

var mapcat = function mapcat(f) {
  return _util.compose(map(f), cat);
};

exports.mapcat = mapcat;
var partitionAll = function partitionAll(n) {
  return function (xf) {
    return new PartitionAll(n, xf);
  };
};
exports.partitionAll = partitionAll;

var PartitionAll = (function (_Transducer9) {
  _inherits(PartitionAll, _Transducer9);

  function PartitionAll(n, xf) {
    _classCallCheck(this, PartitionAll);

    _Transducer9.call(this, xf);
    this.n = n;
    this.inputs = [];
  }

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
})(_util.Transducer);

var partitionBy = function partitionBy(f) {
  return function (xf) {
    return new PartitionBy(f, xf);
  };
};
exports.partitionBy = partitionBy;

var PartitionBy = (function (_Transducer10) {
  _inherits(PartitionBy, _Transducer10);

  function PartitionBy(f, xf) {
    _classCallCheck(this, PartitionBy);

    _Transducer10.call(this, xf);
    this.f = f;
  }

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
      if (!_util.isReduced(value)) {
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
})(_util.Transducer);

var dedupe = function dedupe() {
  return function (xf) {
    return new Dedupe(xf);
  };
};
exports.dedupe = dedupe;

var Dedupe = (function (_Transducer11) {
  _inherits(Dedupe, _Transducer11);

  function Dedupe(xf) {
    _classCallCheck(this, Dedupe);

    _Transducer11.call(this, xf);
    this.sawFirst = false;
  }

  Dedupe.prototype[tStep] = function (value, input) {
    if (!this.sawFirst || this.last !== input) {
      value = this.xfStep(value, input);
    }
    this.last = input;
    this.sawFirst = true;
    return value;
  };

  return Dedupe;
})(_util.Transducer);

var unique = function unique(f) {
  return function (xf) {
    return new Unique(f, xf);
  };
};
exports.unique = unique;

var Unique = (function (_Transducer12) {
  _inherits(Unique, _Transducer12);

  function Unique(f, xf) {
    _classCallCheck(this, Unique);

    _Transducer12.call(this, xf);
    this.seen = [];
    this.f = f || _util.identity;
  }

  Unique.prototype[tStep] = function (value, input) {
    var computed = this.f(input);
    if (this.seen.indexOf(computed) < 0) {
      this.seen.push(computed);
      value = this.xfStep(value, input);
    }
    return value;
  };

  return Unique;
})(_util.Transducer);

var tap = function tap(f) {
  return function (xf) {
    return new Tap(f, xf);
  };
};
exports.tap = tap;

var Tap = (function (_Transducer13) {
  _inherits(Tap, _Transducer13);

  function Tap(f, xf) {
    _classCallCheck(this, Tap);

    _Transducer13.call(this, xf);
    this.f = f;
  }

  Tap.prototype[tStep] = function (value, input) {
    this.f(value, input);
    return this.xfStep(value, input);
  };

  return Tap;
})(_util.Transducer);

var interpose = function interpose(separator) {
  return function (xf) {
    return new Interpose(separator, xf);
  };
};
exports.interpose = interpose;

var Interpose = (function (_Transducer14) {
  _inherits(Interpose, _Transducer14);

  function Interpose(separator, xf) {
    _classCallCheck(this, Interpose);

    _Transducer14.call(this, xf);
    this.separator = separator;
    this.started = false;
  }

  Interpose.prototype[tStep] = function (value, input) {
    if (this.started) {
      var withSep = this.xf[tStep](value, this.separator);
      if (_util.isReduced(withSep)) {
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
})(_util.Transducer);


},{"4":4,"9":9}],9:[function(require,module,exports){
'use strict';

exports.__esModule = true;
exports.isIterable = isIterable;
exports.isIterator = isIterator;
exports.compose = compose;
exports.reduced = reduced;
exports.unreduced = unreduced;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

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


},{}]},{},[1])(1)
});