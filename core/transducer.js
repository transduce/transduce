'use strict'
var tp = require('../core/protocols').transducer

module.exports =
function transducer(step, result, init) {
  return function(xf){
    return new Transducer(xf, step, result, init)
  }
}
function Transducer(xf, step, result, init) {
  this.xf = xf

  this.init = init
  this.step = step
  this.result = result

  this.context = {
    init: bindXf(xf, tp.init),
    step: bindXf(xf, tp.step),
    result: bindXf(xf, tp.result)
  }
}
Transducer.prototype[tp.init] = function(){
  var that = this.context
  return this.init ? this.init.call(that, that.init) : that.init()
}
Transducer.prototype[tp.step] = function(value, input){
  var that = this.context
  return this.step ? this.step.call(that, that.step, value, input) : that.step(value, input)
}
Transducer.prototype[tp.result] = function(value){
  var that = this.context
  return this.result ? this.result.call(that, that.result, value) : that.result(value)
}
function bindXf(xf, p){
  return function(){
    return xf[p].apply(xf, arguments)
  }
}
