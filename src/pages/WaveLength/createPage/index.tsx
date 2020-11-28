import Taro, { Component } from '@tarojs/taro';
import { Text } from '@tarojs/components';
import './index.scss';
import { AtForm, AtButton, AtSwitch, AtRadio } from 'taro-ui';
import { request } from '../../../api/wavelength';

export default class Index extends Component<any, any> {
  state = {
    randomTeam: true,
    timelimit: true,
    gameMode: '1',
  };

  componentDidShow() {}

  async createRoom() {
    const { randomTeam, timelimit, gameMode } = this.state;

    const { id } = await request({
      method: 'POST',
      url: '/games/v2',
      data: {
        randomTeam,
        timelimit,
        gameMode,
      },
    });

    Taro.redirectTo({
      url: `/pages/WaveLength/game/index?id=${id}`,
    });
  }

  render() {
    const { randomTeam, timelimit, gameMode } = this.state;
    const userInfo = Taro.getStorageSync('userInfo');
    const { nickName } = userInfo;

    const modeList = [
      {
        label: '竞争模式',
        value: '1',
        desc: '4人以上，分组竞争，先达到10分的队伍获得胜利',
      },
      {
        label: '合作模式',
        value: '2',
        desc: '2人以上，一起合作，在7个回合内达到16分获得胜利',
      },
    ];

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
          title="随机组队"
          border={false}
          checked={randomTeam}
          onChange={() => {
            this.setState({
              randomTeam: !randomTeam,
            });
          }}
        />
        <AtSwitch
          title="限时竞技"
          className="red-switch"
          color="#e6504b"
          border={false}
          checked={timelimit}
          onChange={() => {
            this.setState({
              timelimit: !timelimit,
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
