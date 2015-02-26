'use strict'
var isReduced = require('../core/isReduced'),
    unreduced = require('../core/unreduced'),
    transformer = require('../core/transformer')

// Creates a callback that starts a transducer process and accepts
// parameter as a new item in the process. Each item advances the state
// of the transducer. If the transducer exhausts due to early termination,
// all subsequent calls to the callback will no-op and return the computed result.
//
// If the callback is called with no argument, the transducer terminates,
// and all subsequent calls will no-op and return the computed result.
//
// The callback returns undefined until completion. Once completed, the result
// is always returned.
//
// If iniit, is not defined, maintains last value and does not buffer results.
module.exports =
function asCallback(t, init){
  var done = false, stepper, result,
      xf = transformer(init)
  stepper = t(xf)
  result = stepper.init()

  return function(item){
    if(done) return result

    if(item === void 0){
      // complete
      result = stepper.result(result)
      done = true
    } else {
      // step to next result.
      result = stepper.step(result, item)

      // check if exhausted
      if(isReduced(result)){
        result = stepper.result(unreduced(result))
        done = true
      }
    }

    if(done) return result
  }
}
