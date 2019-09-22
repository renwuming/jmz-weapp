import Taro, { Component } from '@tarojs/taro'
import { View, Image } from '@tarojs/components'
import './index.scss'


export default class Index extends Component {

  state = {
    groupUrl: 'http://cdn.renwuming.cn/static/jmz/group.jpg',
  }


  componentDidHide() {
  }
  componentWillUnmount() {
  }
  componentDidShow() {
  }


  render () {
    const { groupUrl } = this.state
    return (
      <View className='container'>
        <Image
          className='group-img'
          src={groupUrl}
          mode='aspectFit'
          show-menu-by-longpress={true}
        />
      </View>
    )
  }
}

