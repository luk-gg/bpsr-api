import convolve from "convolution"

const a = [.8, .2]
const b = [.85, .15]

const result = convolve(a, b)
console.log(result)