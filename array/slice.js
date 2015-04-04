'use strict'
var transducer = require('../core/transducer'),
    compose = require('../core/compose'),
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
  return transducer(function(step, value, input){
    if(this.idx === void 0){

      this.idx = 0
    }
    if(this.idx++ >= begin){
      value = step(value, input)
    }
    if(this.idx >= end){
      value = reduced(value)
    }
    return value
  })
}
