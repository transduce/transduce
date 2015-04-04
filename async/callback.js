'use strict'
var isReduced = require('../core/isReduced'),
    unreduced = require('../core/unreduced'),
    transformer = require('../core/transformer'),
    tp = require('../core/protocols').transducer

module.exports =
function callback(t, init, continuation){
  var done = false, stepper, value,
      xf = transformer(init)

  stepper = t(xf)
  value = stepper[tp.init]()

  function checkDone(err, item){
    if(done){
      return true
    }

    err = err || null

    // check if exhausted
    if(isReduced(value)){
      value = unreduced(value)
      done = true
    }

    if(err || done || item === void 0){
      value = stepper[tp.result](value)
      done = true
    }

    // notify if done
    if(done){
      if(continuation){
        continuation(err, value)
        continuation = null
        value = null
      } else if(err){
        value = null
        throw err
      }
    }

    return done
  }

  return function(err, item){
    if(!checkDone(err, item)){
      try {
        // step to next result.
        value = stepper[tp.step](value, item)
        checkDone(err, item)
      } catch(err2){
        checkDone(err2, item)
      }
    }
    if(done) return value
  }
}
