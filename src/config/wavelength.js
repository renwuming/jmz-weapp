export const version = 'v0.0.1';
import { ENV as env } from './index';

const devIP = '10.221.96.144';

export const baseUrl =
  env === 'dev'
    ? `http://${devIP}:3000`
    : 'https://www.renwuming.cn/wavelength';

export const baseUrlAuth =
  env === 'dev' ? `http://${devIP}:5555` : 'https://www.renwuming.cn/auth';

export const weappName = 'jmz';
