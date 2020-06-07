import Taro, { Component } from "@tarojs/taro";
import { View, Text } from "@tarojs/components";
import { AtModal, AtButton, AtSwitch, AtBadge, AtIcon, AtTag } from "taro-ui";
import "./index.scss";
import { request } from "../../api";
import { connectWs, getData, listeningWs } from "../../api/websocket";
import LoginBtn from "../../components/loginBtn";
import FormIdBtn from "../../components/FormIdBtn";
import UserItem from "../../components/UserItem";

let updateTimer;

interface IState {
  id: string;
  userList: Array<Object>;
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
}

export default class Index extends Component<any, IState> {
  forbidAutoNavigate = false;
  navigateTimer: any;
  changeStatusTime: number = 0;
  requestTimes: number;

  state = {
    id: "",
    userList: [],
    ownRoom: false,
    inRoom: false,
    inGame: false,
    activeGame: "",
    random: true,
    timer: true,
    publicStatus: false,
    over: false,
    isOpened: false,
    OpenThreeModeModal: false,
    userOnlineStatus: [],
  };

  onShareAppMessage() {
    const { id } = this.$router.params;
    return {
      title: "房间已开好，快来加入吧~",
      path: `/pages/room/index?id=${id}`,
    };
  }

  componentDidHide() {
    clearInterval(updateTimer);
  }
  componentWillUnmount() {
    clearInterval(updateTimer);
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
        id: "",
      });
      clearInterval(updateTimer);
      Taro.showToast({
        title: data.message,
        icon: "none",
        duration: 3000,
      });
    }
    // 只更新正确id的数据
    if (data.id !== id) {
      return;
    }
    // 更新除了status之外的数据
    const { publicStatus, random, timer, ...otherData } = data;
    this.setState(otherData);
    // status数据的更新，要进行防抖
    const current = new Date().getTime();
    if (current > this.changeStatusTime + 2000) {
      this.setState({
        publicStatus,
        random,
        timer,
      });
    }
    const { activeGame, over } = data;
    // 若已开始，则跳转
    if (activeGame && !over && !this.forbidAutoNavigate) {
      this.setState({
        isOpened: true,
      });
      // 保证弹出提示框
      wx.nextTick(() => {
        if (this.state.isOpened) {
          this.navigateTimer = setTimeout(() => {
            this.gotoGame(activeGame);
          }, 1500);
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
      method: "POST",
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
      method: "POST",
      url: `/rooms/${id}`,
    }).then((data) => {
      if (!data) {
        Taro.showToast({
          title: "加入房间成功",
          icon: "success",
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
      method: "POST",
      url: `/rooms/${id}/quit`,
    }).then((data) => {
      const title = ownRoom ? "解散房间成功" : "退出房间成功";
      if (!data) {
        Taro.showToast({
          title,
          icon: "success",
          duration: 1000,
        });
        Taro.navigateBack();
      }
    });
  }

  gotoHome() {
    Taro.reLaunch({
      url: "/pages/home/index",
    });
  }

  // 将玩家置顶
  stick(index) {
    const { id } = this.$router.params;
    request({
      method: "POST",
      url: `/rooms/${id}/edituserlist/${index}`,
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
    this.forbidAutoNavigate = true;
  }

  // 改变房间的公开状态
  changeRoomStatus(status) {
    this.changeStatusTime = new Date().getTime();
    const { id } = this.$router.params;
    request({
      method: "POST",
      url: `/rooms/${id}/status`,
      data: status,
    });
    this.setState(status);
  }

  handleOwnerInGame(ownerQuitGame) {
    const { id } = this.$router.params;
    request({
      method: "POST",
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
      ownerQuitGame, // 房主是否参与游戏
      tags,
      roomMode,
      teamMode, // 是否为团队模式
      over,
      isOpened,
      OpenThreeModeModal,
      userOnlineStatus,
      random, // 是否随机组队
    } = this.state;

    return id ? (
      <View className="container">
        <Text className={roomMode.red ? "title red" : "title"}>
          {roomMode.text}
        </Text>
        <View className="status-row">
          {tags.map((tag) => {
            const { text, red } = tag;
            return (
              <AtTag className={red ? "red" : ""} type="primary" circle>
                {text}
              </AtTag>
            );
          })}
        </View>
        {userList &&
          userList.map((user, index) => {
            const { userInfo, id } = user;
            const { nickName } = userInfo;
            let online;
            if (!activeGame) {
              online = userOnlineStatus[index];
            }
            const extraSeat = ownerQuitGame ? 1 : 0;
            const _index = index + 1 - extraSeat;

            const teamL = Math.ceil(userList.length / 2);
            return (
              <View
                className={`row ${
                  (teamMode && index === 9 + extraSeat) ||
                  (!teamMode && index === 3 + extraSeat)
                    ? "division"
                    : ""
                } ${
                  !teamMode && !random && index - extraSeat <= 3
                    ? `team${Math.floor((index - extraSeat) / 2)}`
                    : ""
                } ${
                  teamMode && !random && index - extraSeat <= 9
                    ? `team${Math.floor((index - extraSeat) / teamL)}`
                    : ""
                }
                `}
              >
                <Text
                  className={`index ${
                    (teamMode && index < 10 + extraSeat) ||
                    index < 4 + extraSeat
                      ? "inGame"
                      : ""
                  } ${_index === 0 ? "red" : ""}`}
                >
                  {_index ? _index : ""}
                </Text>
                <Text className="nick">{nickName}</Text>
                {index === 0 ? (
                  <AtBadge value={"房主"}>
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
                {ownRoom && index > 1 ? (
                  <AtIcon
                    onClick={() => {
                      this.stick(index);
                    }}
                    value="arrow-up"
                    size="20"
                    color="#009966"
                  ></AtIcon>
                ) : (
                  <AtIcon
                    className="hidden"
                    value="arrow-up"
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
              text={over ? "回顾" : inGame ? "继续" : "旁观"}
              onClick={() => {
                this.gotoGame();
              }}
            ></FormIdBtn>
          )}
          {!inRoom && (
            <LoginBtn
              text={"加入房间"}
              className={"menu-btn"}
              callback={() => {
                this.joinRoom();
              }}
            />
          )}
          <AtButton
            className="menu-btn"
            circle
            type="primary"
            size="normal"
            openType="share"
          >
            邀请朋友
          </AtButton>
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
              {ownRoom ? "解散房间" : "退出房间"}
            </AtButton>
          )}
          <AtButton
            className="menu-btn secondary"
            circle
            type="primary"
            size="normal"
            onClick={() => {
              this.gotoHome();
            }}
          >
            回首页
          </AtButton>
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
      </View>
    ) : (
      <View className="container">
        <AtButton
          className="menu-btn secondary"
          circle
          type="primary"
          size="normal"
          onClick={() => {
            this.gotoHome();
          }}
        >
          回首页
        </AtButton>
      </View>
    );
  }
}
