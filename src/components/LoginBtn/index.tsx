import Taro, { Component } from '@tarojs/taro'
import { View } from '@tarojs/components'
import { AtButton } from 'taro-ui'
import './index.scss'
import { updateUserInfo } from '../../api'

interface IProps {
  className: string
  text: string
  callback: Function
}

export default class Index extends Component<IProps, any> {
  static defaultProps = {
    className: '',
    text: '',
    callback: () => {}
  }

  state = {}

  componentDidHide() {}
  componentWillUnmount() {}
  componentDidShow() {}

  getUserInfo(data) {
    const { detail } = data
    const { userInfo } = detail

    // 若授权成功
    if (userInfo) {
      updateUserInfo(userInfo).then(() => {
        Taro.setStorageSync('userInfo', userInfo)
        this.props.callback()
      })
    } else {
      const delay = 1000
      // 若拒绝授权
      Taro.showToast({
        title: '不授权将使用默认昵称、头像，可以稍后重新授权',
        // title: '不授权昵称、头像，无法创建或加入房间',
        icon: 'none',
        duration: delay
      })
      setTimeout(() => {
        this.props.callback()
      }, delay)
    }
  }

  render() {
    const { text, className } = this.props
    return (
      <View>
        <AtButton
          className={className}
          circle
          type="primary"
          size="normal"
          openType="getUserInfo"
          onGetUserInfo={data => {
            this.getUserInfo(data)
          }}
        >
          {text}
        </AtButton>
      </View>
    )
  }
}
