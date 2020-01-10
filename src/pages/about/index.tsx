import Taro, { Component } from '@tarojs/taro'
import { View, Text } from '@tarojs/components'
import './index.scss'
import { AtButton } from 'taro-ui'

export default class Index extends Component {
  componentDidHide() {}
  componentWillUnmount() {}
  componentDidShow() {}

  gotoRule() {
    Taro.navigateTo({
      url: `/pages/imglist/index?type=rule`
    })
  }

  gotoAddword() {
    Taro.navigateTo({
      url: `/pages/addword/index`
    })
  }

  gotoGroup() {
    Taro.navigateTo({
      url: `/pages/imglist/index?type=group`
    })
  }

  render() {
    return (
      <View className="container">
      <AtButton
        className="menu-btn"
        circle
        type="primary"
        size="normal"
        onClick={() => {
          this.gotoAddword()
        }}
      >
        贡献词条
      </AtButton>
        <AtButton
          className="menu-btn secondary"
          circle
          type="primary"
          size="normal"
          onClick={() => {
            this.gotoRule()
          }}
        >
          规则说明
        </AtButton>
        <Text className='statement'>*注：本小程序由桌游【截码战(Decrypto)】改编而成，仅供线上试玩体验。推荐购买正版桌游，享受桌游的快乐~</Text>
        {/* {
            <AtButton
              className='menu-btn secondary'
              circle
              type='primary'
              size='normal'
              onClick={() => {this.gotoGroup()}}
            >
              加群交流
            </AtButton>
        } */}
      </View>
    )
  }
}
