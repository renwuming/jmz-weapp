let env = 'prod'
// env = 'dev'
const devIP = '192.168.1.9'

export const baseUrl =
  env === 'dev'
    ? `http://${devIP}:9995`
    : // ? 'http://47.104.15.69/jmz-fyb2'
      'https://www.renwuming.cn/jmz'

export const baseUrlAuth =
  env === 'dev' ? `http://${devIP}:5555` : 'https://www.renwuming.cn/auth/'

export const baseUrlWs =
  env === 'dev' ? `ws://${devIP}:9994` : 'wss://www.renwuming.cn/jmz-ws'

export const weappName = 'jmz'
