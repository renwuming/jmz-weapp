import Taro, { Component, Config } from '@tarojs/taro'
import { View, Text } from '@tarojs/components'
import { AtAvatar, AtButton, AtSegmentedControl } from 'taro-ui'
import './index.scss'
import { request } from '../../api'

interface UserInfo {
  nickName: string
  avatarUrl: string
}

interface User {
  userInfo: UserInfo
}

interface IState {
  roomList: Array<Object>
  historyList: Array<Object>
  tabIndex: Number
}

export default class Index extends Component<IState, any> {
  state = {
    roomList: [],
    historyList: [],
    tabIndex: 0
  }
  config: Config = {
    navigationBarTitleText: '房间列表'
  }

  componentDidShow() {
    this.updateData()
  }

  updateData() {
    request({
      method: 'GET',
      url: `/users/history/games`
    }).then(res => {
      this.setState({
        historyList: res
      })
    })
    request({
      method: 'GET',
      url: `/rooms/list/wx`
    }).then(res => {
      this.setState({
        roomList: res
      })
    })
  }

  enterGame(id) {
    Taro.navigateTo({
      url: `/pages/game/index?id=${id}`
    })
  }

  enterRoom(id) {
    Taro.navigateTo({
      url: `/pages/room/index?id=${id}`
    })
  }

  changeTab(index) {
    this.setState({
      tabIndex: index
    })
    this.updateData()
  }

  render() {
    const { roomList, historyList, tabIndex } = this.state
    return (
      <View className="container">
        <AtSegmentedControl
          className="tabs"
          values={['正在进行', '历史记录']}
          onClick={index => {
            this.changeTab(index)
          }}
          current={tabIndex}
        />
        {tabIndex === 0 &&
          roomList.map((room, index) => {
            const { userList } = room
            const list = (userList as Array<User>).slice(0, 4)
            return (
              <View className="row">
                <Text className="index">{index + 1}</Text>
                <View className="avatar-box">
                  {list.map(user =>
                    user.userInfo ? (
                      <AtAvatar
                        className="avatar"
                        circle
                        image={user.userInfo.avatarUrl}
                      ></AtAvatar>
                    ) : (
                      ''
                    )
                  )}
                </View>
                <AtButton
                  className="menu-btn error-btn"
                  circle
                  type="primary"
                  size="small"
                  onClick={() => {
                    this.enterRoom(room._id)
                  }}
                >
                  进入房间
                </AtButton>
              </View>
            )
          })}
        {tabIndex === 1 &&
          historyList.map((game, index) => {
            const { userList, status } = game
            const list = (userList as Array<User>).slice(0, 4)
            return (
              <View className="row">
                <Text className="index">{index + 1}</Text>
                <View className="column">
                  <Text className="status">{status}</Text>
                  <View className="avatar-box">
                    {list.map(user =>
                      user.userInfo ? (
                        <AtAvatar
                          className="avatar"
                          circle
                          image={user.userInfo.avatarUrl}
                        ></AtAvatar>
                      ) : (
                        ''
                      )
                    )}
                  </View>
                </View>
                <AtButton
                  className="menu-btn error-btn"
                  circle
                  type="primary"
                  size="small"
                  onClick={() => {
                    this.enterGame(game._id)
                  }}
                >
                  详情
                </AtButton>
              </View>
            )
          })}
      </View>
    )
  }
}
