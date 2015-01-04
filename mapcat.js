"use strict";
var compose = require('transduce-compose'),
    map = require('./map'),
    cat = require('./cat');
module.exports = mapcat;
function mapcat(callback) {
  return compose(map(callback), cat);
}
