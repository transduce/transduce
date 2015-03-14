var /* global Symbol */
    /* jshint newcap:false */
    symbolExists = typeof Symbol !== 'undefined',
    iterator = symbolExists ? Symbol.iterator : '@@iterator'
    transformer = '@@transformer'

module.exports = {
  iterator: iterator,
  transformer: transformer
}
