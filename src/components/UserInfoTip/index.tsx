import Taro, { Component } from '@tarojs/taro'
import { AtModal, AtModalHeader, AtModalContent, AtButton } from 'taro-ui'
import './index.scss'
import { request } from '../../api'


export default class Index extends Component {

  state = {
    isOpened: false,
  }

  componentDidMount () {
    request({
      method: 'GET',
      url: '/users',
    }).then(res => {
      const { data } = res
      if(!data.userInfo) {
        this.setState({
          isOpened: true,
        })
      }
    })
  }

  getUserInfo(data) {
    const { detail } = data
    // 若授权成功
    if(detail.userInfo) {
      request({
        method: 'POST',
        url: '/wx/userInfo',
        data: {
          userInfo: detail.userInfo,
        },
      }).then(() => {
        this.setState({
          isOpened: false,
        })
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
    const { isOpened } = this.state
    return (
      <AtModal
        isOpened={isOpened}
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

