import Taro, { Component } from '@tarojs/taro'
import { View } from '@tarojs/components'
import { AtButton } from 'taro-ui'
import './index.scss'
import { request } from '../../api'


interface IProps {
  className: string,
  text: string,
  callback: Function,
}

export default class Index extends Component<IProps, any> {

  static defaultProps = {
  }


  componentDidHide() {
  }
  componentWillUnmount() {
  }
  componentDidShow() {
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
        this.props.callback()
      })
    } else {
      // 若拒绝授权
      Taro.showToast({
        title: '授权登录后才能体验完整功能哦~',
        icon: 'none',
        duration: 2000,
      })
    }
  }


  render () {
    const { text, className } = this.props
    return (
      <View>
          <AtButton
            className={className}
            circle
            type='primary'
            size='normal'
            openType='getUserInfo'
            onGetUserInfo={(data) => {this.getUserInfo(data)}}
          >
            {text}
          </AtButton>
      </View>
    )
  }
}

