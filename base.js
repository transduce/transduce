'use strict'
module.exports = merge(merge({},
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
