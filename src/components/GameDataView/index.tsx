import Taro, { Component } from '@tarojs/taro';
import { AtModal, AtModalHeader, AtModalContent, AtAvatar } from 'taro-ui';
import { View, OpenData, Text } from '@tarojs/components';
import './index.scss';
import { request } from '../../api';

export default class Index extends Component<any, any> {
  showUserDetail() {
    this.setState({
      isOpened: true,
    });
    request({
      method: 'GET',
      url: `/users/gamedata/self`,
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
    const { isOpened, userDetail } = this.state;
    return (
      <View
        className="user-info"
        onClick={() => {
          this.showUserDetail();
        }}
      >
        <AtAvatar circle openData={{ type: 'userAvatarUrl' }}></AtAvatar>
        <OpenData className="nick" type="userNickName" lang="zh_CN"></OpenData>
        <AtModal
          isOpened={isOpened}
          onClose={this.handleConfirm.bind(this)}
          onConfirm={this.handleConfirm.bind(this)}
        >
          <AtModalHeader>
            <OpenData
              className="nick"
              type="userNickName"
              lang="zh_CN"
            ></OpenData>
          </AtModalHeader>
          <AtModalContent>
            <View className="detail-row">
              <Text className="left win-rate">胜率</Text>
              {userDetail.winRate !== undefined && (
                <Text className="win-rate">{userDetail.winRate}%</Text>
              )}
            </View>
            <View className="detail-row">
              <Text className="left">胜利局数</Text>
              <Text className="info">{userDetail.winSum}</Text>
            </View>
            <View className="detail-row">
              <Text className="left">平局数</Text>
              <Text className="info">{userDetail.pingSum}</Text>
            </View>
            <View className="detail-row">
              <Text className="left">总局数</Text>
              <Text className="info">{userDetail.Sum}</Text>
            </View>
          </AtModalContent>
        </AtModal>
      </View>
    );
  }
}
