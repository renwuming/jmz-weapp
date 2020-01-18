let env = 'prod'
// env = 'dev'

export const baseUrl =
  env === 'dev'
    ? 'http://localhost:9999'
    : 'https://www.renwuming.cn/jmz-fyb2'
export const baseUrlAuth =
  env === 'dev'
    ? 'http://localhost:5555'
    : 'https://www.renwuming.cn/auth/'

export const weappName = 'jmz'
