const moment = require('moment-timezone')
const C = require('./lib/constants')
const api = require('./lib/api')
const { getMidPrice, normalisePrice, removeCurrentCandle } = require('./lib/price')
const offers = require('./lib/offers.json')

moment.tz.setDefault('UTC')

const GET = 'GET'

class FXCM {
  constructor({ token, isDemo }) {
    this.fxcm = api({ token, isDemo })
    this.loggedIn = false
  }

  async initialise() {
    if (!this.loggedIn) {
      try {
        this.loggedIn = await this.fxcm.authenticate()
      } catch (error) {
        console.error('Error with fxcm initialise', error)
      }
    }
  }

  async logout() {
    if (this.loggedIn) {
      await this.fxcm.logout()
      this.loggedIn = false
    }
  }

  async markets() {
    await this.initialise()
    try {
      const response = await this.fxcm.request(GET, '/trading/get_model', { models: ['Offer'] })

      if (!response || !response.offers) {
        console.log('ERROR - No Market Offers returned from API')
        return []
      }

      return response.offers.map(({
        time,
        buy,
        sell,
        spread,
        currency
      }) => {
        const dateTimeMoment = moment(time, moment.ISO_8601)

        const currentPrice = normalisePrice({
          pair: currency,
          price: getMidPrice(buy, sell)
        })

        return {
          currentPrice,
          currency,
          spread,
          timeUpdated: dateTimeMoment.format(C.TIME_FORMAT),
          dateUpdated: dateTimeMoment.format(C.DATE_FORMAT),
          timestamp: dateTimeMoment.unix()
        }
      })
    } catch (error) {
      console.error(error)
    }
  }

  async historical({ pair, timeframe = 'm30', datapoints = 1 }) {
    await this.initialise()
    try {
      const { offerId } = offers.find(offer => offer.currency === pair && offer.offerId)

      if (!offerId || C.TIMEFRAMES.indexOf(timeframe) === -1) {
        console.error(`Timeframe: '${timeframe}' or Pair: '${pair}' not found`)
        return []
      }

      const { response, candles } = await this.fxcm.request(GET, `/candles/${offerId}/${timeframe}`, { num: datapoints + 1 })

      if (response.error !== '' || candles.length === 0) throw new Error(`Error with historical response - returned candles: ${candles}`)

      const formattedPrices = candles.map(price => {
        const [
          timestamp,
          bidOpen,
          bidClose,
          bidHigh,
          bidLow,
          askOpen,
          askClose,
          askHigh,
          askLow
        ] = price

        const close = getMidPrice(bidClose, askClose)
        const open = getMidPrice(bidOpen, askOpen)
        const mid = getMidPrice(open, close)
        const high = getMidPrice(bidHigh, askHigh)
        const low = getMidPrice(bidLow, askLow)

        return {
          id: C.historicalID({ pair, timeframe }),
          timestamp,
          datetime: moment.unix(timestamp).format(C.DATETIME_FORMAT),
          close: normalisePrice({ pair, price: close }),
          open: normalisePrice({ pair, price: open }),
          mid: normalisePrice({ pair, price: mid }),
          high: normalisePrice({ pair, price: high }),
          low: normalisePrice({ pair, price: low }),
        }
      })
      return removeCurrentCandle(formattedPrices)

    } catch (error) {
      console.error(`Error with pair: ${pair}. ${error}`)
    }
  }
}

module.exports = FXCM
