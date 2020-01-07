import Taro, { Component } from '@tarojs/taro'
import { View, Text, Image } from '@tarojs/components'
import './index.scss'

interface UserInfo {
  nickName: string
  avatarUrl: string
}

interface IProps {
  data: UserInfo
}

export default class Index extends Component<IProps, any> {
  static defaultProps = {
    data: {}
  }

  ifCurrentUser() {
    const { data } = this.state
    const userInfo = Taro.getStorageSync('userInfo')
    if (!data || !userInfo) return false
    return (
      userInfo.nickName === data.nickName &&
      userInfo.avatarUrl === data.avatarUrl
    )
  }

  render() {
    const { data } = this.props
    const currentUser = this.ifCurrentUser()
    return (
      <View className="row">
        <Image className="useritem-avatar" src={data.avatarUrl} />
        <Text className={`short-nick ${currentUser ? 'current' : ''}`}>
          {data.nickName}
        </Text>
      </View>
    )
  }
}
