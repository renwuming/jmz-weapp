import Taro, { Component } from '@tarojs/taro';
import { AtModal, AtModalHeader, AtModalContent, AtTag } from 'taro-ui';
import { View, Text, Image } from '@tarojs/components';
import './index.scss';
import { request } from '../../../api/wavelength';

interface UserInfo {
  nickName: string;
  avatarUrl: string;
  online?: Boolean;
  id: string;
}

interface IProps {
  data: UserInfo;
  nonick: Boolean;
  long: Boolean;
  big: Boolean;
  userDetail: Object;
  strong: boolean;
  showAchievement?: boolean;
}

export default class Index extends Component<IProps, any> {
  static defaultProps = {
    data: {},
    nonick: false,
    long: false,
    big: false,
    userDetail: {},
    strong: false,
    showAchievement: false,
  };

  ifCurrentUser() {
    const { data } = this.state;
    const userInfo = Taro.getStorageSync('userInfo');
    if (!data || !userInfo) return false;
    return (
      userInfo.nickName === data.nickName &&
      userInfo.avatarUrl === data.avatarUrl
    );
  }

  showUserDetail() {
    const { data, showAchievement } = this.props;
    if (!showAchievement) return;
    this.setState({
      isOpened: true,
    });
    const { id } = data;
    request({
      method: 'GET',
      url: `/games/achievement/${id}`,
    }).then((res) => {
      this.setState({
        userDetail: res,
      });
    });
  }
  handleConfirm() {
    this.setState({
      isOpened: false,
    });
  }

  render() {
    const { data, nonick, big, long, strong } = this.props;
    const { online } = data;
    const { isOpened, userDetail } = this.state;
    const currentUser = this.ifCurrentUser();

    return (
      <View
        className={`row ${big ? 'big' : ''}`}
        onClick={() => {
          this.showUserDetail();
        }}
      >
        <Image
          className={`useritem-avatar ${strong ? 'strong' : ''}`}
          src={data.avatarUrl}
        />
        {online !== undefined && (
          <View className={`online-box ${big ? 'big' : ''}`}>
            {online && big && (
              <AtTag
                className={'online ' + (big ? 'big' : '')}
                size="small"
                circle
              >
                在线
              </AtTag>
            )}
            {!online && (
              <AtTag
                className={'offline ' + (big ? 'big' : '')}
                size="small"
                circle
              >
                离线
              </AtTag>
            )}
          </View>
        )}
        {!nonick && (
          <Text
            className={`short-nick ${currentUser ? 'current' : ''} ${
              long ? 'long' : ''
            } ${big ? 'big' : ''}`}
            onClick={() => {
              this.showUserDetail();
            }}
          >
            {data.nickName}
          </Text>
        )}
        <AtModal
          isOpened={isOpened}
          onClose={this.handleConfirm.bind(this)}
          onConfirm={this.handleConfirm.bind(this)}
        >
          <AtModalHeader>
            <Image className="useritem-avatar" src={data.avatarUrl} />
            <Text className="block">{data.nickName}</Text>
          </AtModalHeader>
          <AtModalContent>
            <View className="detail-row">
              <Text className="left win-rate">胜率</Text>
              {userDetail.winRate !== undefined && (
                <Text className="win-rate">{userDetail.winRate}</Text>
              )}
            </View>
            <View className="detail-row">
              <Text className="left">胜利局数</Text>
              <Text className="info">{userDetail.winSum}</Text>
            </View>
            <View className="detail-row">
              <Text className="left">平局数</Text>
              <Text className="info">{userDetail.drawSum}</Text>
            </View>
            <View className="detail-row">
              <Text className="left">总局数</Text>
              <Text className="info">{userDetail.gameSum}</Text>
            </View>
          </AtModalContent>
        </AtModal>
      </View>
    );
  }
}