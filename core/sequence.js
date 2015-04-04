'use strict'
var isReduced = require('./isReduced'),
    iterable = require('./iterable'),
    protocols = require('./protocols'),
    tp = protocols.transducer

module.exports =
function sequence(t, coll) {
  return new LazyIterable(t, coll)
}

function LazyIterable(t, coll){
  this.t = t
  this.coll = coll
}
LazyIterable.prototype[protocols.iterator] = function(){
  var iter = iterable(this.coll)[protocols.iterator]()
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
function StepTransformer(){}
StepTransformer.prototype[tp.init] = function(){}
StepTransformer.prototype[tp.step] = function(lt, input){
  lt.values.push(input)
  return lt
}
StepTransformer.prototype[tp.result] = function(lt){
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
      xf[tp.result](lt)
      break
    }

    result = xf[tp.step](lt, next.value)
    if(isReduced(result)){
      xf[tp.result](lt)
      break
    }
  }
}

