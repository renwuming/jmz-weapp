import Taro, { Component } from '@tarojs/taro'
import { View, Text } from '@tarojs/components'
import Word from '../Word'
import './index.scss'

interface BattleRow {
  question: string,
  answer: number,
  code: number,
}

interface IProps {
  data: BattleRow,
  index: number,
}

export default class Index extends Component<IProps, any> {

  static defaultProps = {
    data: {},
    index: 0,
  }

  render () {
    const { data, index } = this.props
    const { question, answer, code } = data
    return (
      <View className={index % 2 === 1 ? 'row grey' : 'row'}>
        <Word
          long={true}
          text={question}
        ></Word>
        <Text className='code'>{answer}</Text>
        <Text className='code'>{code}</Text>
      </View>
    )
  }
}

