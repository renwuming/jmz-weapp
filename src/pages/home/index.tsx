import Taro, { Component } from '@tarojs/taro';
import { View, Image, OpenData, Text } from '@tarojs/components';
import LoginBtn from '../../components/loginBtn';
import { AtButton, AtBadge } from 'taro-ui';
import './index.scss';
import { request, validate } from '../../api';
import GameDataView from '../../components/GameDataView';
import { version } from '../../config';

interface IProps {
  text: string;
  index: number;
}

export default class Index extends Component<IProps, any> {
  static defaultProps = {
    text: '',
    index: 0,
  };

  componentDidShow() {
    validate().then((res) => {
      const { mode, onlineMatch } = res;
      this.setState({
        mode,
        onlineMatch,
      });
    });
  }

  onShareAppMessage() {
    return {
      title: '截码战，最佳的聚会活动！',
      path: `/pages/home/index`,
      imageUrl: 'http://cdn.renwuming.cn/static/jmz/share.jpg',
    };
  }

  randomRoom() {
    Taro.navigateTo({
      url: `/pages/onlineMatch/index`,
    });
  }

  gotoGameList() {
    Taro.navigateTo({
      url: '/pages/gamelist/index',
    });
  }

  gotoAbout() {
    Taro.navigateTo({
      url: '/pages/about/index',
    });
  }

  gotoGroup() {
    Taro.navigateTo({
      url: `/pages/imglist/index?type=group`,
    });
  }

  openGbts() {
    Taro.navigateToMiniProgram({
      appId: 'wx78bc21b55d1cc0c5',
    });
  }

  gotoHall() {
    Taro.navigateTo({
      url: `/pages/hall/index`,
    });
  }

  gotoWaveLength() {
    Taro.reLaunch({
      url: `/pages/WaveLength/home/index`,
    });
  }

  gotoRanking() {
    Taro.navigateTo({
      url: `/pages/ranking/index`,
    });
  }

  render() {
    // const { mode } = this.state;
    return (
      <View className="container">
        <Image
          className="logo"
          mode="scaleToFill"
          src="http://cdn.renwuming.cn/static/jmz/logo.png"
        />
        <Text className="version">{version}</Text>
        <View className="menu">
          <View className="user-info">
            <GameDataView></GameDataView>
          </View>
          {/* {mode === 'game' && (
            <AtBadge value={onlineMatch && '正在进行'}>
              <LoginBtn
                text="快速开始"
                className="menu-btn strong"
                callback={() => {
                  this.randomRoom()
                }}
              />
            </AtBadge>
          )} */}
          <LoginBtn
            text="房间大厅"
            className="menu-btn"
            callback={() => {
              this.gotoHall();
            }}
          />
          <LoginBtn
            text="排行榜"
            className="menu-btn"
            callback={() => {
              this.gotoRanking();
            }}
          />
          <LoginBtn
            text="历史·成就"
            className="menu-btn"
            callback={() => {
              this.gotoGameList();
            }}
          />
          <AtButton
            className="menu-btn secondary"
            circle
            type="primary"
            size="normal"
            onClick={() => {
              this.gotoAbout();
            }}
          >
            更多
          </AtButton>
          <AtButton
            className="menu-btn secondary"
            circle
            type="primary"
            size="normal"
            onClick={() => {
              this.gotoGroup();
            }}
          >
            加群交流
          </AtButton>
          <AtButton
            className="menu-btn secondary"
            circle
            type="primary"
            size="normal"
            onClick={() => {
              this.gotoWaveLength();
            }}
          >
            <Image src="https://cdn.renwuming.cn/static/wavelength/imgs/icon.png"></Image>
            电波同步
          </AtButton>
          <AtButton
            className="menu-btn secondary"
            circle
            type="primary"
            size="normal"
            onClick={() => {
              this.openGbts();
            }}
          >
            <Image src="https://cdn.renwuming.cn/static/escape/icon.jpg"></Image>
            古堡逃亡
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
              '■ 本小程序为桌游《Decrypto》的线上体验版本，仅供您线上免费试玩。如果您感觉不错，请购买正版桌游，享受《Decrypto》的快乐。'
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
