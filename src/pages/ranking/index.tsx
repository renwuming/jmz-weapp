import Taro, { Component, Config } from '@tarojs/taro';
import { View, Text, Image, ScrollView } from '@tarojs/components';
import './index.scss';
import UserItem from '../../components/UserItem';
import { request } from '../../api';

export default class Index extends Component<any, any> {
  config: Config = {
    navigationBarBackgroundColor: '#eee',
  };

  state = {
    seasonName: '',
    rank: [],
  };

  componentDidShow() {
    request({
      method: 'GET',
      url: '/seasons/newest',
    }).then(res => {
      const { name } = res;
      this.setState({
        seasonName: name,
      });
    });

    request({
      method: 'GET',
      url: '/seasons/newest/rank',
    }).then(rank => {
      this.setState({
        rank,
      });
    });
  }

  render() {
    const { seasonName, rank } = this.state;

    return (
      <View className='container'>
        <View className='title-box'>
          <View className='img-btn-box'>
            <Image src='http://cdn.renwuming.cn/static/jmz/left-rotate.jpg' />
          </View>
          {seasonName && (
            <View>
              <Text className='title'>{seasonName}</Text>
              <Text>赛季排行榜</Text>
            </View>
          )}
          <View className='img-btn-box right'>
            <Image src='http://cdn.renwuming.cn/static/jmz/music.png' />
          </View>
        </View>
        <ScrollView scrollY={true}>
          {rank.map((item, index) => {
            const { userInfo, score } = item;
            return (
              <View key='rank' className='rank-row'>
                <Text className={'index ' + (index < 3 ? 'top' : '')}>
                  {index + 1}
                </Text>
                <View className='user-box'>
                  <UserItem big data={userInfo}></UserItem>
                </View>
                <View className='column-right'>
                  <Text className='score'>赛季积分</Text>
                  <Text className='score'>{score}</Text>
                </View>
              </View>
            );
          })}
        </ScrollView>
      </View>
    );
  }
}
