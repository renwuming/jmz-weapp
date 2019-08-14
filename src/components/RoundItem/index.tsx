import Taro, { Component } from '@tarojs/taro'
import { View, Text, Picker, Input } from '@tarojs/components'
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
  battle: string,
  onAnswerChange: Function,
  onQuestionChange: Function,
}

export default class Index extends Component<IProps, any> {

  static defaultProps = {
    data: {},
    index: 0,
    battle: '',
    onAnswerChange: () => {},
    onQuestionChange: () => {},
  }

  getCodeRange() {
    return [1, 2, 3, 4]
  }

  onAnswerChange(e) {
    const answer = +e.detail.value + 1
    const { index, onAnswerChange } = this.props
    onAnswerChange(index, answer)
  }

  onQuestionChange(e) {
    const question = e.detail.value
    const { index, onQuestionChange } = this.props
    onQuestionChange(index, question)
  }

  render () {
    const { data, index, battle } = this.props
    const { question, answer, code } = data
    let roundItem
    if (!battle) {
      roundItem = 
        <View className={index % 2 === 1 ? 'row grey' : 'row'}>
          <Word
            long={true}
            text={question}
          ></Word>
          <Text className='code'>{answer}</Text>
          <Text className='code'>{code}</Text>
        </View>
    } else if (battle === '解密' || '拦截') {
      roundItem = 
        <View className='row'>
          <Word
            llong={true}
            text={question}
          ></Word>
          <Picker mode='selector' value={0} range={this.getCodeRange()} onChange={this.onAnswerChange}>
            <Text className='code battle edit'>{answer > 0 ? answer : ''}</Text>
          </Picker>
        </View>
    } else if (battle === '加密') {
      roundItem = 
        <View className='row'>
          <Input 
            className='word'
            type='text'
            onInput={this.onQuestionChange}
          />
          <Text className='code battle'>{answer > 0 ? answer : ''}</Text>
        </View>
    }
    return (
      roundItem
    )
  }
}

