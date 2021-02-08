const api = require('./src/lib/api')
const {
  token,
  isDemo
} = require('./src/config')

const go = async () => {
  const fxcm = api({ token, isDemo })

  fxcm.authenticate()
}

go()