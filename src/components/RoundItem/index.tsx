import Taro, { Component } from '@tarojs/taro'
import { View, Text, Picker, Input } from '@tarojs/components'
import Word from '../Word'
import './index.scss'

interface BattleRow {
  question: string
  jiemiAnswer: number
  lanjieAnswer: number
  answer: number
  code: number
}

interface IProps {
  data: BattleRow
  index: number
  type: string
  onAnswerChange: Function
  onQuestionChange: Function
}

export default class Index extends Component<IProps, any> {
  static defaultProps = {
    data: {},
    index: 0,
    type: '',
    onAnswerChange: () => {},
    onQuestionChange: () => {}
  }

  getCodeRange() {
    return [1, 2, 3, 4]
  }

  onAnswerChange(e) {
    const answer = +e.detail.value
    const { index, onAnswerChange } = this.props
    onAnswerChange(index, answer)
  }

  onQuestionChange(e) {
    const question = e.detail.value
    const { index, onQuestionChange } = this.props
    onQuestionChange(index, question)
    return question
  }

  render() {
    const { data, index, type } = this.props
    const { question, jiemiAnswer, lanjieAnswer, code, answer } = data
    const showQuestion = question || '?????????'
    let roundItem
    if (!type) {
      roundItem = (
        <View className={index % 2 === 0 ? 'row grey' : 'row'}>
          <Word long={true} text={question}></Word>
          <Text className="code">{jiemiAnswer + 1}</Text>
          <Text className="code key">{code + 1}</Text>
          {lanjieAnswer >= 0 ? (
            <Text className="code lanjie">{lanjieAnswer + 1}</Text>
          ) : (
            <Text className="code lanjie hidden"></Text>
          )}
        </View>
      )
    } else if (type === '解密' || type === '拦截') {
      roundItem = (
        <View className="row">
          <Word llong={true} text={question}></Word>
          {question && (
            <Picker
              mode="selector"
              value={0}
              range={this.getCodeRange()}
              onChange={this.onAnswerChange}
              // onCancel={this.onAnswerChange}
            >
              <Text className="code battle edit">
                {answer >= 0 ? answer + 1 : ''}
              </Text>
            </Picker>
          )}
        </View>
      )
    } else if (type === '加密') {
      roundItem = (
        <View className="row">
          <Input
            className="word"
            type="text"
            onInput={this.onQuestionChange}
            value={question}
          />
          <Text className="code battle">{code + 1}</Text>
        </View>
      )
    } else if (type === '等待') {
      roundItem = (
        <View className="row">
          <Word llong={true} text={showQuestion}></Word>
          <Text className="code battle">{code >= 0 ? code + 1 : '?'}</Text>
        </View>
      )
    }

    return roundItem
  }
}
