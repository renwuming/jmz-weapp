import Taro, { Component } from '@tarojs/taro'
import { View, Image } from '@tarojs/components'
import './index.scss'
import { AtButton } from 'taro-ui'


export default class Index extends Component {

  componentDidHide() {
  }
  componentWillUnmount() {
  }
  componentDidShow() {
  }

  gotoRule() {
    Taro.navigateTo({
      url: `/pages/imglist/index?type=rule`
    })
  }

  gotoGroup() {
    Taro.navigateTo({
      url: `/pages/imglist/index?type=group`
    })
  }

  render () {
    const mode = Taro.getStorageSync('mode')
    return (
      <View className='container'>
        <AtButton
          className='menu-btn secondary'
          circle
          type='primary'
          size='normal'
          onClick={() => {this.gotoRule()}}
        >
          规则说明
        </AtButton>
        {
          mode !== 'tool' && 
            <AtButton
              className='menu-btn secondary'
              circle
              type='primary'
              size='normal'
              onClick={() => {this.gotoGroup()}}
            >
              加群交流
            </AtButton>
        }
      </View>
    )
  }
}

