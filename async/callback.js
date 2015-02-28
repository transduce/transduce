'use strict'
var isReduced = require('../core/isReduced'),
    unreduced = require('../core/unreduced'),
    transformer = require('../core/transformer')

module.exports =
function callback(t, init, continuation){
  var done = false, stepper, result,
      xf = transformer(init)

  stepper = t(xf)
  result = stepper.init()

  function checkDone(err, item){
    if(done){
      return true
    }

    err = err || null

    // check if exhausted
    if(isReduced(result)){
      result = unreduced(result)
      done = true
    }

    if(err || done || item === void 0){
      result = stepper.result(result)
      done = true
    }

    // notify if done
    if(done){
      if(continuation){
        continuation(err, result)
        continuation = null
        result = null
      } else if(err){
        result = null
        throw err
      }
    }

    return done
  }

  return function(err, item){
    if(!checkDone(err, item)){
      try {
        // step to next result.
        result = stepper.step(result, item)
        checkDone(err, item)
      } catch(err2){
        checkDone(err2, item)
      }
    }
    if(done) return result
  }
}
