import Taro, { Component } from '@tarojs/taro'
import { View, Text } from '@tarojs/components'
import { AtBadge, AtIcon, AtButton } from 'taro-ui'
import './index.scss'
import UserItem from '../../components/UserItem'
import { request } from '../../api'

let updateTimer

export default class Index extends Component<any, any> {
  componentDidHide() {
    this.cancelMatch()
  }
  componentWillUnmount() {
    this.cancelMatch()
  }
  componentDidShow() {
    this.updateMatch()
    clearInterval(updateTimer)
    updateTimer = setInterval(() => {
      this.updateMatch()
    }, 1000)
  }

  updateMatch() {
    request({
      method: 'POST',
      url: '/online/match/update'
    }).then(res => {
      const { list, activeGame, countDownTime, success } = res
      if (list && list.length) {
        this.setState({
          userList: list,
          success,
          countDownTime
        })
      }
      if (activeGame) {
        this.gotoGame(activeGame)
      }
    })
  }

  gotoGame(id = null) {
    const { activeGame } = this.state
    Taro.reLaunch({
      url: `/pages/game/index?id=${id ? id : activeGame}`
    })
  }

  gotoGroup() {
    Taro.navigateTo({
      url: `/pages/imglist/index?type=group`
    })
  }

  cancelMatch() {
    clearInterval(updateTimer)
    request({
      method: 'POST',
      url: '/online/match/cancel'
    })
  }

  render() {
    const { userList, success, countDownTime } = this.state
    const countdown = Math.floor(countDownTime / 1000)
    return (
      <View className="container">
        {success ? (
          <View className="match-tip">
            <View>
              匹配成功，<Text>{countdown >= 0 ? countdown : 0}秒</Text>
              后将开始游戏
            </View>
          </View>
        ) : (
          <View className="match-tip">
            <View>匹配对手中</View>
            <View className="at-icon at-icon-loading-3 loading-box"></View>
          </View>
        )}
        {userList.map((user, index) => {
          const { me, userData } = user
          const { userInfo, _id } = userData
          const { nickName } = userInfo
          return (
            <View className={`row ${index === 3 ? 'division' : ''}`}>
              <Text className={`index ${index < 4 ? 'inGame' : ''}`}>
                {index + 1}
              </Text>
              <Text className="nick">{nickName}</Text>
              {me ? (
                <AtBadge value={'我'}>
                  <UserItem
                    nonick={true}
                    big={true}
                    data={{
                      id: _id,
                      ...userInfo
                    }}
                  ></UserItem>
                </AtBadge>
              ) : (
                <UserItem
                  nonick={true}
                  big={true}
                  data={{
                    id: _id,
                    ...userInfo
                  }}
                ></UserItem>
              )}
              <AtIcon
                className="hidden"
                value="arrow-up"
                size="20"
                color="#009966"
              ></AtIcon>
            </View>
          )
        })}
        <View className="btn-list">
          <AtButton
            className="menu-btn error-btn"
            circle
            type="primary"
            size="normal"
            onClick={() => {
              Taro.navigateBack()
            }}
          >
            放弃匹配
          </AtButton>
          <AtButton
            className="menu-btn secondary"
            circle
            type="primary"
            size="normal"
            onClick={() => {
              this.gotoGroup()
            }}
          >
            和群友一起玩
          </AtButton>
        </View>
      </View>
    )
  }
}
