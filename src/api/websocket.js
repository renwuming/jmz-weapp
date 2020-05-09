import Taro from '@tarojs/taro'
import { baseUrlWs } from '../config'
import { validate } from './index'

export function connectWs() {
  // 先关闭之前的websocket
  closeWs()
  validate().then(() => {
    const ticket = Taro.getStorageSync('ticket')
    wx.connectSocket({
      url: `${baseUrlWs}/`,
      header: {
        'content-type': 'application/json',
        'x-ticket': ticket
      }
    })
  })
}

let socketOpen = false
const socketQue = []
let WsCallBack = () => {}

wx.onSocketOpen(function(res) {
  socketOpen = true
  socketQue.forEach(id => {
    sendSocketMessage(id)
  })
})

wx.onSocketMessage(data => {
  WsCallBack(data)
})

function sendSocketMessage(msg) {
  wx.sendSocketMessage({
    data: msg
  })
}

export function getData(msg) {
  if (socketOpen) {
    sendSocketMessage(msg)
  } else {
    connectWs()
    socketQue.push(msg)
  }
}

export function listeningWs(callback) {
  WsCallBack = callback
}

export function closeWs() {
  wx.closeSocket({
    success: res => {
      console.info(res)
    }
  })
}
