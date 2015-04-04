'use strict'
var identity = require('./util').identity,
    tp = require('./protocols').transducer

module.exports =
// Turns a step function into a transfomer with init, step, result
// If init not provided, calls `step()`.  If result not provided, calls `idenity`
function completing(rf, result){
  return new Completing(rf, result)
}
function Completing(rf, result){
  this[tp.init] = rf
  this[tp.step] = rf
  this[tp.result] = result || identity
}
