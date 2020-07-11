import Taro, { Component, Config } from '@tarojs/taro';
import { View, Image } from '@tarojs/components';
import './index.scss';

export default class Index extends Component {
  config: Config = {
    navigationBarTitleText: '更多',
  };
  state = {
    imgList: [],
  };

  componentDidHide() {}
  componentWillUnmount() {}
  componentDidShow() {}

  getImgList(type) {
    const groupList = ['https://cdn.renwuming.cn/static/jmz/group.jpg'];
    const ruleList = [
      'https://mmbiz.qpic.cn/mmbiz_jpg/jncq0QtTwwqLS5RwkDiciaA30RJlZOcOFVk6t7UgJUjW6MxyJv38qMhZlWBzYJVICJibYVqmcFLys4PJTTzC5iawqw/0?wx_fmt=jpeg',
      'https://mmbiz.qpic.cn/mmbiz_jpg/jncq0QtTwwqLS5RwkDiciaA30RJlZOcOFVNXgkSRAh6o6UPDks9GnqaCpHaF5KL79uK5Xyic29cNuV0atrLg9oiaaQ/0?wx_fmt=jpeg',
      'https://mmbiz.qpic.cn/mmbiz_jpg/jncq0QtTwwqLS5RwkDiciaA30RJlZOcOFV1rTfLzJe3HcdEOTO0gFeKypLicoD99OSugib8nJIX3cX97j14cfrdZcw/0?wx_fmt=jpeg',
      'https://mmbiz.qpic.cn/mmbiz_jpg/jncq0QtTwwqLS5RwkDiciaA30RJlZOcOFVOcGIQniaBy2bTRSsxR5gIGCoviazI0P0VvUUSd0VpzSmyibV85dLgdZ5g/0?wx_fmt=jpeg',
      'https://mmbiz.qpic.cn/mmbiz_jpg/jncq0QtTwwqLS5RwkDiciaA30RJlZOcOFV9ia0MMboibhI5gHj2v8kDM1EicJnNibQjWccTYwEy5BgTSrYyMWjSWgPnQ/0?wx_fmt=jpeg',
      'https://mmbiz.qpic.cn/mmbiz_jpg/jncq0QtTwwqLS5RwkDiciaA30RJlZOcOFVlRSVicic1BW1ZWa7havicuQpHib7ELuk4bX6CpdYB7ctbYQyQL7g4O0fLA/0?wx_fmt=jpeg',
      'https://mmbiz.qpic.cn/mmbiz_jpg/jncq0QtTwwqLS5RwkDiciaA30RJlZOcOFVKSvAvyajnPnwddx9MZYTvhDoVxwJJQPPHT67S2mhoWPonkbDgU0vqg/0?wx_fmt=jpeg',
      'https://mmbiz.qpic.cn/mmbiz_jpg/jncq0QtTwwqLS5RwkDiciaA30RJlZOcOFVC5CXriaTtuek6t1ibUMLdkiaKwe7FaQsnvECYShIPcnjdj1E0shIzLPcQ/0?wx_fmt=jpeg',
      'https://mmbiz.qpic.cn/mmbiz_jpg/jncq0QtTwwqLS5RwkDiciaA30RJlZOcOFVJiaMPf43gySZFWueN9ia6zJ4r9L7Wvj3lon4NpIkk6u7NRj5EZVdyUMw/0?wx_fmt=jpeg',
      'https://mmbiz.qpic.cn/mmbiz_jpg/jncq0QtTwwqLS5RwkDiciaA30RJlZOcOFVUVqrvbMs1q37lwaUxjxO37lXOcBn7GNAVswwQUmbIZ2ic2Gx0k84ia5g/0?wx_fmt=jpeg',
      'https://mmbiz.qpic.cn/mmbiz_jpg/jncq0QtTwwqLS5RwkDiciaA30RJlZOcOFVjwxGts2fnNROVNptPso8pkThhx1nzNbDmowpCty0cg05zSyJhWiaAibQ/0?wx_fmt=jpeg',
      'https://mmbiz.qpic.cn/mmbiz_jpg/jncq0QtTwwqLS5RwkDiciaA30RJlZOcOFVKjrWp3yhwibq1LrZMYiasLYFYJJVWvQQhksGZw73ZB8BAd1OialiaVTqLQ/0?wx_fmt=jpeg',
    ];
    const rewardList = ['https://cdn.renwuming.cn/static/reward.jpg'];

    const imgList =
      type === 'rule' ? ruleList : type === 'reward' ? rewardList : groupList;

    this.setState({
      imgList,
    });

    return imgList;
  }

  previewImage(index) {
    const { imgList } = this.state;
    Taro.previewImage({
      current: imgList[index],
      urls: imgList,
    });
  }

  render() {
    const { type } = this.$router.params;
    const imglist = this.getImgList(type);
    return (
      <View className={`container ${type}`}>
        {imglist.map((img, index) => (
          <Image
            className="img-item"
            src={img}
            mode="widthFix"
            onClick={() => {
              this.previewImage(index);
            }}
          />
        ))}
      </View>
    );
  }
}
