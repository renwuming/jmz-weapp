import Taro, { Component } from '@tarojs/taro';
import { AtModal, AtModalHeader, AtModalContent, AtTag } from 'taro-ui';
import { View, Text, Image } from '@tarojs/components';
import './index.scss';
import { request } from '../../api';

interface UserInfo {
  nickName: string;
  avatarUrl: string;
  online: Boolean;
}

interface IProps {
  data: UserInfo;
  nonick: Boolean;
  long: Boolean;
  big: Boolean;
  userDetail: Object;
}

export default class Index extends Component<IProps, any> {
  static defaultProps = {
    data: {},
    nonick: false,
    long: false,
    big: false,
    userDetail: {},
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
    this.setState({
      isOpened: true,
    });
    const { data } = this.props;
    const { id } = data;
    request({
      method: 'GET',
      url: `/users/gamedata/${id}`,
    }).then(res => {
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
    const { data, nonick, big, long } = this.props;
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
        <Image className='useritem-avatar' src={data.avatarUrl} />
        {online !== undefined && (
          <View className={`online-box ${big ? 'big' : ''}`}>
            {online && big && (
              <AtTag
                className={'online ' + (big ? 'big' : '')}
                size='small'
                circle
              >
                在线
              </AtTag>
            )}
            {!online && (
              <AtTag
                className={'offline ' + (big ? 'big' : '')}
                size='small'
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
            }`}
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
          <AtModalHeader>{data.nickName}</AtModalHeader>
          <AtModalContent>
            <View className='detail-row'>
              <Text className='left win-rate'>胜率</Text>
              {userDetail.winRate !== undefined && (
                <Text className='win-rate'>{userDetail.winRate}%</Text>
              )}
            </View>
            <View className='detail-row'>
              <Text className='left'>获胜局数</Text>
              <Text className='info'>{userDetail.winSum}</Text>
            </View>
            <View className='detail-row'>
              <Text className='left'>平局数</Text>
              <Text className='info'>{userDetail.pingSum}</Text>
            </View>
            <View className='detail-row'>
              <Text className='left'>总局数</Text>
              <Text className='info'>{userDetail.Sum}</Text>
            </View>
          </AtModalContent>
        </AtModal>
      </View>
    );
  }
}
