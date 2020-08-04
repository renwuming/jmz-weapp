import Taro from '@tarojs/taro';
import { baseUrl, baseUrlAuth, weappName } from '../config';
import _ from 'lodash';

function _request(params) {
  params = handleHeader(params);
  // 若非http开头的url，则添加baseUrl
  const { url } = params;
  if (!/^http/.test(url)) {
    params.url = `${baseUrl}${url}`;
  }
  return Taro.request(params)
    .then((res) => res.data)
    .then((res) => {
      const { code, error } = res;
      if (code > 400) {
        if (code > 500) {
          warning(error);
        }
        return Promise.reject(error);
      } else {
        return res;
      }
    });
}

function handleHeader(params) {
  const ticket = Taro.getStorageSync('ticket');
  params = _.merge({}, params, {
    header: {
      'x-ticket': ticket,
      'x-weappname': weappName,
    },
  });
  return params;
}

export const updateUserInfo = (fullUserInfo) => {
  return _request({
    method: 'POST',
    url: `${baseUrlAuth}/weapp-user/update-userinfo`,
    data: fullUserInfo,
  });
};

export const validate = () => {
  return _request({
    method: 'POST',
    url: `/users/validate`,
  })
    .then((res) => {
      const { userInfo, mode, history, isAdmin } = res;
      // 缓存userInfo和mode
      Taro.setStorageSync('userInfo', userInfo);
      Taro.setStorageSync('mode', mode);
      Taro.setStorageSync('history', history);
      Taro.setStorageSync('isAdmin', isAdmin);
      return res;
    })
    .catch(() => {
      return login();
    });
};

const login = () => {
  return Taro.login().then((res) => {
    const { code } = res;
    return _request({
      method: 'POST',
      url: `${baseUrlAuth}/weapp-user/login`,
      data: {
        code,
      },
    }).then((res) => {
      const { ticket } = res;
      // 缓存ticket
      Taro.setStorageSync('ticket', ticket);
    });
  });
};

function warning(title) {
  Taro.showToast({
    title,
    icon: 'none',
    duration: 3000,
  });
}

export const request = _request;
