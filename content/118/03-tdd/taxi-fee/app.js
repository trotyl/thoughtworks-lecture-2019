const main = require('./main/main')

const [,, distanceString, latencyString] = process.argv
const distance = parseFloat(distanceString, 10)
const latency = latencyString ? parseFloat(latencyString, 10) : undefined

const result = main(distance, latency)
console.log(result)
