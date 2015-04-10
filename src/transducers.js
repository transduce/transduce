import {Transducer, reduced, isReduced, unreduced,
        protocols, identity, compose} from './util'
import {reduce} from './core'

const {step: tStep, result: tResult} = protocols.transducer

export const map = f => xf => new Map(f, xf)
class Map extends Transducer {
  constructor(f, xf){
    super(xf)
    this.f = f
  }
  [tStep](value, input){
    return this.xfStep(value, this.f(input))
  }
}

export const filter = p => xf => new Filter(p, xf)
class Filter extends Transducer {
  constructor(p, xf){
    super(xf)
    this.p = p
  }
  [tStep](value, input){
    return this.p(input) ? this.xfStep(value, input) : value
  }
}

export const remove = p => filter(x => !p(x))

export const take = n => xf => new Take(n, xf)
class Take extends Transducer {
  constructor(n, xf){
    super(xf)
    this.n = n
  }
  [tStep](value, input){
    if(this.n-- > 0){
      value = this.xfStep(value, input)
    }
    if(this.n <= 0){
      value = reduced(value)
    }
    return value
  }
}

export const takeWhile = p => xf => new TakeWhile(p, xf)
class TakeWhile extends Transducer {
  constructor(p, xf){
    super(xf)
    this.p = p
  }
  [tStep](value, input){
    return this.p(input) ? this.xfStep(value, input) : reduced(value)
  }
}

export const drop = n => xf => new Drop(n, xf)
class Drop extends Transducer {
  constructor(n, xf){
    super(xf)
    this.n = n
  }
  [tStep](value, input){
    return (--this.n < 0) ? this.xfStep(value, input) : value
  }
}

export const dropWhile = p => xf => new DropWhile(p, xf)
class DropWhile extends Transducer {
  constructor(p, xf){
    super(xf)
    this.p = p
    this.found = false
  }
  [tStep](value, input){
    if(!this.found){
      if(this.p(input)){
        return value
      }
      this.found = true
    }
    return this.xfStep(value, input)
  }
}

export const cat = xf => new Cat(xf)
class Cat extends Transducer {
  constructor(xf){
    super(new PreserveReduced(xf))
  }
  [tStep](value, input){
    return reduce(this.xf, value, input)
  }
}

class PreserveReduced extends Transducer {
  constructor(xf){
    super(xf)
  }
  [tStep](value, input){
    value = this.xfStep(value, input)
    if(isReduced(value)){
      value = reduced(value, true)
    }
    return value
  }
}

export const mapcat = f => compose(map(f), cat)

export const partitionAll = n => xf => new PartitionAll(n, xf)
class PartitionAll extends Transducer {
  constructor(n, xf){
    super(xf)
    this.n = n
    this.inputs = []
  }
  [tStep](value, input){
    var ins = this.inputs
    ins.push(input)
    if(this.n === ins.length){
      this.inputs = []
      value = this.xfStep(value, ins)
    }
    return value
  }
  [tResult](value){
    var ins = this.inputs
    if(ins && ins.length){
      this.inputs = []
      value = this.xfStep(value, ins)
    }
    return this.xfResult(value)
  }
}

export const partitionBy = f => xf => new PartitionBy(f, xf)
class PartitionBy extends Transducer {
  constructor(f, xf){
    super(xf)
    this.f = f
  }
  [tStep](value, input){
    var ins = this.inputs,
        curr = this.f(input),
        prev = this.prev
    this.prev = curr
    if(ins === void 0){
      this.inputs = [input]
    } else if(prev === curr){
      ins.push(input)
    } else {
      this.inputs = []
      value = this.xfStep(value, ins)
      if(!isReduced(value)){
        this.inputs.push(input)
      }
    }
    return value
  }
  [tResult](value){
    var ins = this.inputs
    if(ins && ins.length){
      this.inputs = []
      value = this.xfStep(value, ins)
    }
    return this.xfResult(value)
  }
}

export const dedupe = () => xf => new Dedupe(xf)
class Dedupe extends Transducer {
  constructor(xf){
    super(xf)
    this.sawFirst = false
  }
  [tStep](value, input){
    if (!this.sawFirst || this.last !== input){
      value = this.xfStep(value, input)
    }
    this.last = input
    this.sawFirst = true
    return value
  }
}

export const unique = f => xf => new Unique(f, xf)
class Unique extends Transducer {
  constructor(f, xf){
    super(xf)
    this.seen = []
    this.f = f || identity
  }
  [tStep](value, input){
    var computed = this.f(input)
    if (this.seen.indexOf(computed) < 0){
      this.seen.push(computed)
      value = this.xfStep(value, input)
    }
    return value
  }
}

export const tap = f => xf => new Tap(f, xf)
class Tap extends Transducer {
  constructor(f, xf){
    super(xf)
    this.f = f
  }
  [tStep](value, input){
    this.f(value, input)
    return this.xfStep(value, input)
  }
}

export const interpose = separator => xf => new Interpose(separator, xf)
class Interpose extends Transducer {
  constructor(separator, xf){
    super(xf)
    this.separator = separator
    this.started   = false
  }
  [tStep](value, input){
    if (this.started){
      let withSep = this.xf[tStep](value, this.separator)
      if (isReduced(withSep)){
        return withSep
      } else {
        return this.xfStep(withSep, input)
      }
    } else {
      this.started = true
      return this.xfStep(value, input)
    }
  }
}
