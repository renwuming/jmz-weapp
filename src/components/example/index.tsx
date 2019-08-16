import Taro, { Component } from '@tarojs/taro'
import { View, Text } from '@tarojs/components'
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
    const { text, index } = this.props
    return (
      <View className={index % 2 === 1 ? 'grey' : ''}>
        <Text 
          className='word'
        >
          {text}
        </Text>
      </View>
    )
  }
}

