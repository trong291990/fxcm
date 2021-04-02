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

// Get 30min Historical Candle data for USD/CAD. Max 50 data points (Live/current candle is removed by default)
fxcm.historical({ pair: 'USD/CAD', timeframe = 'm30', datapoints = 50 })
  .then((data) => {
    console.log(JSON.stringify(data))
  })

// Get current market data for your subscribed symbols (Subscription List can be edited at tradingstation.fxcm.com)
fxcm.markets()
  .then((data) => {
    console.log(JSON.stringify(data))
    fxcm.logout()
  })
```