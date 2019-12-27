import Taro, { Component } from '@tarojs/taro'
import { View, Text } from '@tarojs/components'
import { AtAvatar, AtButton, AtSwitch, AtForm } from 'taro-ui'
import './index.scss'
import { request } from '../../api'
import LoginBtn from '../../components/loginBtn'

let updateTimer

interface IState {
  userList: Array<Object>
  ownRoom: boolean
  inRoom: boolean
  inGame: boolean
  activeGame: string
  waitingGame: boolean
  randomMode: boolean
}

export default class Index extends Component<any, IState> {
  state = {
    userList: [],
    ownRoom: false,
    inRoom: false,
    inGame: false,
    waitingGame: false,
    activeGame: '',
    randomMode: true
  }

  onShareAppMessage() {
    const { id } = this.$router.params
    return {
      title: '房间已开好，就等你了',
      path: `/pages/room/index?id=${id}`
    }
  }

  componentDidHide() {
    clearInterval(updateTimer)
  }
  componentWillUnmount() {
    clearInterval(updateTimer)
  }

  componentDidShow() {
    this.init()
    this.updateRoomData()

    clearInterval(updateTimer)
    updateTimer = setInterval(() => {
      this.updateRoomData()
    }, 3000)
  }

  init() {
    this.setState({
      waitingGame: false
    })
  }

  updateRoomData() {
    const { id } = this.$router.params
    request({
      method: 'GET',
      url: `/rooms/wx/${id}`
    }).then(data => {
      this.setState(data)
      const { activeGame, inGame } = data
      const { waitingGame } = this.state
      // 如果还没开始，则说明玩家在等待开始
      if (!activeGame) {
        this.setState({
          waitingGame: true
        })
      }
      // // 若已开始，则跳转
      // if(inGame && activeGame && waitingGame) {
      //   this.gotoGame()
      // }
    })
  }

  gotoGame() {
    const { activeGame } = this.state
    Taro.reLaunch({
      url: `/pages/game/index?id=${activeGame}`
    })
  }

  startGame() {
    const { id } = this.$router.params
    const { randomMode } = this.state
    request({
      method: 'POST',
      url: `/rooms/wx/${id}/start`,
      data: {
        randomMode
      }
    }).then(res => {
      const { data } = res
      if (data.code) {
        Taro.showToast({
          title: data.error,
          icon: 'none',
          duration: 1000
        })
      } else {
        const gameID = data.id
        Taro.reLaunch({
          url: `/pages/game/index?id=${gameID}`
        })
      }
    })
  }

  joinRoom() {
    const { id } = this.$router.params
    request({
      method: 'POST',
      url: `/rooms/${id}`
    }).then(res => {
      const { data } = res
      if (data.code) {
        Taro.showToast({
          title: data.error,
          icon: 'none',
          duration: 1000
        })
      } else {
        Taro.showToast({
          title: '加入房间成功',
          icon: 'success',
          duration: 1000
        })
        this.updateRoomData()
      }
    })
  }

  quitRoom() {
    const { id } = this.$router.params
    request({
      method: 'POST',
      url: `/rooms/${id}/quit`
    }).then(res => {
      const { data } = res
      if (data.code) {
        Taro.showToast({
          title: data.error,
          icon: 'none',
          duration: 1000
        })
      } else {
        Taro.showToast({
          title: '退出房间成功',
          icon: 'success',
          duration: 1000
        })
        this.updateRoomData()
      }
    })
  }

  gotoHome() {
    Taro.reLaunch({
      url: '/pages/home/index'
    })
  }

  render() {
    const {
      userList,
      ownRoom,
      inRoom,
      inGame,
      activeGame,
      randomMode
    } = this.state
    return (
      <View className="container">
        {userList.map((user, index) => {
          const { userInfo } = user
          const { nickName, avatarUrl } = userInfo
          return (
            <View className="row">
              <Text className="index">{index + 1}</Text>
              <Text className="nick">{nickName}</Text>
              <AtAvatar className="avatar" circle image={avatarUrl}></AtAvatar>
            </View>
          )
        })}
        <View className="btn-list">
          {ownRoom && !activeGame && (
            <View>
              <AtSwitch
                title="随机组队"
                className="switch"
                border={false}
                checked={randomMode}
                onChange={() => {
                  this.setState({
                    randomMode: !randomMode
                  })
                }}
              />
              <AtButton
                className="menu-btn"
                circle
                type="primary"
                size="normal"
                onClick={() => {
                  this.startGame()
                }}
              >
                开始
              </AtButton>
            </View>
          )}
          {!!activeGame && (
            <AtButton
              className="menu-btn"
              circle
              type="primary"
              size="normal"
              onClick={() => {
                this.gotoGame()
              }}
            >
              {inGame ? '继续' : '旁观'}
            </AtButton>
          )}
          {!inRoom && (
            <LoginBtn
              text={'加入房间'}
              className={'menu-btn'}
              callback={() => {
                this.joinRoom()
              }}
            />
          )}
          <AtButton
            className="menu-btn"
            circle
            type="primary"
            size="normal"
            openType="share"
          >
            邀请朋友
          </AtButton>
          {inRoom && !(inGame && activeGame) && (
            <AtButton
              className="menu-btn error-btn"
              circle
              type="primary"
              size="normal"
              onClick={() => {
                this.quitRoom()
              }}
            >
              退出房间
            </AtButton>
          )}
          <AtButton
            className="menu-btn secondary"
            circle
            type="primary"
            size="normal"
            onClick={() => {
              this.gotoHome()
            }}
          >
            回首页
          </AtButton>
        </View>
      </View>
    )
  }
}
