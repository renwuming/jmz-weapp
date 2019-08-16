import Taro from '@tarojs/taro'
import { baseUrl } from '../config'

function _request(params, type) {
  // 取出sessionID，并验证
  const sessionID = Taro.getStorageSync('sessionID')
  // 若不是登录请求，且无sessionID，则去请求sessionID
  if (type !== 'login' && !sessionID) {
    return login().then(() => {
      return _request(params)
    })
  } else {
    updateSessionID(params)
    params.url = `${baseUrl}${params.url}`
    return Taro.request(params).then(res => {
      const { data } = res
      // 若登录超时
      if(data.code === 408 && type !== 'login') {
        // 登录后，再次请求
        return login().then(() => {
          updateSessionID(params)
          return Taro.request(params)
        })
      } else if(data.code === 500) {
        serverError()
        return res
      } else {
        return res
      }
    })
  }
}

function updateSessionID(params) {
  const sessionID = Taro.getStorageSync('sessionID')
  if (params.header) params.header['sessionid'] = sessionID
  else params.header = { sessionid: sessionID }
}

export const login = () => {
  return _request({
    method: 'POST',
    url: '/wx/session/validate',
  }, 'login').then(res => {
    const { data } = res
    if (data.success) {
      return true
    } else {
      return getSessionID()
    }
  })
}

const getSessionID = () => {
  return Taro.login().then(res => {
    if (res.code) {
      return Taro.request({
        method: 'POST',
        url: `${baseUrl}/wx/login`,
        data: {
          code: res.code,
        },
      }).then(res => {
        const { data } = res
        if (data.sessionID) {
          // 缓存sessionID
          Taro.setStorageSync('sessionID', data.sessionID)
        } else {
          warning()
        }
      })
    } else {
      warning()
    }
  })
}

function warning() {
  Taro.showToast({
    title: '登录失败',
    icon: 'none',
    duration: 2000,
  })
}

function serverError() {
  Taro.showToast({
    title: '服务器错误',
    icon: 'none',
    duration: 2000,
  })
}

export const request = _request
