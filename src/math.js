import {Transducer, protocols, identity} from './util'

const {step: tStep, result: tResult} = protocols.transducer

export const max = f => xf => new Max(f, xf)
class Max extends Transducer {
  constructor(f, xf){
    super(xf)
    this.f = f || identity
    this.computedResult = -Infinity
    this.lastComputed = -Infinity
  }
  [tStep](value, input){
    var computed = this.f(input)
    if (computed > this.lastComputed ||
        computed === -Infinity && this.computedResult === -Infinity) {
      this.computedResult = input
      this.lastComputed = computed
    }
    return value
  }
  [tResult](value){
    return this.xfResult(this.xfStep(value, this.computedResult))
  }
}

export const min = f => xf => new Min(f, xf)
class Min extends Transducer {
  constructor(f, xf){
    super(xf)
    this.f = f || identity
    this.computedResult = Infinity
    this.lastComputed = Infinity
  }
  [tStep](value, input){
    var computed = this.f(input)
    if (computed < this.lastComputed ||
        computed === Infinity && this.computedResult === Infinity) {
      this.computedResult = input
      this.lastComputed = computed
    }
    return value
  }
  [tResult](value){
    return this.xfResult(this.xfStep(value, this.computedResult))
  }
}
