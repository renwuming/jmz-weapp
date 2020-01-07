import { Component } from '@tarojs/taro'
import { View, Text } from '@tarojs/components'
import { AtModal } from "taro-ui"
import './index.scss'


interface IProps {
  long: boolean;
  llong: boolean;
  text: string,
}

export default class Index extends Component<IProps, any> {
  constructor(props) {
    super(props)
  }

  state = {
    isOpened: false,
  }

  static defaultProps = {
    long: false,
    llong: false,
    text: '',
  }

  showWordDetail() {
    this.setState({
      isOpened: true,
    })
  }
  handleConfirm() {
    this.setState({
      isOpened: false,
    })
  }

  render () {
    const { text, long, llong } = this.props
    const { isOpened } = this.state
    return (
      <View>
        <Text 
          className={`word ${long && 'long'} ${llong && 'llong'}`}
          onClick={this.showWordDetail}
        >
          {text}
        </Text>
        <AtModal
          isOpened={isOpened}
          closeOnClickOverlay={false}
          confirmText='确认'
          onConfirm={ this.handleConfirm.bind(this) }
          content={text}
        />
      </View>
    )
  }
}

