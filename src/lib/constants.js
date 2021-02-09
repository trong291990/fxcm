const C = {
  DATE_FORMAT: 'DD-MMM-YY',
  TIME_FORMAT: 'HH:mm:ss',
  DATETIME_FORMAT: 'DD-MMM-YY / HH:mm:ss',
  TIMEFRAMES: ["m1", "m5", "m15", "m30", "H1", "H2", "H3", "H4", "H6", "H8", "D1", "W1", "M1"],
  historicalID: ({ pair, timeframe }) => `${pair}-${timeframe}`
}

module.exports = C
