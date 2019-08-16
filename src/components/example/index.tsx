import Taro, { Component } from '@tarojs/taro'
import { View } from '@tarojs/components'
import './index.scss'


interface IProps {
  text: string,
  index: number,
}

export default class Index extends Component<IProps, any> {

  static defaultProps = {
    text: '',
    index: 0,
  }


  componentDidHide() {
  }
  componentWillUnmount() {
  }
  componentDidShow() {
  }


  render () {
    return (
      <View>
      </View>
    )
  }
}

