import Taro, { Component } from '@tarojs/taro'
import { View, Text } from '@tarojs/components'
import { AtBadge, AtIcon } from 'taro-ui'
import './index.scss'
import UserItem from '../../components/UserItem'
import { request } from '../../api'

let updateTimer

export default class Index extends Component<any, any> {
  componentDidHide() {
    clearInterval(updateTimer)
  }
  componentWillUnmount() {
    clearInterval(updateTimer)
  }
  componentDidShow() {
    this.updateMatch()
    clearInterval(updateTimer)
    updateTimer = setInterval(() => {
      this.updateMatch()
    }, 3000)
  }

  updateMatch() {
    request({
      method: 'POST',
      url: '/online/match'
    }).then(res => {
      this.setState({
        userList: res
      })
    })
  }

  render() {
    const { userList } = this.state
    return (
      <View className="container">
        {userList.map((user, index) => {
          const { userInfo, id } = user
          const { nickName } = userInfo
          return (
            <View className={`row ${index === 3 ? 'division' : ''}`}>
              <Text className={`index ${index < 4 ? 'inGame' : ''}`}>
                {index + 1}
              </Text>
              <Text className="nick">{nickName}</Text>
              {index === 0 ? (
                <AtBadge value={'房主'}>
                  <UserItem
                    nonick={true}
                    big={true}
                    data={{
                      id,
                      ...userInfo
                    }}
                  ></UserItem>
                </AtBadge>
              ) : (
                <UserItem
                  nonick={true}
                  big={true}
                  data={{
                    id,
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
      </View>
    )
  }
}
