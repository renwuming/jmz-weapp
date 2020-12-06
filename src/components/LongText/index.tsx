import Taro, { Component } from '@tarojs/taro';
import { View, Text } from '@tarojs/components';
import './index.scss';

interface IProps {
  text: string;
}

export default class Index extends Component<IProps, any> {
  static defaultProps = {
    text: '',
  };

  componentDidHide() {}
  componentWillUnmount() {}
  componentDidShow() {}

  showWholeText() {
    const { text } = this.props;
    Taro.showModal({
      content: text,
      showCancel: false,
    });
  }

  render() {
    const { text } = this.props;
    return (
      <View
        className="container"
        onClick={() => {
          this.showWholeText();
        }}
      >
        <Text className="text">{text}</Text>
      </View>
    );
  }
}
