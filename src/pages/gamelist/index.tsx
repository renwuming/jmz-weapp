import Taro, { Component, Config } from '@tarojs/taro'
import { View, Text, ScrollView } from '@tarojs/components'
import { AtAvatar, AtSegmentedControl, AtDivider } from 'taro-ui'
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
  // 分页数
  page1 = 0
  page2 = 0
  // 是否已出初始化
  init = false

  state = {
    roomList: [],
    historyList: [],
    tabIndex: 0
  }
  config: Config = {
    navigationBarTitleText: '我的房间'
  }

  componentDidShow() {
    if (!this.init) {
      this.updateData1()
      this.updateData2()
      this.init = true
    }
  }

  updateData2() {
    request({
      method: 'GET',
      url: `/users/v2/history/games/${this.page2}`
    })
      .then(res => {
        const { historyList } = this.state
        this.setState({
          historyList: historyList.concat(res)
        })
        if (res.length < 10) {
          this.setState({
            end2: true
          })
        }
      })
      .then(() => {
        this.loading = false
      })
  }
  updateData1() {
    request({
      method: 'GET',
      url: `/rooms/v3/list/${this.page1}`
    })
      .then(res => {
        const { roomList } = this.state
        this.setState({
          roomList: roomList.concat(res)
        })
        if (res.length < 10) {
          this.setState({
            end1: true
          })
        }
      })
      .then(() => {
        this.loading = false
      })
  }

  enterGame(id) {
    Taro.navigateTo({
      url: `/pages/game/index?id=${id}`
    })
  }

  enterGame2(id) {
    Taro.reLaunch({
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
  }

  // 加载更多
  updateMore(index) {
    if (this.loading) return
    this.loading = true
    const { end1, end2 } = this.state
    if (index === 0 && !end1) {
      this.page1++
      this.updateData1()
    } else if (index === 1 && !end2) {
      this.page2++
      this.updateData2()
    } else {
      this.loading = false
    }
  }

  render() {
    const { roomList, historyList, tabIndex, end1, end2 } = this.state
    return (
      <View className="container">
        <View className="tabs">
          <AtSegmentedControl
            values={['正在进行', '历史记录']}
            onClick={index => {
              this.changeTab(index)
            }}
            current={tabIndex}
          />
        </View>
        {tabIndex === 0 && (
          <ScrollView
            scrollY={true}
            enableBackToTop={true}
            onScrollToLower={() => {
              this.updateMore(tabIndex)
            }}
          >
            {roomList.map((data, index) => {
              const { userList, _id, teams, observe } = data
              const list = (userList as Array<User>).slice(0, 4)
              return (
                <View
                  key={_id}
                  className="row"
                  onClick={() => {
                    if (teams) {
                      this.enterGame2(_id)
                    } else {
                      this.enterRoom(_id)
                    }
                  }}
                >
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
                  {teams ? (
                    <Text className="room-status gaming">进行中</Text>
                  ) : observe ? (
                    <Text className="room-status gaming">旁观中</Text>
                  ) : (
                    <Text className="room-status">未开始</Text>
                  )}
                </View>
              )
            })}
            {end1 ? (
              <AtDivider
                className={roomList.length > 0 ? '' : 'middle'}
                content="没有更多了"
                fontColor="#999"
                lineColor="#ccc"
              />
            ) : (
              <View className="at-icon at-icon-loading-3 loading-box"></View>
            )}
          </ScrollView>
        )}
        {tabIndex === 1 && (
          <ScrollView
            scrollY={true}
            enableBackToTop={true}
            onScrollToLower={() => {
              this.updateMore(tabIndex)
            }}
          >
            {historyList.map((game, index) => {
              const { userList, status } = game
              const list = (userList as Array<User>).slice(0, 4)
              const statusClass =
                status === '胜利' ? 'success' : status === '失败' ? 'fail' : ''
              return (
                <View
                  className="row"
                  onClick={() => {
                    this.enterGame(game._id)
                  }}
                >
                  <Text className="index">{index + 1}</Text>
                  <View className="column">
                    <Text className={`status ${statusClass}`}>{status}</Text>
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
                </View>
              )
            })}
            {end2 ? (
              <AtDivider
                className={historyList.length > 0 ? '' : 'middle'}
                content="没有更多了"
                fontColor="#999"
                lineColor="#ccc"
              />
            ) : (
              <View className="at-icon at-icon-loading-3 loading-box"></View>
            )}
          </ScrollView>
        )}
      </View>
    )
  }
}
