'use strict'
var iterator = require('./iterator'),
    symbol = require('./symbol'),
    isReduced = require('../base/isReduced')

module.exports =
function sequence(t, coll) {
  return new LazyIterable(t, coll)
}

function LazyIterable(t, coll){
  this.t = t
  this.coll = coll
}
LazyIterable.prototype[symbol] = function(){
  var iter = iterator(this.coll)
  return new LazyIterator(new Stepper(this.t, iter))
}

function LazyIterator(stepper){
  this.stepper = stepper
  this.values = []
}
LazyIterator.prototype.next = function(){
  var lt = this,
      values = lt.values,
      stepper = lt.stepper
  if(stepper && values.length === 0){
    stepper.step(lt)
  }
  return values.length ? {done: false, value: values.pop()} : {done: true}
}

var stepTransformer = new StepTransformer()
function StepTransformer(){
}
StepTransformer.prototype.init = function(){
  throw new Error('Cannot init')
}
StepTransformer.prototype.step = function(lt, input){
  lt.values.push(input)
  return lt
}
StepTransformer.prototype.result = function(lt){
  lt.stepper = null
  return lt
}

function Stepper(t, iter){
  this.xf = t(stepTransformer)
  this.iter = iter
}
Stepper.prototype.step = function(lt){
  var next, result,
      iter = this.iter,
      xf = this.xf,
      values = lt.values,
      prevLen = values.length
  while(prevLen === values.length){
    next = iter.next()
    if(next.done){
      xf.result(lt)
      break
    }

    result = xf.step(lt, next.value)
    if(isReduced(result)){
      xf.result(lt)
      break
    }
  }
}

