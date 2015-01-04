"use strict";
var implToArray = require('transduce-impl-toarray');
module.exports = implToArray({
  transduce: require('./transduce'),
  reduce: require('./reduce')
});
