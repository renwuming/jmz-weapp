import Taro, { Component } from '@tarojs/taro'
import { View, Text } from '@tarojs/components'
import { AtAvatar, AtButton, AtSwitch, AtBadge, AtIcon } from 'taro-ui'
import './index.scss'
import { request } from '../../api'
import LoginBtn from '../../components/loginBtn'
import FormIdBtn from '../../components/FormIdBtn'
import UserItem from '../../components/UserItem'

let updateTimer

interface IState {
  userList: Array<Object>
  ownRoom: boolean
  inRoom: boolean
  inGame: boolean
  activeGame: string
  randomMode: boolean
  quickMode: boolean
  over: boolean
}

export default class Index extends Component<any, IState> {
  state = {
    userList: [],
    ownRoom: false,
    inRoom: false,
    inGame: false,
    activeGame: '',
    randomMode: true,
    quickMode: true,
    over: false
  }

  onShareAppMessage() {
    const { id } = this.$router.params
    return {
      title: '房间已开好，快来加入吧~',
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

  }

  updateRoomData() {
    const { id } = this.$router.params
    request({
      method: 'GET',
      url: `/rooms/wx/${id}`
    }).then(data => {
      this.setState(data)
      const { activeGame } = data
      // 若已开始，则跳转
      if (activeGame) {
        this.gotoGame(activeGame)
      }
    })
  }

  gotoGame(id) {
    const { activeGame } = this.state
    Taro.redirectTo({
      url: `/pages/game/index?id=${id ? id : activeGame}`
    })
  }

  startGame() {
    const { id } = this.$router.params
    const { randomMode, quickMode } = this.state
    request({
      method: 'POST',
      url: `/rooms/wx/${id}/start`,
      data: {
        randomMode,
        quickMode
      }
    }).then(data => {
      if (data.id) {
        const gameID = data.id
        Taro.redirectTo({
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
    }).then(data => {
      if (!data) {
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
    }).then(data => {
      if (!data) {
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

  // 将玩家置顶
  stick(index) {
    const { id } = this.$router.params
    request({
      method: 'POST',
      url: `/rooms/${id}/edituserlist/${index}`
    }).then(data => {
      if (!data) {
        this.updateRoomData()
      }
    })
  }

  render() {
    const {
      userList,
      ownRoom,
      inRoom,
      inGame,
      activeGame,
      randomMode,
      quickMode,
      over
    } = this.state
    return (
      <View className="container">
        {userList.map((user, index) => {
          const { userInfo, id } = user
          const { nickName, avatarUrl } = userInfo
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
              {ownRoom && index > 1 ? (
                <AtIcon
                  onClick={() => {
                    this.stick(index)
                  }}
                  value="arrow-up"
                  size="20"
                  color="#009966"
                ></AtIcon>
              ) : (
                <AtIcon
                  className="hidden"
                  value="arrow-up"
                  size="20"
                  color="#009966"
                ></AtIcon>
              )}
            </View>
          )
        })}
        <View className="btn-list">
          {ownRoom && !activeGame && (
            <View>
              <AtSwitch
                title="限时竞技"
                className="red-switch"
                color="#e6504b"
                border={false}
                checked={quickMode}
                onChange={() => {
                  this.setState({
                    quickMode: !quickMode
                  })
                }}
              />
              <AtSwitch
                title="随机组队"
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
            <FormIdBtn
              text={over ? '回顾' : inGame ? '继续' : '旁观'}
              onClick={() => {
                this.gotoGame()
              }}
            ></FormIdBtn>
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
