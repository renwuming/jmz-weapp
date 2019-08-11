import Taro, { Component, Config } from '@tarojs/taro'
import { View, Text } from '@tarojs/components'
import { AtButton, AtCard } from 'taro-ui'
import './index.scss'

export default class Index extends Component {
  state = {
    history: [],
    table: [],
  }

  /**
   * 指定config的类型声明为: Taro.Config
   *
   * 由于 typescript 对于 object 类型推导只能推出 Key 的基本类型
   * 对于像 navigationBarTextStyle: 'black' 这样的推导出的类型是 string
   * 提示和声明 navigationBarTextStyle: 'black' | 'white' 类型冲突, 需要显示声明类型
   */
  config: Config = {
    navigationBarTitleText: '首页'
  }

  componentWillMount () { }

  componentDidMount () {
    this.setState({
      history: [
        {
          questions: ['墨西哥', '昆虫', '儿童'],
          answer: [4, 2, 1],
          code: [4, 2, 1],
        },
        {
          questions: ['墨西哥', '昆虫', '儿童'],
          answer: [4, 2, 1],
          code: [4, 2, 1],
        },
        {
          questions: ['墨西哥', '昆虫', '儿童'],
          answer: [4, 2, 1],
          code: [4, 2, 1],
        },
      ],
      table: [
        ['恐怖'],
        ['昆虫', '蜻蛉目'],
        ['与朋友在', '晚上'],
        ['墨西哥', '阳伞'],
      ],
    })
  }

  componentWillUnmount () { }

  componentDidShow () { }

  componentDidHide () { }

  render () {
    const { history, table } = this.state
    return (
      <View className='container'>
        <View className='round-list'>
          {
            history.map((item, index) => 
              <AtCard
                className={['table-item', index % 2 === 1 ? 'table-item-grey' : '']}
                title={`round ${index+1}`}
                thumb=''
              >
                {((item as Object).questions as Array<String>).map(text =>
                  <Text className='word'>{text}</Text>
                )}
              </AtCard>
            )
          }
        </View>
        <View className='result-talbe'>
          {
            table.map((item, index) => 
              <AtCard
                className={['table-item', index % 2 === 1 ? 'table-item-grey' : '']}
                title={String(index+1)}
                thumb=''
              >
                {(item as Array<String>).map(text =>
                  <Text className='word'>{text}</Text>
                )}
              </AtCard>
            )
          }
        </View>
      </View>
    )
  }
}
