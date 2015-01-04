"use strict";

var tp = require('transduce-util'),
    reduce = require('./reduce');

module.exports = cat;
function cat(xf){
  return new Cat(xf);
}
function Cat(xf){
  this.xf = new PreserveReduced(xf);
}
Cat.prototype.init = function(){
  return this.xf.init();
};
Cat.prototype.result = function(value){
  return this.xf.result(value);
};
Cat.prototype.step = function(value, item){
  return reduce(this.xf, value, item);
};

function PreserveReduced(xf){
  this.xf = xf;
}
PreserveReduced.prototype.init = function(){
  return this.xf.init();
};
PreserveReduced.prototype.result = function(value){
  return this.xf.result(value);
};
PreserveReduced.prototype.step = function(value, item){
  value = this.xf.step(value, item);
  if(tp.isReduced(value)){
    value = tp.reduced(value, true);
  }
  return value;
};
