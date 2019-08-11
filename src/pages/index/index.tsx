import Taro, { Component, Config } from '@tarojs/taro'
import { View } from '@tarojs/components'
import { AtCard } from 'taro-ui'
import RoundItem from '../../components/RoundItem'
import Word from '../../components/Word'
import './index.scss'

interface BattleRow {
  question: string,
  answer: number,
  code: number,
}

interface IState {
  history: Array<Array<BattleRow>>,
  table: Array<Array<string>>,
}

export default class Index extends Component<any, IState> {

  state = {
    history: [],
    table: [],
  }

  config: Config = {
    navigationBarTitleText: '首页'
  }

  componentWillMount () { }

  componentDidMount () {
    this.setState({
      history: [
        [
          {
            question: '墨西哥',
            answer: 4,
            code: 2,
          },
          {
            question: '昆虫',
            answer: 3,
            code: 1,
          },
          {
            question: '儿童',
            answer: 1,
            code: 4,
          },
        ],
        [
          {
            question: '墨西哥',
            answer: 4,
            code: 2,
          },
          {
            question: '昆虫',
            answer: 3,
            code: 1,
          },
          {
            question: '儿童',
            answer: 1,
            code: 4,
          },
        ],
        [
          {
            question: '墨西哥',
            answer: 4,
            code: 2,
          },
          {
            question: '昆虫',
            answer: 3,
            code: 1,
          },
          {
            question: '儿童',
            answer: 1,
            code: 4,
          },
        ],
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
                className='round-item'
                title={`回合 ${index+1}`}
                thumb=''
              >
                {(item as Array<BattleRow>).map((data, wordIndex) =>
                  <RoundItem
                    key={data.question}
                    data={data}
                    index={wordIndex}
                  ></RoundItem>
                )}
              </AtCard>
            )
          }
        </View>
        <View className='result-talbe'>
          {
            table.map((item, index) => 
              <AtCard
                className={`table-item ${index % 2 === 1 ? 'grey' : ''}`}
                title={`${index + 1}`}
                thumb=''
              >
                {(item as Array<string>).map(text =>
                  <Word
                    key={text}
                    text={text}
                  ></Word>
                )}
              </AtCard>
            )
          }
        </View>
      </View>
    )
  }
}
