import Taro, { Component, Config } from '@tarojs/taro'
import { View, Text } from '@tarojs/components'
import './index.scss'
import { AtButton } from 'taro-ui'

// 在页面中定义插屏广告
let interstitialAd = null
export default class Index extends Component {
  config: Config = {
    navigationBarTitleText: '更多'
  }
  componentDidHide() {}
  componentWillUnmount() {}
  componentDidShow() {
    this.refreshAd()
  }

  refreshAd() {
    // 在页面onLoad回调事件中创建插屏广告实例
    if (wx.createInterstitialAd) {
      interstitialAd = wx.createInterstitialAd({
        adUnitId: 'adunit-053e651e2cd346f9'
      })
      interstitialAd.onLoad(() => {})
      interstitialAd.onError(err => {})
      interstitialAd.onClose(() => {
        this.gotoDashang()
      })
    }
  }

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

  dashang() {
    // 在适合的场景显示插屏广告
    if (interstitialAd) {
      interstitialAd.show().catch(err => {
        console.error(err)
        this.gotoDashang()
      })
    }
  }

  gotoDashang() {
    Taro.navigateTo({
      url: `/pages/imglist/index?type=reward`
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
        <AtButton
          className="menu-btn secondary"
          circle
          type="primary"
          size="normal"
          onClick={() => {
            this.dashang()
          }}
        >
          打赏作者
        </AtButton>
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
