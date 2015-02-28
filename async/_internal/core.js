'use strict'
var Prom = require('any-promise'),
    isReduced = require('../../core/isReduced'),
    unreduced = require('../../core/unreduced'),
    transformer = require('../../core/transformer'),
    iterable = require('../../core/iterable'),
    protocols = require('../../core/protocols')

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
