import Taro, { Component } from '@tarojs/taro';
import { View } from '@tarojs/components';
import './index.scss';
import { AtActionSheet, AtActionSheetItem, AtIcon } from 'taro-ui';
import { Player } from 'src/pages/WaveLength/game/interface';
import { request } from '../../../api/wavelength';

interface IProps {
  gameID: string;
  owner: string;
  player: Player;
}

export default class Index extends Component<IProps, any> {
  static defaultProps = {
    gameID: '',
    owner: '',
    player: null,
  };

  componentDidHide() {}
  componentWillUnmount() {}
  componentDidShow() {}

  handlePlayerAction(value) {
    this.setState({
      openActionSheet: value,
    });
  }

  handlePlayer(action: string) {
    const { gameID, player } = this.props;
    const { _id: userID } = player;
    request({
      method: 'POST',
      url: `/games/${gameID}/players/${userID}`,
      data: {
        action,
      },
    });
  }

  render() {
    const { openActionSheet } = this.state;
    const { player, owner } = this.props;

    return (
      <View>
        <AtIcon
          onClick={() => {
            this.handlePlayerAction(true);
          }}
          value="settings"
          size="20"
          color="#009966"
        ></AtIcon>
        <AtActionSheet
          isOpened={openActionSheet}
          cancelText="取消"
          title={player.userInfo.nickName}
          onCancel={() => {
            this.handlePlayerAction(false);
          }}
          onClose={() => {
            this.handlePlayerAction(false);
          }}
        >
          <AtActionSheetItem
            onClick={() => {
              this.handlePlayer('top');
              this.handlePlayerAction(false);
            }}
          >
            移到顶部
          </AtActionSheetItem>
          {owner !== player._id && (
            <AtActionSheetItem
              onClick={() => {
                this.handlePlayer('kick');
                this.handlePlayerAction(false);
              }}
            >
              踢出
            </AtActionSheetItem>
          )}
        </AtActionSheet>
      </View>
    );
  }
}
