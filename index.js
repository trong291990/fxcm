const FXCM = require('./src/FXCM')
const {
  token,
  isDemo
} = require('./src/config')

const go = async () => {
  const fxcm = new FXCM({ token, isDemo })

  //const marketData = await fxcm.markets()
  const historical = await fxcm.historical({ pair: 'USD/CAD' })
  console.log(`historical = ${JSON.stringify(historical)}`)
  fxcm.logout()
}

go()