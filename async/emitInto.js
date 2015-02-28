'use strict'
var compose = require('../core/compose'),
    tap = require('../transducers/tap'),
    callback = require('./callback')

module.exports =
function emitInto(to, t, from){
  var cb
  t = compose(t, tap(emitItem))
  cb = callback(t, null, continuation)
  from.on('data', onData)
  from.once('error', onError)
  from.once('end', onEnd)

  function emitItem(result, item){
    to.emit('data', item)
  }

  function continuation(err){
    if(err) to.emit('error', err)
    to.emit('end')
  }

  function onData(item){
    cb(null, item)
  }

  function onError(err){
    cb(err)
  }

  function onEnd(){
    cb()
    removeListeners()
  }

  function removeListeners(){
    from.removeListener(onData)
        .removeListener(onError)
        .removeListener(onEnd)
  }

  return to
}
