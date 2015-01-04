"use strict";
var transduce = require('./transduce');

module.exports = into;
function into(to, xf, from){
  return transduce(xf, to, to, from);
}
