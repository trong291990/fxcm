const moment = require('moment-timezone')

moment.tz.setDefault('UTC')

function getMidPrice(lowerPrice, upperPrice) {
  const standardMidPrice = upperPrice > lowerPrice && (lowerPrice + ((upperPrice - lowerPrice) / 2))
  const scewedMidPrice = upperPrice < lowerPrice && (upperPrice + ((lowerPrice - upperPrice) / 2))

  return standardMidPrice || scewedMidPrice || upperPrice
}

function normalisePrice({ pair, price }) {
  const roundDecimal = (num) => num.toFixed(2)

  return pair.includes('JPY') || pair.includes('HUF')
    ? parseFloat(roundDecimal(parseFloat(price) * 100))
    : parseFloat(roundDecimal(parseFloat(price) * 10000))
}

function denormalisePairValue({ pair, value }) {
  return pair.includes('JPY') || pair.includes('HUF')
    ? parseFloat((parseFloat(value) / 100).toFixed(3))
    : parseFloat((parseFloat(value) / 10000).toFixed(5))
}

function removeCurrentCandle(data) {
  const sortedData = data.sort((oldest, newest) => moment(oldest.timestamp).diff(moment(newest.timestamp)))
  sortedData.pop()
  return sortedData
}

module.exports = {
  getMidPrice,
  normalisePrice,
  denormalisePairValue,
  removeCurrentCandle
}