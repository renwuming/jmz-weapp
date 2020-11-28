import Taro, { Component, Config } from '@tarojs/taro';
import { View, Text, ScrollView } from '@tarojs/components';
import { AtAvatar, AtSegmentedControl, AtDivider } from 'taro-ui';
import './index.scss';
import { request } from '../../api';
import Dayjs from 'dayjs';

interface UserInfo {
  nickName: string;
  avatarUrl: string;
}

interface User {
  userInfo: UserInfo;
}

export default class Index extends Component<any, any> {
  // 分页数
  page2 = 0;
  // 是否已出初始化
  init = false;
  loading = true;

  state = {
    userDetail: {},
    historyList: [],
    tabIndex: 0,
    end2: false,
  };
  config: Config = {
    navigationBarTitleText: '历史·成就',
  };

  componentDidShow() {
    if (!this.init) {
      this.updateData1();
      this.updateData2();
      this.init = true;
    }
  }

  updateData2() {
    request({
      method: 'GET',
      url: `/users/v2/history/games/${this.page2}`,
    })
      .then((res) => {
        const { historyList } = this.state;
        this.setState({
          historyList: historyList.concat(res),
        });
        if (res.length < 10) {
          this.setState({
            end2: true,
          });
        }
      })
      .then(() => {
        this.loading = false;
      });
  }
  updateData1() {
    request({
      method: 'GET',
      url: `/users/gamedata/self`,
    }).then((res) => {
      this.setState({
        userDetail: res,
      });
    });
  }

  enterGame(id) {
    Taro.navigateTo({
      url: `/pages/game/index?id=${id}`,
    });
  }

  enterGame2(id) {
    Taro.reLaunch({
      url: `/pages/game/index?id=${id}`,
    });
  }

  enterRoom(id) {
    Taro.navigateTo({
      url: `/pages/room/index?id=${id}`,
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
    } else {
      this.loading = false;
    }
  }

  render() {
    const { historyList, tabIndex, end2, userDetail } = this.state;
    const { winRate, Sum, pingSum, winSum } = userDetail as any;
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
              <Text className="win-rate">
                {winRate || winRate === 0 ? winRate + '%' : ''}
              </Text>
            </View>
            <View className="detail-row">
              <Text className="left">胜利局数</Text>
              <Text className="info">{winSum}</Text>
            </View>
            <View className="detail-row">
              <Text className="left">平局数</Text>
              <Text className="info">{pingSum}</Text>
            </View>
            <View className="detail-row">
              <Text className="left">总局数</Text>
              <Text className="info">{Sum}</Text>
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
              const { userList, status, timeStamp } = game;
              const list = (userList as Array<User>).slice(0, 4);
              const statusClass =
                status === '胜利' ? 'success' : status === '失败' ? 'fail' : '';
              const date = Dayjs(timeStamp).format('MM/DD');
              return (
                <View
                  className="row"
                  onClick={() => {
                    this.enterGame((game as any)._id);
                  }}
                >
                  <Text className="index">{index + 1}</Text>
                  <View className="column">
                    <Text className={`status ${statusClass}`}>{status}</Text>
                    <View className="avatar-box">
                      {list.map((user) =>
                        user.userInfo ? (
                          <AtAvatar
                            className="avatar"
                            circle
                            image={user.userInfo.avatarUrl}
                          ></AtAvatar>
                        ) : (
                          ''
                        )
                      )}
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
