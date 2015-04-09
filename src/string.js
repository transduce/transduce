import {Transducer, protocols, reduced,
        compose, isRegExp, isNumber, isString} from './util'

const {step: tStep, result: tResult} = protocols.transducer

export const join = separator => xf => new Join(separator, xf)
class Join extends Transducer {
  constructor(separator, xf){
    super(xf)
    this.buffer = []
    this.separator = separator
  }
  [tStep](value, input){
    this.buffer.push(input)
    return value
  }
  [tResult](value){
    value = this.xfStep(value, this.buffer.join(this.separator))
    return this.xfResult(value)
  }
}

export const nonEmpty = () => xf => new NonEmpty(xf)
class NonEmpty extends Transducer {
  constructor(xf){
    super(xf)
  }
  [tStep](value, input){
    if(isString(input) && input.trim().length){
      value = this.xfStep(value, input)
    }
    return value
  }
}

export const lines = limit => split('\n', limit)
export const chars = limit => split('', limit)

export function words(delimiter, limit) {
  if(delimiter === void 0 || isNumber(delimiter)){
    limit  = delimiter
    delimiter = /\s+/
  }
  return compose(split(delimiter, limit), nonEmpty())
}

export function split(separator, limit){ return xf => new Split(separator, limit, xf) }
class Split extends Transducer {
  constructor(separator, limit, xf){
    super(xf)
    if(isRegExp(separator)){
      separator = cloneRegExp(separator)
    }
    this.separator = separator
    this.next = null
    this.idx = 0

    if(limit == void 0){
      limit = Infinity
    }
    this.limit = limit

    if(!isRegExp(separator) && separator !== ''){
      this.spliterate = spliterateString
    } else if(isRegExp(separator)){
      this.spliterate = spliterateRegExp
    } else {
      this.spliterate = spliterateChars
    }
  }
  [tStep](value, input){
    if(input === null || input === void 0){
      return value
    }

    var str = (this.next && this.next.value || '')+input,
        chunk = this.spliterate(str, this.separator)

    for(;;){
      this.next = chunk()
      if(this.next.done){
        break
      }

      value = this.xfStep(value, this.next.value)

      if(++this.idx >= this.limit){
        this.next = null
        value = reduced(value)
        break
      }
    }
    return value
  }
  [tResult](value){
    if(this.next && this.next.value !== null && this.next.value !== void 0){
      value = this.xfStep(value, this.next.value)
    }
    return this.xfResult(value)
  }
}

function spliterateChars(str){
  var i = 0,  len = str.length,
      result = {done: false}
  return function(){
    result.value = str[i++]
    if(i >= len){
      result.done = true
    }
    return result
  }
}

function spliterateString(str, separator){
  var first, second, sepLen = separator.length,
      result = {done: false}
  return function(){
    first = (first === void 0) ? 0 : second + sepLen
    second = str.indexOf(separator, first)

    if(second < 0){
      result.done = true
      second = void 0
    }
    result.value = str.substring(first, second)
    return result
  }
}

function spliterateRegExp(str, pattern){
  var index, match,
      result = {done: false}
  pattern = cloneRegExp(pattern)
  return function(){
    match = pattern.exec(str)
    if(match){
      index = match.index
      result.value = str.substring(0, index)
      str = str.substring(index + match[0].length)
    } else {
      result.done = true
      result.value = str
    }
    return result
  }
}

function cloneRegExp(regexp){
  // From https://github.com/aheckmann/regexp-clone
  var flags = []
  if (regexp.global) flags.push('g')
  if (regexp.multiline) flags.push('m')
  if (regexp.ignoreCase) flags.push('i')
  return new RegExp(regexp.source, flags.join(''))
}
