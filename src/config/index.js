let env = 'prod'
// env = 'dev'

export const baseUrl =
  env === 'dev'
    ? 'http://localhost:9999'
    // ? 'http://47.104.15.69/jmz-fyb2'
    : 'https://www.renwuming.cn/jmz'
export const baseUrlAuth =
  env === 'dev'
    ? 'http://localhost:5555'
    : 'https://www.renwuming.cn/auth/'

export const weappName = 'jmz'
