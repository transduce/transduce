import {Transducer, protocols, reduced, isReduced, unreduced, compose} from './util'

const {step: tStep, result: tResult} = protocols.transducer

export const forEach = f => xf => new ForEach(f, xf)
class ForEach extends Transducer {
  constructor(f, xf){
    super(xf)
    this.f = f
    this.idx = 0
  }
  [tStep](value, input){
    this.f(input, this.idx++, value)
    return this.xfStep(value, input)
  }
}

export const find = p => xf => new Find(p, xf)
class Find extends Transducer {
  constructor(p, xf){
    super(xf)
    this.p = p
  }
  [tStep](value, input){
    if(this.p(input)){
      value = reduced(this.xfStep(value, input))
    }
    return value
  }
}

export const every = p => xf => new Every(p, xf)
class Every extends Transducer {
  constructor(p, xf){
    super(xf)
    this.p = p
    this.found = false
  }
  [tStep](value, input){
    if(!this.p(input)){
      this.found = true
      return reduced(this.xfStep(value, false))
    }
    return value
  }
  [tResult](value){
    if(!this.found){
      value = this.xfStep(value, true)
    }
    return this.xfResult(value)
  }
}

export const some = p => xf => new Some(p, xf)
class Some extends Transducer {
  constructor(p, xf){
    super(xf)
    this.p = p
    this.found = false
  }
  [tStep](value, input){
    if(this.p(input)){
      this.found = true
      return reduced(this.xfStep(value, true))
    }
    return value
  }
  [tResult](value){
    if(!this.found){
      value = this.xfStep(value, false)
    }
    return this.xfResult(value)
  }
}

export const contains = target => some(x => x === target)

export function push(...toPush){ return xf => new Push(toPush, xf)}
class Push extends Transducer {
  constructor(toPush, xf){
    super(xf)
    this.toPush = toPush
  }
  [tResult](value){
    var idx
    const len = this.toPush.length
    for(idx = 0; idx < len; idx++){
      value = this.xfStep(value, this.toPush[idx])
      if(isReduced(value)){
        value = unreduced(value)
        break
      }
    }
    return this.xfResult(value)
  }
}

export function unshift(...toUnshift){ return xf => new Unshift(toUnshift, xf)}
class Unshift extends Transducer {
  constructor(toUnshift, xf){
    super(xf)
    this.toUnshift = toUnshift
    this.done = false
  }
  [tStep](value, input){
    if(!this.done){
      var idx
      const len = this.toUnshift.length
      this.done = true
      for(idx = 0; idx < len; idx++){
        value = this.xfStep(value, this.toUnshift[idx])
        if(isReduced(value)){
          return value
        }
      }
    }
    return this.xfStep(value, input)
  }
}

export const initial = n => xf => new Initial(n, xf)
class Initial extends Transducer {
  constructor(n, xf){
    super(xf)
    n = (n === void 0) ? 1 : (n > 0) ? n : 0
    this.n = n
    this.idx = 0
    this.buffer = []
  }
  [tStep](value, input){
    this.buffer[this.idx++] = input
    return value
  }
  [tResult](value){
    var idx = 0
    const count = this.idx - this.n
    for(idx = 0; idx < count; idx++){
      value = this.xfStep(value, this.buffer[idx])
      if(isReduced(value)){
        value = unreduced(value)
        break
      }
    }
    return this.xfResult(value)
  }
}

export const last = n => xf => new Last(n, xf)
class Last extends Transducer {
  constructor(n, xf){
    super(xf)
    if(n === void 0){
      n = 1
    } else {
      n = (n > 0) ? n : 0
    }
    this.n = n
    this.idx = 0
    this.buffer = []
  }
  [tStep](value, input){
    this.buffer[this.idx++ % this.n] = input
    return value
  }
  [tResult](value){
    var count = this.n,
        idx=this.idx
    if(idx < count){
      count = idx
      idx = 0
    }
    while(count--){
      value = this.xfStep(value, this.buffer[idx++ % this.n])
      if(isReduced(value)){
        value = unreduced(value)
        break
      }
    }
    return this.xfResult(value)
  }
}

export function slice(begin, end){
  if(begin === void 0){
    begin = 0
  }
  if(begin < 0){
    if(end === void 0){
      return last(-begin)
    }
    if(end >= 0){
      return compose(last(-begin), slice(0, end+begin+1))
    }
  }
  if(end < 0){
    if(begin === 0){
      return initial(-end)
    }
    return compose(slice(begin), initial(-end))
  }
  return (xf) => new Slice(begin, end, xf)
}
class Slice extends Transducer {
  constructor(begin, end, xf){
    super(xf)
    this.begin = begin
    this.end = end
    this.idx = 0
  }
  [tStep](value, input){
    if(this.idx++ >= this.begin){
      value = this.xfStep(value, input)
    }
    if(this.idx >= this.end){
      value = reduced(value)
    }
    return value
  }
}
