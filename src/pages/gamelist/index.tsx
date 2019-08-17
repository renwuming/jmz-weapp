import Taro, { Component, Config } from '@tarojs/taro'
import { View, Text } from '@tarojs/components'
import { AtAvatar, AtButton } from 'taro-ui'
import './index.scss'
import { request } from '../../api'


interface IState {
  roomList: Array<Object>,
}

export default class Index extends Component<IState, any> {

  state = {
    roomList: [],
  }
  config: Config = {
    navigationBarTitleText: '房间列表',
  }

  componentDidShow() {
    request({
      method: 'GET',
      url: `/rooms/list/wx`,
    }).then(res => {
      const { data } = res
      this.setState({
        roomList: data,
      })
    })
  }

  enterRoom(id) {
    Taro.navigateTo({
      url: `/pages/room/index?id=${id}`
    })
  }


  render () {
    const { roomList } = this.state
    return (
      <View className='container'>
        {
          roomList.map((room, index) => {
            const { userList } = room
            return (
              <View className='row'>
                <Text className='index'>{index + 1}</Text>
                <View className='avatar-box'>
                  {
                    userList.map(user => (
                      user.userInfo ? (
                        <AtAvatar
                          className='avatar'
                          circle
                          image={user.userInfo.avatarUrl}
                        ></AtAvatar> 
                      ) : ''
                    ))
                  }
                </View>
                <AtButton
                  className='menu-btn error-btn'
                  circle
                  type='primary'
                  size='small'
                  onClick={() => {this.enterRoom(room._id)}}
                >
                  进入房间
                </AtButton>
              </View>
            )
          })
        }
      </View>
    )
  }
}

