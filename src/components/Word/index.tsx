import { Component } from '@tarojs/taro'
import { Text } from '@tarojs/components'
import './index.scss'


interface IProps {
  long: boolean;
  text: string,
}

export default class Index extends Component<IProps, any> {
  constructor(props) {
    super(props)
  }

  static defaultProps = {
    long: false,
    text: '',
  }

  render () {
    const { text, long } = this.props
    return (
      <Text 
        className={`word ${long && 'long'}`}
      >
        {text}
      </Text>
    )
  }
}

