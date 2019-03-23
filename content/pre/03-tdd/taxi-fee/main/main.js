const PRICE_PER_KM = 0.8

/**
 * @param {number} distance total distance of the travel
 * @param {number} latency total wating time in between
 * @returns {number} final price to pay
 */
function main(distance, latency = 0) {
  let price = 6
  
  let above2 = distance - 2
  if (above2 > 0) {
    price += above2 * PRICE_PER_KM
  }

  let above8 = distance - 8
  if (above8 > 0) {
    price += above8 * PRICE_PER_KM * 0.5
  }

  price += latency * 0.25

  return Math.round(price)
}

module.exports = main
