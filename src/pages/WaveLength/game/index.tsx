import Taro, { Component, Config } from '@tarojs/taro';
import { View, Text } from '@tarojs/components';
import { AtBadge, AtIcon, AtButton } from 'taro-ui';
import './index.scss';
import UserItem from '../../../components/UserItem';
import { request } from '../../../api';
import { IState } from './interface';

export default class Index extends Component<any, IState> {
  rotatingFlag: boolean = false;

  config: Config = {
    navigationBarTitleText: '电波同步',
  };

  constructor() {
    super();
    this.state = {
      scoresRotateDeg: 79,
      rotating: false,
    };
  }

  onShareAppMessage() {
    return {
      title: '快来体验新作品，电波同步！',
      path: `/pages/WaveLength/game/index`,
      imageUrl: 'https://cdn.renwuming.cn/static/wavelength/imgs/share.jpg',
    };
  }

  componentDidHide() {}
  componentWillUnmount() {}
  componentDidShow() {}

  rotateTurnplate() {
    if (this.rotatingFlag) return;
    this.rotatingFlag = true;
    this.setState({
      rotating: true,
    });

    setTimeout(() => {
      const randomDeg = Math.random() * 149 + 3;
      this.setState({
        scoresRotateDeg: randomDeg,
        rotating: false,
      });
      this.rotatingFlag = false;
    }, 2000);
  }

  render() {
    const { scoresRotateDeg, rotating } = this.state;
    return (
      <View className="container">
        <View className="turnplate-container">
          <View
            className={`scores ${rotating ? 'rotating' : ''}`}
            style={{
              transform: `rotate(${scoresRotateDeg}deg)`,
            }}
          ></View>
          <View className="turnplate"></View>
        </View>
        <AtButton
          loading={this.rotatingFlag}
          onClick={() => {
            this.rotateTurnplate();
          }}
        >
          旋转
        </AtButton>
      </View>
    );
  }
}
