import Taro, { Component, Config } from '@tarojs/taro';
import { View, Text, ScrollView } from '@tarojs/components';
import {
  AtAvatar,
  AtSegmentedControl,
  AtDivider,
  AtFab,
  AtBadge,
  AtTag,
} from 'taro-ui';
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

interface IState {
  roomList: Array<Object>;
  historyList: Array<Object>;
  tabIndex: Number;
}

export default class Index extends Component<IState, any> {
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
    hallTimeRange: '',
  };
  config: Config = {
    navigationBarTitleText: '我的房间',
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
      url: `/rooms/v3/list/${this.page2}`,
    })
      .then((res) => {
        const { roomList } = this.state;
        this.setState({
          roomList: roomList.concat(res),
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
      url: `/rooms/hall/list/${this.page1}`,
    })
      .then((res) => {
        let { list, hallTimeRange } = res;
        const mode = Taro.getStorageSync('mode');
        const { hallList } = this.state;
        // 非游戏模式下，只显示自己的房间
        if (mode !== 'game') {
          list = list.filter((item) => item.inRoom);
        }
        this.setState({
          hallList: hallList.concat(list),
          hallTimeRange,
        });
        if (list.length < 10) {
          this.setState({
            end1: true,
          });
        }
      })
      .then(() => {
        this.loading = false;
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
  createRoom() {
    Taro.navigateTo({
      url: `/pages/createRoom/index`,
    });
  }

  render() {
    const {
      roomList,
      hallList,
      tabIndex,
      end1,
      end2,
      hallTimeRange,
    } = this.state;
    // 玩家是否有过历史游戏，用于判断是否要进行创建房间提示
    const history = Taro.getStorageSync('history');
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
              const {
                userList,
                _id,
                activeGame,
                timeStamp,
                ownRoom,
                userOnlineStatus,
              } = data;
              const list = (userList as Array<User>).slice(0, 4);
              const timeStr = Dayjs(timeStamp).format('HH:mm');
              const ownerActive = userOnlineStatus[0];
              return (
                <View
                  key={_id}
                  className="row"
                  onClick={() => {
                    this.enterRoom(_id);
                  }}
                >
                  <Text className="index">{index + 1}</Text>
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
                  <View className="column-right">
                    {ownRoom ? (
                      <AtTag className={'room-own'} size="small" circle>
                        我是房主
                      </AtTag>
                    ) : (
                      !activeGame &&
                      (ownerActive ? (
                        <AtTag className={'room-online'} size="small" circle>
                          房主在线
                        </AtTag>
                      ) : (
                        <View className="column-right">
                          <Text className="time-status">上次在线</Text>
                          <Text className="time-status">{timeStr}</Text>
                        </View>
                      ))
                    )}
                    {activeGame ? (
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
                content={`只显示最近${hallTimeRange}的活跃房间`}
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
              const {
                userList,
                _id,
                teams,
                observe,
                ownRoom,
                timeStamp,
                userOnlineStatus,
              } = data;
              const list = (userList as Array<User>).slice(0, 4);
              const timeStr = Dayjs(timeStamp).format('HH:mm');
              const ownerActive = userOnlineStatus && userOnlineStatus[0];
              return (
                <View
                  key={_id}
                  className="row"
                  onClick={() => {
                    if (teams) {
                      this.enterGame2(_id);
                    } else {
                      this.enterRoom(_id);
                    }
                  }}
                >
                  <Text className="index">{index + 1}</Text>
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

                  <View className="column-right">
                    {ownRoom ? (
                      <AtTag className={'room-own'} size="small" circle>
                        我是房主
                      </AtTag>
                    ) : (
                      !teams &&
                      !observe &&
                      (ownerActive ? (
                        <AtTag className={'room-online'} size="small" circle>
                          房主在线
                        </AtTag>
                      ) : (
                        <View className="column-right">
                          <Text className="time-status">上次在线</Text>
                          <Text className="time-status">{timeStr}</Text>
                        </View>
                      ))
                    )}
                    {teams ? (
                      <Text className="room-status gaming">进行中</Text>
                    ) : observe ? (
                      <Text className="room-status gaming">旁观中</Text>
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
              this.createRoom();
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
