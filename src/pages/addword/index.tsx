import Taro, { Component, Config } from '@tarojs/taro'
import { View, Text, Input } from '@tarojs/components'
import './index.scss'
import { AtButton, AtMessage } from 'taro-ui'
import { request } from '../../api'

interface IState {
  word: string
}

export default class Index extends Component<any, IState> {
  config: Config = {
    navigationBarTitleText: '贡献词条'
  }
  state = {
    word: ''
  }

  submit() {
    const { word } = this.state
    const submitWord = word.trim()
    if (submitWord.length < 1 || submitWord.length > 5) {
      Taro.atMessage({
        message: '请填写1-5字的词语!',
        type: 'warning'
      })
      return
    }
    request({
      method: 'POST',
      url: `/words/add`,
      data: {
        word: submitWord
      }
    }).then(() => {
      Taro.showToast({
        title: '提交成功',
        icon: 'success',
        duration: 1000
      })
      this.init()
    })
  }

  init() {
    this.setState({
      word: ''
    })
  }

  oninput(e) {
    const word = e.detail.value
    this.setState({
      word
    })
    return word
  }

  render() {
    const { word } = this.state
    return (
      <View className="container">
        <AtMessage />
        <Input
          className="word-input"
          type="text"
          onInput={this.oninput}
          value={word}
        />
        <AtButton
          className="menu-btn"
          circle
          type="primary"
          size="normal"
          onClick={() => {
            this.submit()
          }}
        >
          提交
        </AtButton>
        <Text className="statement">
          *注：请填写1-5字的词语，后台审核完成后，将加入小程序截码战的词库。欢迎大家贡献词条~
        </Text>
      </View>
    )
  }
}
