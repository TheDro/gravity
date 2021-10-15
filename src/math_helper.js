import * as math from 'mathjs'
import { add, dotMultiply as mult, subtract } from 'mathjs'

window.math = math

function mag(vector) {
  return Math.sqrt(math.dot(vector, vector))
}

function unit(vector) {
  return mult(vector, 1/mag(vector))
}

export {add, subtract, mult, unit, mag}