import Taro, { Component, Config } from '@tarojs/taro'
import { View, Image, OpenData } from '@tarojs/components'
import { AtAvatar, AtButton, AtIcon } from 'taro-ui'
import UserInfoTip from '../../components/UserInfoTip'
import './index.scss'
import { request } from '../../api'


interface IProps {
  text: string,
  index: number,
}

export default class Index extends Component<IProps, any> {

  static defaultProps = {
    text: '',
    index: 0,
  }

  config: Config = {
    navigationBarTitleText: '首页',
  }

  onShareAppMessage() {
    return {
        title: '截码战，等你来',
        path: `/pages/home/index`,
    }
  }

  createRoom() {
    request({
      method: 'POST',
      url: '/rooms',
    }).then(res => {
      const { data } = res
      Taro.navigateTo({
        url: `/pages/room/index?id=${data.id}`
      })
    })
  }

  gotoGameList() {
    Taro.navigateTo({
      url: '/pages/gamelist/index'
    })
  }

  render () {
    return (
      <View className='container'>
        <UserInfoTip />
        <Image
          className='logo'
          mode='scaleToFill'
          src='http://cdn.renwuming.cn/static/jmz/logo.png'
        />
        <View className='menu'>
          <View className='user-info'>
            <AtAvatar
              circle
              openData = {{ type: 'userAvatarUrl'}}
            ></AtAvatar>
            <OpenData className='nick' type='userNickName' lang='zh_CN'></OpenData> 
          </View>
          <AtButton
            className='menu-btn'
            circle
            type='primary'
            size='normal'
            onClick={() => {this.createRoom()}}
          >
            <AtIcon className='icon' value='add' size='24' color='#fff'></AtIcon>创建房间
          </AtButton>
          <AtButton
            className='menu-btn'
            circle
            type='primary'
            size='normal'
            onClick={() => {this.gotoGameList()}}
          >
            我的游戏
          </AtButton>
          {/* <AtButton
            className='menu-btn secondary'
            circle
            type='primary'
            size='normal'
          >
            关于
          </AtButton> */}
        </View>
      </View>
    )
  }
}

