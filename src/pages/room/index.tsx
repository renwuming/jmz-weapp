import Taro, { Component } from '@tarojs/taro';
import { View, Text } from '@tarojs/components';
import {
  AtModal,
  AtButton,
  AtSwitch,
  AtBadge,
  AtIcon,
  AtTag,
  AtActionSheet,
  AtActionSheetItem,
  AtFab,
  AtAvatar,
} from 'taro-ui';
import './index.scss';
import { request } from '../../api';
import { connectWs, getData, listeningWs } from '../../api/websocket';
import LoginBtn from '../../components/loginBtn';
import FormIdBtn from '../../components/FormIdBtn';
import UserItem from '../../components/UserItem';
import moment from 'moment';

let updateTimer;

interface IState {
  id: string;
  userList: Array<any>;
  ownRoom: boolean;
  inRoom: boolean;
  inGame: boolean;
  activeGame: string;
  random: boolean;
  timer: boolean;
  publicStatus: boolean;
  over: boolean;
  isOpened: boolean;
  OpenThreeModeModal: boolean;
  userOnlineStatus: string[];
  openHandlePlayerAction: boolean;
  handlePlayer: any;
  ownerQuitGame: boolean; // 房主是否参与游戏
  tags: any[];
  roomMode: any;
  teamMode: boolean; // 是否为团队模式
  gameHistory: any[]; // 游戏历史记录
  openHandleHistory: boolean;
}

export default class Index extends Component<any, IState> {
  forbidAutoNavigate = false;
  navigateTimer: any;
  changeStatusTime: number = 0;
  requestTimes: number;

  state = {
    id: '',
    userList: [],
    ownRoom: false,
    inRoom: false,
    inGame: false,
    activeGame: '',
    random: true,
    timer: true,
    publicStatus: false,
    over: false,
    isOpened: false,
    OpenThreeModeModal: false,
    userOnlineStatus: [],
    openHandlePlayerAction: false,
    handlePlayer: {},
    ownerQuitGame: false, // 房主是否参与游戏
    tags: [],
    roomMode: {},
    teamMode: false, // 是否为团队模式
    gameHistory: [], // 游戏历史记录
    openHandleHistory: false,
  };

  onShareAppMessage() {
    const { id } = this.$router.params;
    return {
      title: '房间已开好，快来加入吧~',
      path: `/pages/room/index?id=${id}`,
    };
  }

  componentDidHide() {
    clearInterval(updateTimer);
    this.handleCancel();
  }
  componentWillUnmount() {
    clearInterval(updateTimer);
    this.handleCancel();
  }

  componentDidShow() {
    clearInterval(updateTimer);
    updateTimer = setInterval(() => {
      this.updateRoomData();
    }, 1000);

    connectWs();

    this.requestTimes = 0;
    listeningWs((res) => {
      const { data } = res;
      this.updateDataToView(JSON.parse(data));
    });
    this.updateRoomData();
  }

  updateDataToView(data) {
    this.requestTimes++;
    const { id } = this.$router.params;
    // 若服务端报错
    if (data.code && this.requestTimes > 2) {
      this.setState({
        id: '',
      });
      clearInterval(updateTimer);
      Taro.showToast({
        title: data.message,
        icon: 'none',
        duration: 3000,
      });
    }
    // 只更新正确id的数据
    if (data.id !== id) {
      return;
    }
    // 更新除了status之外的数据
    const { publicStatus, random, timer, ...otherData } = data;
    // 处理 userList，房主可能不在里面
    const {
      owner,
      ownerQuitGame,
      userList,
      userOnlineStatus,
      activeGame,
      over,
    } = data;
    const playerList = ownerQuitGame
      ? userList.filter((e) => e.id !== owner)
      : userList;
    const ownerData = userList.find((data, index) => {
      if (data.id === owner) {
        data.index = index;
        return true;
      }
      return false;
    });
    if (ownerQuitGame) {
      const ownerOnlineStatus = userOnlineStatus.splice(ownerData.index, 1);
      ownerData.online = activeGame ? undefined : ownerOnlineStatus;
    }
    this.setState({ ...otherData, userList: playerList, ownerData });
    // status数据的更新，要进行防抖
    const current = new Date().getTime();
    if (current > this.changeStatusTime + 2000) {
      this.setState({
        publicStatus,
        random,
        timer,
      });
    }
    // 若已开始，则跳转
    if (activeGame && !over && !this.forbidAutoNavigate) {
      this.forbidAutoNavigate = true;
      this.setState({
        isOpened: true,
      });
      // 保证弹出提示框
      wx.nextTick(() => {
        if (this.state.isOpened) {
          this.navigateTimer = setTimeout(() => {
            this.gotoGame(activeGame);
          }, 2000);
        }
      });
    }
  }

  updateRoomData() {
    const { id } = this.$router.params;
    // 通过websocket获取游戏数据
    getData(`room-${id}`);
  }

  gotoGame(id = null) {
    const { activeGame } = this.state;
    Taro.reLaunch({
      url: `/pages/game/index?id=${id ? id : activeGame}`,
    });
  }

  startGame() {
    const { id } = this.$router.params;
    request({
      method: 'POST',
      url: `/rooms/v2/wx/${id}/start`,
    }).then((data) => {
      if (data.id) {
        const gameID = data.id;
        this.gotoGame(gameID);
      }
    });
  }

  joinRoom() {
    const { id } = this.$router.params;
    request({
      method: 'POST',
      url: `/rooms/${id}`,
    }).then((data) => {
      if (!data) {
        Taro.showToast({
          title: '加入房间成功',
          icon: 'success',
          duration: 1000,
        });
        this.updateRoomData();
      }
    });
  }

  quitRoom() {
    const { id } = this.$router.params;
    const { ownRoom } = this.state;
    request({
      method: 'POST',
      url: `/rooms/${id}/quit`,
    }).then((data) => {
      const title = ownRoom ? '解散房间成功' : '退出房间成功';
      if (!data) {
        Taro.showToast({
          title,
          icon: 'success',
          duration: 1000,
        });
        Taro.navigateBack();
      }
    });
  }

  gotoHome() {
    Taro.reLaunch({
      url: '/pages/home/index',
    });
  }

  handlePlayerAction(value) {
    this.setState({
      openHandlePlayerAction: value,
    });
  }

  handleHistoryAction(value) {
    this.setState({
      openHandleHistory: value,
    });
  }

  handlePlayer(index) {
    const { userList } = this.state;
    this.setState({
      handlePlayer: { ...(userList[index] as any), index },
    });
  }

  // 将玩家置顶
  stick(index) {
    const { id } = this.$router.params;
    const { userList } = this.state;
    const player = userList[index];
    request({
      method: 'POST',
      url: `/rooms/${id}/edituserlist/${player.id}`,
    }).then((data) => {
      if (!data) {
        this.updateRoomData();
      }
    });
  }

  // 踢出玩家
  kickout(index) {
    const { id } = this.$router.params;
    const { userList } = this.state;
    const player = userList[index];
    request({
      method: 'POST',
      url: `/rooms/${id}/edituserlist/delete/${player.id}`,
    }).then((data) => {
      if (!data) {
        this.updateRoomData();
      }
    });
  }

  // 取消跳转到游戏
  handleCancel() {
    clearTimeout(this.navigateTimer);
    this.setState({
      isOpened: false,
    });
  }

  handleOwnerInGame(ownerQuitGame) {
    const { id } = this.$router.params;
    request({
      method: 'POST',
      url: `/rooms/${id}/ownerQuitGame`,
      data: {
        ownerQuitGame,
      },
    });
  }

  render() {
    const {
      id,
      userList,
      ownRoom,
      inRoom,
      inGame,
      activeGame,
      over,
      isOpened,
      OpenThreeModeModal,
      userOnlineStatus,
      random, // 是否随机组队
      openHandlePlayerAction,
      handlePlayer,
      ownerQuitGame, // 房主是否参与游戏
      tags,
      roomMode,
      teamMode, // 是否为团队模式
      gameHistory, // 游戏历史记录
      openHandleHistory,
      owner,
      ownerData,
      specialRules,
    } = this.state;

    const { singleWord } = specialRules || {};
    return id ? (
      <View className="container">
        <Text className={roomMode.red ? 'title red' : 'title'}>
          {roomMode.text}
        </Text>
        <View className="status-row">
          {tags.map((tag) => {
            const { text, red } = tag;
            return (
              <AtTag className={red ? 'red' : ''} type="primary" circle>
                {text}
              </AtTag>
            );
          })}
          {singleWord && (
            <AtTag className="yellow" type="primary" circle>
              单字规则
            </AtTag>
          )}
        </View>

        {ownerQuitGame && (
          <View
            style={{
              display: 'flex',
              justifyContent: 'center',
              marginBottom: '30px',
            }}
          >
            <AtBadge value={'房主'}>
              <UserItem
                nonick={true}
                big={true}
                data={{
                  id,
                  ...(ownerData.userInfo as any),
                  online: ownerData.online,
                }}
              ></UserItem>
            </AtBadge>
          </View>
        )}

        {userList &&
          userList.map((user, index) => {
            const { userInfo, id } = user;
            const { nickName } = userInfo;
            let online;
            if (!activeGame) {
              online = userOnlineStatus[index];
            }
            const _index = index + 1;
            const isOwner = owner === id;
            const teamL = Math.ceil(userList.length / 2);
            return (
              <View
                className={`row ${
                  (teamMode && index === 9) || (!teamMode && index === 3)
                    ? 'division'
                    : ''
                } ${
                  !teamMode && !random && index <= 3
                    ? `team${Math.floor(index / 2)}`
                    : ''
                } ${
                  teamMode && !random && index <= 9
                    ? `team${Math.floor(index / teamL)}`
                    : ''
                }
                `}
              >
                <Text
                  className={`index ${
                    (teamMode && index < 10) || index < 4 ? 'inGame' : ''
                  }`}
                >
                  {_index}
                </Text>
                <Text className="nick">{nickName}</Text>
                {isOwner ? (
                  <AtBadge value={'房主'}>
                    <UserItem
                      nonick={true}
                      big={true}
                      data={{
                        id,
                        ...(userInfo as any),
                        online,
                      }}
                    ></UserItem>
                  </AtBadge>
                ) : (
                  <UserItem
                    nonick={true}
                    big={true}
                    data={{
                      id,
                      ...(userInfo as any),
                      online,
                    }}
                  ></UserItem>
                )}
                {ownRoom && (
                  <AtIcon
                    onClick={() => {
                      this.handlePlayerAction(true);
                      this.handlePlayer(index);
                    }}
                    value="settings"
                    size="20"
                    color="#009966"
                  ></AtIcon>
                )}
              </View>
            );
          })}
        <View className="btn-list">
          {ownRoom && !activeGame && (
            <View>
              <AtSwitch
                title="房主不参与游戏"
                className="red-switch"
                color="#e6504b"
                border={false}
                checked={ownerQuitGame}
                onChange={() => {
                  this.handleOwnerInGame(!ownerQuitGame);
                }}
              />
              <AtButton
                className="menu-btn"
                circle
                type="primary"
                size="normal"
                onClick={() => {
                  if (userList.length === 3) {
                    this.setState({
                      OpenThreeModeModal: true,
                    });
                  } else {
                    this.startGame();
                  }
                }}
              >
                开始
              </AtButton>
            </View>
          )}
          {!!activeGame && (
            <FormIdBtn
              text={over ? '回顾' : inGame ? '继续' : '旁观'}
              onClick={() => {
                this.gotoGame();
              }}
            ></FormIdBtn>
          )}
          {!inRoom && (
            <LoginBtn
              text={'加入房间'}
              className={'menu-btn'}
              callback={() => {
                this.joinRoom();
              }}
            />
          )}
          {inRoom && (ownRoom || !(inGame && activeGame)) && (
            <AtButton
              className="menu-btn error-btn"
              circle
              type="primary"
              size="normal"
              onClick={() => {
                this.quitRoom();
              }}
            >
              {ownRoom ? '解散房间' : '退出房间'}
            </AtButton>
          )}
        </View>
        <AtModal
          className="game-tip"
          isOpened={isOpened}
          cancelText="取消"
          closeOnClickOverlay={false}
          onCancel={() => {
            this.handleCancel();
          }}
          content="即将跳转到正在进行的..."
        />
        <AtModal
          className="game-tip"
          isOpened={OpenThreeModeModal}
          confirmText="确定"
          closeOnClickOverlay
          onConfirm={() => {
            this.startGame();
          }}
          onClose={() => {
            this.setState({
              OpenThreeModeModal: false,
            });
          }}
          content="开始三人游戏？"
        />

        <AtActionSheet
          isOpened={openHandlePlayerAction}
          cancelText="取消"
          title={handlePlayer.userInfo && handlePlayer.userInfo.nickName}
          onCancel={() => {
            this.handlePlayerAction(false);
          }}
          onClose={() => {
            this.handlePlayerAction(false);
          }}
        >
          <AtActionSheetItem
            onClick={() => {
              this.stick(handlePlayer.index);
              this.handlePlayerAction(false);
            }}
          >
            移到顶部
          </AtActionSheetItem>
          {owner !== handlePlayer.id && (
            <AtActionSheetItem
              onClick={() => {
                this.kickout(handlePlayer.index);
                this.handlePlayerAction(false);
              }}
            >
              踢出
            </AtActionSheetItem>
          )}
        </AtActionSheet>

        <AtActionSheet
          isOpened={openHandleHistory}
          title="游戏历史"
          onClose={() => {
            this.handleHistoryAction(false);
          }}
        >
          {gameHistory.map((game) => {
            const { _id, userList, timeStamp } = game;
            const time = moment(timeStamp).format('MM/DD HH:mm');
            return (
              <AtActionSheetItem
                onClick={() => {
                  this.gotoGame(_id);
                  this.handleHistoryAction(false);
                }}
              >
                <View className="game-history-item">
                  <Text className="time-text">{time}</Text>
                  <View className="avatar-box">
                    {(userList as Array<any>).map((user) =>
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
              </AtActionSheetItem>
            );
          })}
        </AtActionSheet>

        {gameHistory.length > 0 && (
          <View className="history-btn">
            <AtFab
              onClick={() => {
                this.handleHistoryAction(true);
              }}
              size="small"
            >
              游戏历史
            </AtFab>
          </View>
        )}
        <View className="invite-btn">
          <AtFab size="small">
            <AtButton size="normal" openType="share">
              邀请朋友
            </AtButton>
          </AtFab>
        </View>
        <View className="home-btn">
          <AtFab
            onClick={() => {
              this.gotoHome();
            }}
            size="small"
          >
            回首页
          </AtFab>
        </View>
      </View>
    ) : (
      <View className="container">
        <View className="home-btn">
          <AtFab
            onClick={() => {
              this.gotoHome();
            }}
            size="small"
          >
            回首页
          </AtFab>
        </View>
      </View>
    );
  }
}
