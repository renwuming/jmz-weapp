import Taro, { Component } from '@tarojs/taro'
import { View, Text } from '@tarojs/components'
import { AtCard, AtButton, AtMessage, AtFab } from 'taro-ui'
import RoundItem from '../../components/RoundItem'
import Word from '../../components/Word'
import UserInfoTip from '../../components/UserInfoTip'
import './index.scss'

interface BattleRow {
  question: string,
  answer: number,
  code: number,
}

interface IState {
  roundNumber: number,
  battle: Array<BattleRow>,
  history: Array<Array<BattleRow>>,
  table: Array<Array<string>>,
  changePaper: boolean,
}

let changePaperTimer

export default class Index extends Component<any, IState> {

  state = {
    roundNumber: 0,
    battle: [] as Array<BattleRow>,
    history: [],
    table: [],
    changePaper: false,
  }

  componentDidMount () {
    const { id } = this.$router.params
    console.log(id)
    this.setState({
      roundNumber: 4,
      // battle: [
      //   {
      //     question: '',
      //     answer: 2,
      //     code: 0,
      //   },
      //   {
      //     question: '',
      //     answer: 1,
      //     code: 0,
      //   },
      //   {
      //     question: '',
      //     answer: 4,
      //     code: 0,
      //   },
      // ],
      battle: [
        {
          question: '与朋友在与朋友在与朋友在与朋友在与朋友在与朋友在与朋友在与朋友在',
          answer: 0,
          code: 0,
        },
        {
          question: '晚上',
          answer: 0,
          code: 0,
        },
        {
          question: '不可描述',
          answer: 0,
          code: 0,
        },
      ],
      history: [
        [
          {
            question: '与朋友在与朋友在与朋友在与朋友在与朋友在与朋友在与朋友在与朋友在',
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

  submit() {
    const answerList = this.state.battle.map(item => item.answer)
    // 若有未填写数字 or 有重复数字
    if (new Set(answerList.filter(n=>!!n)).size < 3) {
      Taro.atMessage({
        'message': '请正确填写密码!',
        'type': 'warning',
      })
    }
  }

  updateAnswer(index, answer) {
    const { battle } = this.state
    battle[index].answer = answer
    this.setState({
      battle,
    })
  }
  updateQuestion(index, question) {
    const { battle } = this.state
    battle[index].question = question
    this.setState({
      battle,
    })
  }

  changePaper() {
    if (this.state.changePaper) return
    clearTimeout(changePaperTimer)
    this.setState({
      changePaper: true,
    })
    changePaperTimer = setTimeout(() => {
      this.setState({
        changePaper: false,
      })
    }, 1200)
  }

  render () {
    const { history, table, roundNumber, battle, changePaper } = this.state
    return (
      <View
        className='container'
      >
        <UserInfoTip />
        <AtMessage />
        <View
          className={changePaper ? 'rotate-container' : ''}
        >
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
          <View>
            <AtCard
              className='round-item battle-item'
              title={`当前回合 ${roundNumber}`}
              thumb=''
            >
              {(battle as Array<BattleRow>).map((data, wordIndex) =>
                <RoundItem
                  key={data.question}
                  data={data}
                  index={wordIndex}
                  onAnswerChange={(...args) => {this.updateAnswer.apply(this, args)}}
                  onQuestionChange={(...args) => {this.updateQuestion.apply(this, args)}}
                  battle={'拦截'}
                ></RoundItem>
              )}
              <AtButton
                onClick={() => {this.submit()}}
                className='submit-btn'
                type='primary'
                size='normal'>
                  提交
              </AtButton>
            </AtCard>
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
        <AtFab
          onClick={() => {this.changePaper()}}
          size='small'
          className='fab-btn'
        >
          <Text className='at-fab__icon at-icon at-icon-repeat-play'></Text>
        </AtFab>
        {/* {JSON.stringify(battle)} */}
      </View>
    )
  }
}
