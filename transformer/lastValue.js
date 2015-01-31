'use strict'
var identity = require('../util/identity')

module.exports =
function lastValueTransformer(init){
  return new LastValueTransformer(init)
}
function LastValueTransformer(init){
  if(init){
    this.init = init
  }
}
LastValueTransformer.prototype.init = function(){}
LastValueTransformer.prototype.step =  function(result, input){return input}
LastValueTransformer.prototype.result = identity
