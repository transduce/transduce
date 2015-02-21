'use strict'
module.exports = merge(merge({
    iterator: require('./iterator'),
    array: require('./array'),
    math: require('./math'),
    push: require('./push'),
    string: require('./string'),
    unique: require('./unique'),
    util: require('./util')
  },
  require('./core')),
  require('./common'))

function merge(result, input){
  var prop
  for(prop in input){
    if(input.hasOwnProperty(prop)){
      result[prop] = input[prop]
    }
  }
  return result
}
