export const version = 'v7.3.0';

let env = 'prod';
// env = 'dev';
export const ENV = env;
const devIP = '10.221.96.144';

export const baseUrl =
  env === 'dev' ? `http://${devIP}:9995` : 'https://www.renwuming.cn/jmz';

export const baseUrlAuth =
  env === 'dev' ? `http://${devIP}:5555` : 'https://www.renwuming.cn/auth';

export const baseUrlWs =
  env === 'dev' ? `ws://${devIP}:9994` : 'wss://www.renwuming.cn/jmz-ws';

export const weappName = 'jmz';
