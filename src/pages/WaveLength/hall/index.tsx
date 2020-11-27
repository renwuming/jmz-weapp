import Taro, { Component, Config } from '@tarojs/taro';
import { View, Text, ScrollView } from '@tarojs/components';
import {
  AtAvatar,
  AtSegmentedControl,
  AtDivider,
  AtFab,
  AtBadge,
} from 'taro-ui';
import './index.scss';
import { request } from '../../../api/wavelength';
import Dayjs from 'dayjs';

interface IState {
  roomList: Array<Object>;
  historyList: Array<Object>;
  tabIndex: Number;
  text: string;
}

export default class Index extends Component<IState, any> {
  config: Config = {
    navigationBarTitleText: '电波同步',
  };
  // 分页数
  page1 = 0;
  page2 = 0;
  // 是否已出初始化
  init = false;
  loading = true;

  state = {
    roomList: [],
    hallList: [],
    tabIndex: 0,
    end1: false,
    end2: false,
    text: '',
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
      url: `/games?start=${this.page2 * 10}&type=mine`,
    })
      .then((res) => {
        const { games } = res;
        const { roomList } = this.state;
        this.setState({
          roomList: roomList.concat(games),
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
  updateData1() {
    request({
      method: 'GET',
      url: `/games?start=${this.page1 * 10}&type=hall`,
    })
      .then((res) => {
        let { games, text } = res;
        const { hallList } = this.state;
        this.setState({
          hallList: hallList.concat(games),
          text,
        });
        if (games.length < 10) {
          this.setState({
            end1: true,
          });
        }
      })
      .then(() => {
        this.loading = false;
      });
  }

  gotoGame(id) {
    Taro.navigateTo({
      url: `/pages/WaveLength/game/index?id=${id}`,
    });
  }

  changeTab(index) {
    this.setState({
      tabIndex: index,
    });
  }

  reloadHall() {
    this.page1 = 0;
    this.page2 = 0;
    this.setState({
      hallList: [],
      roomList: [],
      end1: false,
      end2: false,
    });
    this.updateData1();
    this.updateData2();
  }

  // 加载更多
  updateMore(index) {
    if (this.loading) return;
    this.loading = true;
    const { end1, end2 } = this.state;
    if (index === 0 && !end1) {
      this.page1++;
      this.updateData1();
    } else if (index === 1 && !end2) {
      this.page2++;
      this.updateData2();
    } else {
      this.loading = false;
    }
  }

  // 创建房间
  async createGame() {
    const { id } = await request({
      method: 'POST',
      url: '/games',
    });

    Taro.navigateTo({
      url: `/pages/WaveLength/game/index?id=${id}`,
    });
  }

  render() {
    const { roomList, hallList, tabIndex, end1, end2, text } = this.state;
    // 玩家是否有过历史游戏，用于判断是否要进行创建房间提示
    const history = false;
    return (
      <View className="container">
        <View className="tabs">
          <AtSegmentedControl
            values={['大厅', '我的房间']}
            onClick={(index) => {
              this.changeTab(index);
            }}
            current={tabIndex}
          />
        </View>
        {tabIndex === 0 && (
          <ScrollView
            scrollY={true}
            enableBackToTop={true}
            onScrollToLower={() => {
              this.updateMore(tabIndex);
            }}
          >
            {hallList.map((data, index) => {
              const { _id, players, updatedAt, start } = data;
              const list = (players as any[]).slice(0, 4);
              const timeStr = Dayjs(updatedAt).format('HH:mm');
              return (
                <View
                  key={_id}
                  className="row"
                  onClick={() => {
                    this.gotoGame(_id);
                  }}
                >
                  <Text className="index">{index + 1}</Text>
                  <View className="avatar-box">
                    {list.map((user) => (
                      <AtAvatar
                        className="avatar"
                        circle
                        image={user.userInfo.avatarUrl}
                      ></AtAvatar>
                    ))}
                  </View>
                  <View className="column-right">
                    <View className="column-right">
                      <Text className="time-status">上次在线</Text>
                      <Text className="time-status">{timeStr}</Text>
                    </View>
                    {start ? (
                      <Text className="room-status gaming">进行中</Text>
                    ) : (
                      <Text className="room-status">未开始</Text>
                    )}
                  </View>
                </View>
              );
            })}
            {end1 ? (
              <AtDivider
                className={hallList.length > 0 ? '' : 'middle'}
                content={text}
                fontColor="#999"
                lineColor="#ccc"
              />
            ) : (
              <View className="at-icon at-icon-loading-3 loading-box"></View>
            )}
          </ScrollView>
        )}
        {tabIndex === 1 && (
          <ScrollView
            scrollY={true}
            enableBackToTop={true}
            onScrollToLower={() => {
              this.updateMore(tabIndex);
            }}
          >
            {roomList.map((data, index) => {
              const { _id, players, updatedAt, start } = data;
              const list = (players as any[]).slice(0, 4);
              const timeStr = Dayjs(updatedAt).format('HH:mm');
              return (
                <View
                  key={_id}
                  className="row"
                  onClick={() => {
                    this.gotoGame(_id);
                  }}
                >
                  <Text className="index">{index + 1}</Text>
                  <View className="avatar-box">
                    {list.map((user) => (
                      <AtAvatar
                        className="avatar"
                        circle
                        image={user.userInfo.avatarUrl}
                      ></AtAvatar>
                    ))}
                  </View>
                  <View className="column-right">
                    <View className="column-right">
                      <Text className="time-status">上次在线</Text>
                      <Text className="time-status">{timeStr}</Text>
                    </View>
                    {start ? (
                      <Text className="room-status gaming">进行中</Text>
                    ) : (
                      <Text className="room-status">未开始</Text>
                    )}
                  </View>
                </View>
              );
            })}
            {end2 ? (
              <AtDivider
                className={roomList.length > 0 ? '' : 'middle'}
                content="没有更多了"
                fontColor="#999"
                lineColor="#ccc"
              />
            ) : (
              <View className="at-icon at-icon-loading-3 loading-box"></View>
            )}
          </ScrollView>
        )}

        <View className="fab-btn create-room">
          <AtFab
            onClick={() => {
              this.createGame();
            }}
          >
            {history ? (
              <Text className="at-fab__icon at-icon at-icon-add"></Text>
            ) : (
              <AtBadge className="shake" value={'点我创建房间'}>
                <Text className="at-fab__icon at-icon at-icon-add"></Text>
              </AtBadge>
            )}
          </AtFab>
        </View>
        <View className="fab-btn reload">
          <AtFab
            onClick={() => {
              this.reloadHall();
            }}
          >
            <Text className="at-fab__icon at-icon at-icon-reload"></Text>
          </AtFab>
        </View>
      </View>
    );
  }
}
