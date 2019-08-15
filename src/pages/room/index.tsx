import Taro, { Component } from '@tarojs/taro'
import { View, Text } from '@tarojs/components'
import { AtAvatar, AtButton } from 'taro-ui'
import UserInfoTip from '../../components/UserInfoTip'
import './index.scss'
import { request } from '../../api'

let updateTimer


interface IState {
  userList: Array<Object>,
  ownRoom: boolean,
  inRoom: boolean,
  inGame: boolean,
  activeGame: string,
}

export default class Index extends Component<any, IState> {

  state = {
    userList: [],
    ownRoom: false,
    inRoom: false,
    inGame: false,
    activeGame: '',
  }

  onShareAppMessage() {
    const { id } = this.$router.params
    return {
        title: '开好房间，就等你了~',
        path: `/pages/room/index?id=${id}`,
    }
  }

  componentDidHide() {
    clearInterval(updateTimer)
  }

  componentWillMount () {
    this.updateRoomData()
    const { activeGame, inGame } = this.state
    // 若房间游戏已开始，则跳转
    if(inGame && activeGame) {
      this.gotoGame()
    }

    clearInterval(updateTimer)
    updateTimer = setInterval(() => {
      this.updateRoomData()
    }, 3000)
  }


  updateRoomData() {
    const { id } = this.$router.params
    request({
      method: 'GET',
      url: `/rooms/${id}`,
    }).then(res => {
      const { data } = res
      this.setState(data)
    })
  }

  gotoGame() {
    const { id } = this.$router.params
    const { activeGame } = this.state
    Taro.navigateTo({
      url: `/pages/game/index?id=${activeGame}&roomID=${id}`
    })
  }

  startGame() {
    const { id } = this.$router.params
    request({
      method: 'POST',
      url: `/rooms/${id}/start`,
    }).then(res => {
      const { data } = res
      if(data.code) {
        Taro.showToast({
          title: data.error,
          icon: 'none',
          duration: 1000,
        })
      } else {
        const { id } = data
        Taro.navigateTo({
          url: `/pages/game/index?id=${id}`
        })
      }
    })
  }

  joinRoom() {
    const { id } = this.$router.params
    request({
      method: 'POST',
      url: `/rooms/${id}`,
    }).then(res => {
      const { data } = res
      if(data.code) {
        Taro.showToast({
          title: data.error,
          icon: 'none',
          duration: 1000,
        })
      } else {
        Taro.showToast({
          title: '加入房间成功',
          icon: 'success',
          duration: 1000,
        })
        this.updateRoomData()
      }
    })
  }

  quitRoom() {
    const { id } = this.$router.params
    request({
      method: 'POST',
      url: `/rooms/${id}/quit`,
    }).then(res => {
      const { data } = res
      if(data.code) {
        Taro.showToast({
          title: data.error,
          icon: 'none',
          duration: 1000,
        })
      } else {
        Taro.showToast({
          title: '退出房间成功',
          icon: 'success',
          duration: 1000,
        })
        this.updateRoomData()
      }
    })
  }

  render () {
    const { userList, ownRoom, inRoom, inGame, activeGame } = this.state
    return (
      <View className='container'>
        <UserInfoTip />
        {
          userList.map((user, index) => {
            const { userInfo } = user
            const { nickName, avatarUrl } = userInfo
            return (
              <View className='row'>
                <Text className='index'>{index + 1}</Text>
                <Text className='nick'>{nickName}</Text>
                <AtAvatar
                  className='avatar'
                  circle
                  image={avatarUrl}
                ></AtAvatar>
              </View>
            )
          })
        }
        <View className='btn-list'>
          {
            ownRoom && !activeGame && 
              <AtButton
                className='menu-btn'
                circle
                type='primary'
                size='normal'
                onClick={() => {this.startGame()}}
              >
                开始游戏
              </AtButton>
          }
          {
            !!activeGame && 
              <AtButton
                className='menu-btn'
                circle
                type='primary'
                size='normal'
                onClick={() => {this.gotoGame()}}
              >
                { inGame ? '继续游戏' : '旁观游戏' }
              </AtButton>
          }
          {
            !inRoom && 
              <AtButton
                className='menu-btn'
                circle
                type='primary'
                size='normal'
                onClick={() => {this.joinRoom()}}
              >
                加入房间
              </AtButton>
          }
          {
            inRoom && !(inGame && activeGame) &&
              <AtButton
                className='menu-btn error-btn'
                circle
                type='primary'
                size='normal'
                onClick={() => {this.quitRoom()}}
              >
                退出房间
              </AtButton>
          }
        </View>

      </View>
    )
  }
}

