import Taro, { Component } from '@tarojs/taro'
import { AtModal, AtModalHeader, AtModalContent, AtButton } from 'taro-ui'
import './index.scss'
import { request } from '../../api'


export default class Index extends Component {

  state = {
    showLogin: false,
  }

  componentDidMount() {
    request({
      method: 'GET',
      url: '/users',
    }).then(data => {
      if(!data.userInfo) {
        this.setState({
          showLogin: true,
        })
      } else {
        Taro.setStorageSync('userInfo', data.userInfo)
      }
    })
  }

  updateUserInfo(userInfo) {
    return request({
        method: 'POST',
        url: '/wx/userInfo',
        data: {
          userInfo,
        },
      })
  }

  getUserInfo(data) {
    const { detail } = data
    const { userInfo } = detail
    // 若授权成功
    if(userInfo) {
      this.updateUserInfo(userInfo).then(() => {
        this.setState({
          showLogin: false,
        })
        Taro.setStorageSync('userInfo', userInfo)
        Taro.showToast({
          title: '登录成功',
          icon: 'success',
          duration: 1000,
        })
      })
    } else {
      // 若拒绝授权
    }
  }

  render () {
    const { showLogin } = this.state
    return (
      <AtModal
        isOpened={showLogin}
        closeOnClickOverlay={false}
      >
        <AtModalHeader>请您登录</AtModalHeader>
        <AtModalContent>
          <AtButton
            className='login-btn'
            circle
            type='primary'
            size='normal'
            openType='getUserInfo'
            onGetUserInfo={(data) => {this.getUserInfo(data)}}
          >
            微信登录
          </AtButton>
        </AtModalContent>
      </AtModal>
    )
  }
}

