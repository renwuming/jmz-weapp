import Taro, { Component } from '@tarojs/taro'
import { View, Image } from '@tarojs/components'
import './index.scss'


export default class Index extends Component {

  componentDidHide() {
  }
  componentWillUnmount() {
  }
  componentDidShow() {
  }

  getImgList(type) {
    const groupList = [
      'http://cdn.renwuming.cn/static/jmz/group.jpg',
    ]
    const ruleList = [
      'https://mmbiz.qpic.cn/mmbiz_jpg/jncq0QtTwwqLS5RwkDiciaA30RJlZOcOFVk6t7UgJUjW6MxyJv38qMhZlWBzYJVICJibYVqmcFLys4PJTTzC5iawqw/640?wx_fmt=jpeg&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1',
      // 'https://mmbiz.qpic.cn/mmbiz_jpg/jncq0QtTwwqLS5RwkDiciaA30RJlZOcOFVNXgkSRAh6o6UPDks9GnqaCpHaF5KL79uK5Xyic29cNuV0atrLg9oiaaQ/640?wx_fmt=jpeg&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1',
      // 'https://mmbiz.qpic.cn/mmbiz_jpg/jncq0QtTwwqLS5RwkDiciaA30RJlZOcOFV1rTfLzJe3HcdEOTO0gFeKypLicoD99OSugib8nJIX3cX97j14cfrdZcw/640?wx_fmt=jpeg&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1',
      // 'https://mmbiz.qpic.cn/mmbiz_jpg/jncq0QtTwwqLS5RwkDiciaA30RJlZOcOFVOcGIQniaBy2bTRSsxR5gIGCoviazI0P0VvUUSd0VpzSmyibV85dLgdZ5g/640?wx_fmt=jpeg&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1',
      // 'https://mmbiz.qpic.cn/mmbiz_jpg/jncq0QtTwwqLS5RwkDiciaA30RJlZOcOFV9ia0MMboibhI5gHj2v8kDM1EicJnNibQjWccTYwEy5BgTSrYyMWjSWgPnQ/640?wx_fmt=jpeg&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1',
      // 'https://mmbiz.qpic.cn/mmbiz_jpg/jncq0QtTwwqLS5RwkDiciaA30RJlZOcOFVlRSVicic1BW1ZWa7havicuQpHib7ELuk4bX6CpdYB7ctbYQyQL7g4O0fLA/640?wx_fmt=jpeg&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1',
      // 'https://mmbiz.qpic.cn/mmbiz_jpg/jncq0QtTwwqLS5RwkDiciaA30RJlZOcOFVKSvAvyajnPnwddx9MZYTvhDoVxwJJQPPHT67S2mhoWPonkbDgU0vqg/640?wx_fmt=jpeg&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1',
      // 'https://mmbiz.qpic.cn/mmbiz_jpg/jncq0QtTwwqLS5RwkDiciaA30RJlZOcOFVC5CXriaTtuek6t1ibUMLdkiaKwe7FaQsnvECYShIPcnjdj1E0shIzLPcQ/640?wx_fmt=jpeg&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1',
      // 'https://mmbiz.qpic.cn/mmbiz_jpg/jncq0QtTwwqLS5RwkDiciaA30RJlZOcOFVJiaMPf43gySZFWueN9ia6zJ4r9L7Wvj3lon4NpIkk6u7NRj5EZVdyUMw/640?wx_fmt=jpeg&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1',
      // 'https://mmbiz.qpic.cn/mmbiz_jpg/jncq0QtTwwqLS5RwkDiciaA30RJlZOcOFVUVqrvbMs1q37lwaUxjxO37lXOcBn7GNAVswwQUmbIZ2ic2Gx0k84ia5g/640?wx_fmt=jpeg&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1',
      // 'https://mmbiz.qpic.cn/mmbiz_jpg/jncq0QtTwwqLS5RwkDiciaA30RJlZOcOFVjwxGts2fnNROVNptPso8pkThhx1nzNbDmowpCty0cg05zSyJhWiaAibQ/640?wx_fmt=jpeg&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1',
      // 'https://mmbiz.qpic.cn/mmbiz_jpg/jncq0QtTwwqLS5RwkDiciaA30RJlZOcOFVKjrWp3yhwibq1LrZMYiasLYFYJJVWvQQhksGZw73ZB8BAd1OialiaVTqLQ/640?wx_fmt=jpeg&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1',
    ]

    return type === 'rule' ? ruleList : groupList;
  }

  render () {
    const { type } = this.$router.params
    const imglist = this.getImgList(type)
    return (
      <View className='container'>
        {
          imglist.map(img => 
            <Image
              className='img-item'
              src={img}
              mode='widthFix'
              show-menu-by-longpress={true}
            />
          )
        }
            
      </View>
    )
  }
}

