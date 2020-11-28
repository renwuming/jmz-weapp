import Taro, { Component, Config } from '@tarojs/taro';
import { View, Text, ScrollView } from '@tarojs/components';
import { AtAvatar, AtSegmentedControl, AtDivider } from 'taro-ui';
import './index.scss';
import { request } from '../../../api/wavelength';
import Dayjs from 'dayjs';

export default class Index extends Component<any, any> {
  // 分页数
  page2 = 0;
  // 是否已出初始化
  init = false;
  loading = true;

  state = {
    achievement: {},
    historyList: [],
    tabIndex: 0,
    end2: false,
  };

  config: Config = {
    navigationBarTitleText: '电波同步',
  };

  componentDidShow() {
    if (!this.init) {
      this.updateData2();
      this.updateAchievement();
      this.init = true;
    }
  }

  async updateAchievement() {
    const achievement = await request({
      method: 'GET',
      url: `/games/achievement/self`,
    });
    this.setState({
      achievement,
    });
  }

  updateData2() {
    request({
      method: 'GET',
      url: `/games?start=${this.page2 * 10}&type=history`,
    })
      .then((res) => {
        const { games } = res;
        const { historyList } = this.state;
        this.setState({
          historyList: historyList.concat(games),
        });
        if (games.length < 10) {
          this.setState({
            end2: true,
          });
        }
      })
      .then(() => {
        this.loading = false;
      });
  }

  enterGame(id) {
    Taro.navigateTo({
      url: `/pages/WaveLength/game/index?id=${id}`,
    });
  }

  changeTab(index) {
    this.setState({
      tabIndex: index,
    });
  }

  // 加载更多
  updateMore(index) {
    if (this.loading) return;
    this.loading = true;
    const { end2 } = this.state;
    if (index === 0 && !end2) {
      this.page2++;
      this.updateData2();
    }
  }

  render() {
    const { historyList, tabIndex, end2, achievement } = this.state;
    const { winRate, gameSum, winSum, drawSum } = achievement as any;
    return (
      <View className="container">
        <View className="tabs">
          <AtSegmentedControl
            values={['历史记录', '我的成就']}
            onClick={(index) => {
              this.changeTab(index);
            }}
            current={tabIndex}
          />
        </View>
        {tabIndex === 1 && (
          <View className="achievement-box">
            <View className="detail-row">
              <Text className="left win-rate">胜率</Text>
              <Text className="win-rate">{winRate}</Text>
            </View>
            <View className="detail-row">
              <Text className="left">胜利局数</Text>
              <Text className="info">{winSum}</Text>
            </View>
            <View className="detail-row">
              <Text className="left">平局数</Text>
              <Text className="info">{drawSum}</Text>
            </View>
            <View className="detail-row">
              <Text className="left">总局数</Text>
              <Text className="info">{gameSum}</Text>
            </View>
          </View>
        )}
        {tabIndex === 0 && (
          <ScrollView
            scrollY={true}
            enableBackToTop={true}
            onScrollToLower={() => {
              this.updateMore(tabIndex);
            }}
          >
            {historyList.map((game, index) => {
              const { _id, players, updatedAt, result } = game;
              const list = (players as any[]).slice(0, 4);
              const resultClass =
                result === '胜利' ? 'success' : result === '失败' ? 'fail' : '';
              const date = Dayjs(updatedAt).format('MM/DD');
              return (
                <View
                  className="row"
                  onClick={() => {
                    this.enterGame(_id);
                  }}
                >
                  <Text className="index">{index + 1}</Text>
                  <View className="column">
                    <Text className={`status ${resultClass}`}>{result}</Text>
                    <View className="avatar-box">
                      {list.map((user) => (
                        <AtAvatar
                          className="avatar"
                          circle
                          image={user.userInfo.avatarUrl}
                        ></AtAvatar>
                      ))}
                    </View>
                  </View>
                  <Text className="status date">{date}</Text>
                </View>
              );
            })}
            {end2 ? (
              <AtDivider
                className={historyList.length > 0 ? '' : 'middle'}
                content="没有更多了"
                fontColor="#999"
                lineColor="#ccc"
              />
            ) : (
              <View className="at-icon at-icon-loading-3 loading-box"></View>
            )}
          </ScrollView>
        )}
      </View>
    );
  }
}
