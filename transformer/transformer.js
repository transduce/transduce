'use strict'
var symbol = require('./symbol'),
    isTransformer = require('./isTransformer'),
    isArray = require('../util/isArray'),
    isFunction = require('../util/isFunction'),
    isString = require('../util/isString'),
    arrayXf = require('./array'),
    completing = require('./completing'),
    objectXf = require('./object'),
    stringXf = require('./string')

module.exports =
function transformer(value){
  var xf
  if(isTransformer(value)){
    xf = value[symbol]
    if(xf === void 0){
      xf = value
    }
  } else if(isFunction(value)){
    xf = completing(value)
  } else if(isArray(value)){
    xf = arrayXf(value)
  } else if(isString(value)){
    xf = stringXf(value)
  } else {
    xf = objectXf(value)
  }
  return xf
}
