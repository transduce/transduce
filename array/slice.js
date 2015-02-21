'use strict'
var compose = require('../core/compose'),
    reduced = require('../core/reduced'),
    initial = require('./initial'),
    last = require('./last')

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

