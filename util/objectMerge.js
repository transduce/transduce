'use strict'

var isArray = require('./isArray')

module.exports =
function objectMerge(result, input){
  if(isArray(input) && input.length === 2){
    result[input[0]] = input[1]
  } else {
    var prop
    for(prop in input){
      if(input.hasOwnProperty(prop)){
        result[prop] = input[prop]
      }
    }
  }
  return result
}
