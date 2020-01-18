import Taro, { Component } from '@tarojs/taro'
import { AtModal, AtModalHeader, AtModalContent } from 'taro-ui'
import { View, Text, Image } from '@tarojs/components'
import './index.scss'
import { request } from '../../api'

interface UserInfo {
  nickName: string
  avatarUrl: string
}

interface IProps {
  data: UserInfo
  nonick: Boolean
  big: Boolean
  userDetail: Object
}

export default class Index extends Component<IProps, any> {
  static defaultProps = {
    data: {},
    nonick: false,
    big: false,
    userDetail: {}
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

  showUserDetail() {
    this.setState({
      isOpened: true
    })
    const { data } = this.props
    const { id } = data
    request({
      method: 'GET',
      url: `/users/gamedata/${id}`
    }).then(res => {
      this.setState({
        userDetail: res
      })
    })
  }
  handleConfirm() {
    this.setState({
      isOpened: false
    })
  }

  render() {
    const { data, nonick, big } = this.props
    const { isOpened, userDetail } = this.state
    const currentUser = this.ifCurrentUser()
    return (
      <View className={`row ${big ? 'big' : ''}`}>
        <Image
          className="useritem-avatar"
          src={data.avatarUrl}
          onClick={() => {
            this.showUserDetail()
          }}
        />
        {!nonick && (
          <Text
            className={`short-nick ${currentUser ? 'current' : ''}`}
            onClick={() => {
              this.showUserDetail()
            }}
          >
            {data.nickName}
          </Text>
        )}
        <AtModal
          isOpened={isOpened}
          onClose={this.handleConfirm.bind(this)}
          onConfirm={this.handleConfirm.bind(this)}
        >
          <AtModalHeader>{data.nickName}</AtModalHeader>
          <AtModalContent>
            <View className="detail-row">
              <Text className="left win-rate">胜率</Text>
              <Text className="win-rate">{userDetail.winRate}%</Text>
            </View>
            <View className="detail-row">
              <Text className="left">获胜局数</Text>
              <Text className="info">{userDetail.winSum}</Text>
            </View>
            <View className="detail-row">
              <Text className="left">总计局数</Text>
              <Text className="info">{userDetail.Sum}</Text>
            </View>
          </AtModalContent>
        </AtModal>
      </View>
    )
  }
}
