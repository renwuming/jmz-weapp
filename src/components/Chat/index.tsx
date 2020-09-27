import Taro, { Component } from '@tarojs/taro';
import { View } from '@tarojs/components';
import './index.scss';

interface IProps {
  sendMsgRequest: Function;
  msgList: string[];
}

export default class Index extends Component<IProps, any> {
  static defaultProps = {
    sendMsgRequest: () => {},
    msgList: [],
  };

  componentDidHide() {}
  componentWillUnmount() {}
  componentDidShow() {}

  render() {
    return <View></View>;
  }
}
