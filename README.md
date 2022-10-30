# fxcm
Minimalist Node.js client for programmatically trading with FXCM REST API

# Installation

```
npm install --save fxcm
````

# Import

ES6 Import:

```
import FXCM from 'fxcm'
```

CommonJS:

````
const FXCM = require('fxcm')
````

# Usage

```
const config = {
  token: "PASTE_YOUR_FXCM_TOKEN_HERE",
  isDemo: true
}

const fxcm = new FXCM(config)

// Get 30min historical candle data for USD/CAD. Max 50 data points (live/current candle is removed by default)
// Offer Ids: https://fxcm-api.readthedocs.io/en/latest/restapi.html#getting-started
// Timeframes: ["m1", "m5", "m15", "m30", "H1", "H2", "H3", "H4", "H6", "H8", "D1", "W1", "M1"],
fxcm.historical({ offerId: 7, timeframe: 'm30', datapoints: 50 })
  .then((data) => {
    console.log(JSON.stringify(data))
  })

// Get current market data for your subscribed symbols (subscription list can be edited at tradingstation.fxcm.com)
fxcm.markets()
  .then((data) => {
    console.log(JSON.stringify(data))
    fxcm.logout()
  })
```
