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

fxcm.historical({ pair: 'USD/CAD', timeframe = 'm30', datapoints = 50 })
  .then((data) => {
    console.log(JSON.stringify(data))
    fxcm.logout()
  })
```