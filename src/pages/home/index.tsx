import Taro, { Component, Config } from '@tarojs/taro'
import { View, Image, OpenData } from '@tarojs/components'
import LoginBtn from '../../components/loginBtn'
import { AtAvatar, AtButton } from 'taro-ui'
import './index.scss'
import { request } from '../../api'

interface IProps {
  text: string
  index: number
}

export default class Index extends Component<IProps, any> {
  static defaultProps = {
    text: '',
    index: 0
  }

  config: Config = {
    navigationBarTitleText: '首页'
  }

  onShareAppMessage() {
    return {
      title: '截码战，等你来',
      path: `/pages/home/index`
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

  gotoJmz() {
    Taro.navigateToMiniProgram({
      appId: 'wxfe74b714bde12b3f'
    })
  }

  render() {
    return (
      <View className="container">
        <Image
          className="logo"
          mode="scaleToFill"
          src="http://cdn.renwuming.cn/static/jmz/logo.png"
        />
        <View className="menu">
          <View className="user-info">
            <AtAvatar circle openData={{ type: 'userAvatarUrl' }}></AtAvatar>
            <OpenData
              className="nick"
              type="userNickName"
              lang="zh_CN"
            ></OpenData>
          </View>
          <AtButton
            className="menu-btn"
            circle
            type="primary"
            size="normal"
            onClick={() => {
              this.gotoJmz()
            }}
          >
            Let's 截码战!!
          </AtButton>
        </View>
        {/* <View className="ad-box">
          <ad unit-id="adunit-ba222e7895349b2d"></ad>
        </View> */}
      </View>
    )
  }
}
