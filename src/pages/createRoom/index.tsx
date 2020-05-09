import Taro, { Component } from "@tarojs/taro";
import { Text } from "@tarojs/components";
import "./index.scss";
import { AtForm, AtButton, AtSwitch, AtRadio } from "taro-ui";
import { request } from "../../api";

export default class Index extends Component<any, any> {
  state = {
    publicStatus: true,
    random: true,
    timer: true,
    gameMode: 1,
    season: {},
  };

  componentDidShow() {
    request({
      method: "GET",
      url: "/seasons/newest",
    }).then((season) => {
      this.setState({
        season,
      });
    });
  }

  createRoom() {
    const { publicStatus, random, timer, gameMode } = this.state;
    request({
      method: "POST",
      url: "/rooms/v2/create",
      data: {
        publicStatus,
        random,
        timer,
        gameMode,
      },
    }).then((res) => {
      const { id } = res;
      Taro.redirectTo({
        url: `/pages/room/index?id=${id}`,
      });
    });
  }

  render() {
    const { publicStatus, random, timer, gameMode, season } = this.state;
    const userInfo = Taro.getStorageSync("userInfo");
    const { nickName } = userInfo;
    const { name, end } = season as any;

    const modeList = [
      {
        label: "休闲模式",
        value: 1,
        desc: "只影响胜率，不影响赛季积分",
      },
      {
        label: "赛季模式",
        value: 0,
        desc: `【${name ? name : ""}】赛季，${end ? "已结束" : "快来冲榜！"}`,
        disabled: end,
      },
    ];

    // 管理员可以创建团队模式房间
    const isAdmin = Taro.getStorageSync("isAdmin");
    if (isAdmin) {
      modeList.push({
        label: "团队模式",
        value: 2,
        desc: `培养团队默契，不限人数`,
        disabled: end,
      });
    }

    return (
      <AtForm
        className="create-form"
        onSubmit={() => {
          this.createRoom();
        }}
      >
        <Text className="title">{nickName}的房间</Text>
        <AtRadio
          options={modeList}
          value={gameMode}
          onClick={(value) => {
            this.setState({
              gameMode: value,
            });
          }}
        />
        <AtSwitch
          title="公开房间"
          className="red-switch"
          color="#e6504b"
          border={false}
          checked={publicStatus}
          onChange={() => {
            this.setState({
              publicStatus: !publicStatus,
            });
          }}
        />
        <AtSwitch
          title="随机组队"
          border={false}
          checked={random}
          onChange={() => {
            this.setState({
              random: !random,
            });
          }}
        />
        <AtSwitch
          title="限时竞技"
          className="red-switch"
          color="#e6504b"
          border={false}
          checked={timer}
          onChange={() => {
            this.setState({
              timer: !timer,
            });
          }}
        />
        <AtButton
          formType="submit"
          className="menu-btn"
          circle
          type="primary"
          size="normal"
        >
          确定
        </AtButton>
      </AtForm>
    );
  }
}
