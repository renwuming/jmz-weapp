import Taro, { Component, Config } from '@tarojs/taro';
import { View, Text, Image } from '@tarojs/components';
import './index.scss';
import { version } from '../../../config/wavelength';
import LoginBtn from '../../../components/loginBtn';
import { IState } from './interface';
import { AtButton } from 'taro-ui';

export default class Index extends Component<any, IState> {
  config: Config = {
    navigationBarTitleText: '电波同步',
  };

  constructor() {
    super();
    this.state = {};
  }

  onShareAppMessage() {
    return {
      title: '快来体验新作品，电波同步！',
      path: `/pages/WaveLength/home/index`,
      imageUrl: 'https://cdn.renwuming.cn/static/wavelength/imgs/share.jpg',
    };
  }

  componentDidHide() {}
  componentWillUnmount() {}
  componentDidShow() {}

  async createGame() {
    Taro.navigateTo({
      url: `/pages/WaveLength/createPage/index`,
    });
  }
  gotoHall() {
    Taro.navigateTo({
      url: `/pages/WaveLength/hall/index`,
    });
  }
  gotoAchievement() {
    Taro.navigateTo({
      url: `/pages/WaveLength/achievement/index`,
    });
  }
  gotoHome() {
    Taro.reLaunch({
      url: `/pages/home/index`,
    });
  }

  render() {
    const {} = this.state;

    return (
      <View className="container">
        <Image
          className="logo"
          mode="scaleToFill"
          src="https://cdn.renwuming.cn/static/wavelength/imgs/cover.png"
        />
        <Text className="version">{version}</Text>
        <View className="menu">
          <LoginBtn
            text="创建房间"
            className="menu-btn"
            callback={() => {
              this.createGame();
            }}
          />
          <AtButton
            className="menu-btn primary"
            circle
            type="primary"
            size="normal"
            onClick={() => {
              this.gotoHall();
            }}
          >
            房间大厅
          </AtButton>
          <AtButton
            className="menu-btn primary"
            circle
            type="primary"
            size="normal"
            onClick={() => {
              this.gotoAchievement();
            }}
          >
            历史·成就
          </AtButton>
          <AtButton
            className="menu-btn secondary"
            circle
            type="primary"
            size="normal"
            onClick={() => {
              this.gotoHome();
            }}
          >
            <Image src="https://cdn.renwuming.cn/static/jmz/icon.jpg"></Image>
            截码战
          </AtButton>
        </View>
        <View
          style={{
            flexGrow: 1,
          }}
        ></View>
        <View className="statement">
          <Text className="top">
            {
              '■ 本小程序为桌游《WaveLength》的线上体验版本，仅供您线上免费试玩。如果您感觉不错，请购买正版桌游，享受《WaveLength》的快乐。'
            }
          </Text>
          <Text className="bottom">
            {
              '■ 欢迎您添加微信 ren-wuming，加入玩家交流群，和五湖四海的桌游爱好者共同交流心得体会，并提出宝贵的建议。'
            }
          </Text>
        </View>
      </View>
    );
  }
}
