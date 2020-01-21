import Taro, { Component } from '@tarojs/taro'
import { View, Image, OpenData, Text } from '@tarojs/components'
import LoginBtn from '../../components/loginBtn'
import { AtAvatar, AtButton } from 'taro-ui'
import './index.scss'
import { request } from '../../api'
import GameDataView from '../../components/GameDataView'

interface IProps {
  text: string
  index: number
}

export default class Index extends Component<IProps, any> {
  static defaultProps = {
    text: '',
    index: 0
  }

  onShareAppMessage() {
    return {
      title: '截码战，最好玩的聚会游戏！',
      path: `/pages/home/index`,
      imageUrl: 'http://cdn.renwuming.cn/static/jmz/share.jpg'
    }
  }

  createRoom() {
    request({
      method: 'POST',
      url: '/rooms'
    }).then(res => {
      const { id } = res
      Taro.navigateTo({
        url: `/pages/room/index?id=${id}`
      })
    })
  }

  gotoGameList() {
    Taro.navigateTo({
      url: '/pages/gamelist/index'
    })
  }

  gotoAbout() {
    Taro.navigateTo({
      url: '/pages/about/index'
    })
  }

  render() {
    const mode = Taro.getStorageSync('mode')
    return (
      <View className="container">
        <Image
          className="logo"
          mode="scaleToFill"
          src="http://cdn.renwuming.cn/static/jmz/logo.png"
        />
        <View className="menu">
          <View className="user-info">
            <GameDataView></GameDataView>
          </View>
          <LoginBtn
            text={'创建房间'}
            className={'menu-btn'}
            callback={() => {
              this.createRoom()
            }}
          />
          <LoginBtn
            text={'我的房间'}
            className={'menu-btn'}
            callback={() => {
              this.gotoGameList()
            }}
          />
          <AtButton
            className="menu-btn secondary"
            circle
            type="primary"
            size="normal"
            openType="share"
          >
            分享
          </AtButton>
          <AtButton
            className="menu-btn secondary"
            circle
            type="primary"
            size="normal"
            onClick={() => {
              this.gotoAbout()
            }}
          >
            更多
          </AtButton>
        </View>
        {/* <View className="ad-box">
          <ad unit-id="adunit-ba222e7895349b2d"></ad>
        </View> */}
        <View
          style={{
            flexGrow: 1
          }}
        ></View>
        <View className="statement">
          <Text className="top">
            ■
            本小程序为桌游《Decrypto》的线上体验版本，仅供您线上免费试玩。如果您感觉不错，请购买正版桌游，享受《Decrypto》的快乐。
          </Text>
          {mode === 'game' && (
            <Text className="bottom">
              ■ 欢迎您添加微信
              ren-wuming，加入截码战玩家交流群，和五湖四海的截码战爱好者共同交流心得体会，并提出宝贵的建议。
            </Text>
          )}
        </View>
      </View>
    )
  }
}
