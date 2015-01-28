'use strict'
var identity = require('../util/identity'),
    stringAppend = require('../util/stringAppend')

module.exports =
// Appends value onto string, using optional constructor arg as default, or '' if not provided
// init will return the default
// step will append input onto string and return result
// result is identity
function stringTransformer(value){
  return new StringTransformer(value)
}
function StringTransformer(str){
  this.strDefault = str === void 0 ? '' : str
}
StringTransformer.prototype.init = function(){
  return this.strDefault
}
StringTransformer.prototype.step = stringAppend
StringTransformer.prototype.result = identity
