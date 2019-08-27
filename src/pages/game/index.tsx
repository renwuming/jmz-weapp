import Taro, { Component } from '@tarojs/taro'
import { View, Text } from '@tarojs/components'
import { AtCard, AtButton, AtMessage, AtFab, AtIcon } from 'taro-ui'
import RoundItem from '../../components/RoundItem'
import Word from '../../components/Word'
import UserInfoTip from '../../components/UserInfoTip'
import UserItem from '../../components/UserItem'
import './index.scss'
import { request } from '../../api'

let updateTimer

interface BattleRow {
  question: string,
  answer: number,
  code: number,
}

interface HistoryItem {
  list: Array<Object>,
  black: boolean,
  red: boolean,
}

interface UserInfo {
  nickName: string,
  avatarUrl: string,
}

interface IState {
  mode: string,
  roundNumber: number,
  battle: Array<BattleRow>,
  history: Array<HistoryItem>,
  historyEnemy: Array<HistoryItem>,
  table: Array<Array<string>>,
  tableEnemy: Array<Array<string>>,
  changePaper: boolean,
  teamWords: Array<string>,
  enemyWords: Array<string>,
  battleData: Object,
  type: string,
  lastType: string,
  desUser: UserInfo,
  jiemiUser: UserInfo,
  lanjieUser: UserInfo,
  teamNames: Array<string>,
  userList: Array<UserInfo>,
  gameOver: boolean,
  sumList: Array<number>,
  winner: number,
  jiamiStatus: boolean,
  jiemiStatus: boolean,
  lanjieStatus: boolean,
  observeMode: boolean,
  paperIndex: number, // 答题纸的哪一面
  actionPaperIndex: number, // 动作应该在哪一面执行

  submitLoading: boolean, // loading
}

let changePaperTimer

export default class Index extends Component<any, IState> {

  state = {
    mode: 'tool', // 模式
    roundNumber: 0,
    battle: ([] as Array<BattleRow>),
    history: [],
    historyEnemy: [],
    table: [],
    tableEnemy: [],
    changePaper: false,
    teamWords: [],
    enemyWords: [],
    battleData: {},
    type: '',
    lastType: '',
    desUser: {
      nickName: '',
      avatarUrl: '',
    },
    jiemiUser: {
      nickName: '',
      avatarUrl: '',
    },
    lanjieUser: {
      nickName: '',
      avatarUrl: '',
    },
    teamNames: [],
    userList: [],
    sumList: [],
    gameOver: false,
    winner: 0,
    jiamiStatus: false,
    jiemiStatus: false,
    lanjieStatus: false,
    observeMode: false,
    paperIndex: 0,
    actionPaperIndex: 0,

    submitLoading: false,
  }
  
  onShareAppMessage() {
    const { id, roomID } = this.$router.params
    return {
        title: '截码战，火热进行中',
        path: `/pages/game/index?id=${id}&roomID=${roomID}`,
        imageUrl: 'http://cdn.renwuming.cn/static/jmz/share.jpg',
    }
  }


  updateGameData() {
    const { id } = this.$router.params
    return request({
      method: 'GET',
      url: `/games/wx/${id}`,
    }).then(res => {
      const { data } = res
      const { type } = data
      const { battle, ...otherData } = data
      const { lastType } = this.state

      this.setState(otherData)
      // 若type起变化，则表示已进入下一个阶段，则更新battle
      if(!lastType || type === '等待' || type !== lastType) {
        this.setState({
          battle,
          lastType: type,
        })
      }
    })
  }

  componentDidHide() {
    clearInterval(updateTimer)
  }
  componentWillUnmount() {
    clearInterval(updateTimer)
  }

  componentDidShow() {
    this.initMode()    
    this.updateGameData()
    clearInterval(updateTimer)
    updateTimer = setInterval(() => {
      this.updateGameData()
    }, 3000)
  }

  initMode() {
    const mode = Taro.getStorageSync('mode')
    this.setState({
      mode,
    })
  }

  submit() {
    const { id } = this.$router.params
    const { battle, type } = this.state
    if(type === '解密' || type === '拦截') {
      const answerList = battle.map(item => item.answer)
      // 若有未填写数字 or 有重复数字
      if (new Set(answerList.filter(n=> n>=0)).size < 3) {
        Taro.atMessage({
          'message': '请正确填写!',
          'type': 'warning',
        })
        return
      }
    } else {
      const questionList = battle.map(item => item.question)
      // 若有未填写的加密
      if (questionList.filter(n=>!!n).length < 3) {
        Taro.atMessage({
          'message': '请正确填写!',
          'type': 'warning',
        })
        return
      }
    }
    this.setState({
      submitLoading: true,
    })
    request({
      method: 'POST',
      url: `/games/wx/${id}/submit`,
      data: {
        battle,
      },
    }).then(() => {
      return this.updateGameData()
    }).then(() => {
      this.setState({
        submitLoading: false,
      })
    })
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
    const { paperIndex } = this.state
    this.setState({
      changePaper: true,
      paperIndex: 1 - paperIndex, // 切换答题纸的正反面
    })
    changePaperTimer = setTimeout(() => {
      this.setState({
        changePaper: false,
      })
    }, 1200)
  }
  
  gotoHome() {
    Taro.reLaunch({
      url: '/pages/home/index'
    })
  }

  render () {
    const { history, historyEnemy, table, tableEnemy, roundNumber, battle, changePaper,
      desUser, jiemiUser, lanjieUser, actionPaperIndex, paperIndex,
      jiamiStatus, jiemiStatus, lanjieStatus, observeMode,
      teamNames, userList, gameOver, winner, sumList,
      teamWords, enemyWords, type,
      mode } = this.state
    const { submitLoading } = this.state
    const showTable = paperIndex === 0 ? table : tableEnemy
    const showHistory = paperIndex === 0 ? history : historyEnemy
    const roundName = actionPaperIndex === 0 ? '我方回合' : '敌方回合'
    const pageTitleMap = observeMode ? ['马里奥队截码卡', '酷霸王队截码卡'] : ['我方截码卡', '敌方截码卡']
    const resultString = winner >= 0 ? `获胜者是【${teamNames[winner]}队】！` : '双方战成平局！'
    const gameMode = mode === 'game'
    return (
      <View
        className='container'
      >
        <UserInfoTip />
        <AtMessage />
        {
          gameMode && (
            <View className='team-status'>
              {
                teamNames.map((team, index) => {
                  const baseIndex = index * 2
                  return (
                    <View className='team-title'>
                      <Text style={{ marginRight: '10px' }}>{team}队</Text>
                      <UserItem data={userList[baseIndex]}></UserItem>
                      <UserItem data={userList[baseIndex+1]}></UserItem>
                      <Text className='score'>{sumList[index]}分</Text>
                    </View>
                  )
                })
              }
            </View>
          )
        }
        {
          gameMode && gameOver && (
            <View>
              <AtCard
                className='round-item battle-item over-card'
                title='结束'
              >
                <View>
                  <Text className='over-tip'>{resultString}</Text>
                </View>
              </AtCard>
            </View>
          )
        }
        <View
          className={changePaper ? 'rotate-container' : ''}
        >
          <View className='title-box'>
            <Text>{ pageTitleMap[paperIndex] }</Text>
          </View>
          {
            gameMode && (
              <View className='round-list'>
                {
                  showHistory.map((item: HistoryItem, index) => 
                    <AtCard
                      className='round-item'
                      title={`回合 ${paperIndex === 0 ? index * 2 + 1 : (index + 1 )* 2}`}
                      note={`${item.black ? '·解密失败' : ''} ${item.red ? '·被拦截' : ''}`}
                    >
                      {(item.list as Array<BattleRow>).map((data, wordIndex) =>
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
            )
          }
          {
            gameMode && !gameOver && (
              <View>
                <AtCard
                  className='round-item battle-item'
                  title={`当前回合 ${roundNumber + 1}`}
                >
                  <View className='round-status'>
                    <View className='row'>
                      <Text className='left'>加密者</Text>
                      <UserItem data={desUser}></UserItem>
                      {
                        jiamiStatus && <AtIcon value='check' size='20' color='#009966'></AtIcon>
                      }
                    </View>
                    <View className='row'>
                      <Text className='left'>解密者</Text>
                      <UserItem data={jiemiUser}></UserItem>
                      {
                        jiemiStatus && <AtIcon value='check' size='20' color='#009966'></AtIcon>
                      }
                    </View>
                    {
                      lanjieUser.nickName && (
                        <View className='row'>
                          <Text className='left'>拦截者</Text>
                          <UserItem data={lanjieUser}></UserItem>
                          {
                            lanjieStatus && <AtIcon value='check' size='20' color='#009966'></AtIcon>
                          }
                        </View>
                      )
                    }
                  </View>
                  {
                    !observeMode && (
                      actionPaperIndex === paperIndex ? (
                        <View>
                          <Text className='card-tip'>您处于【{type}】阶段，现在是【{roundName}】，请【{type}】</Text>
                          <View style={{ marginTop: '6px' }}>
                            {(battle as Array<BattleRow>).map((data, wordIndex) =>
                              <RoundItem
                                key={data.question}
                                data={data}
                                index={wordIndex}
                                onAnswerChange={(...args) => {this.updateAnswer.apply(this, args)}}
                                onQuestionChange={(...args) => {this.updateQuestion.apply(this, args)}}
                                type={type}
                              ></RoundItem>
                            )}
                            {
                              type !== '等待' && (
                                <AtButton
                                  onClick={() => {this.submit()}}
                                  loading={submitLoading}
                                  className='submit-btn'
                                  type='primary'
                                  size='normal'>
                                    提交
                                </AtButton>
                              )
                            }
                          </View>
                        </View>
                      ) : (
                        <View>
                          <Text className='card-tip'>您处于【{type}】阶段，现在是【{roundName}】，请将截码卡翻到背面</Text>
                        </View>
                      )
                    )
                  }
                </AtCard>
              </View>
            )
          }
          
          <View className='result-talbe'>
            {
              showTable.map((item, index) => 
                <AtCard
                  className={`table-item ${index % 2 === 1 ? 'grey' : ''}`}
                  title={`${index + 1}\n${paperIndex === 0 ? teamWords[index] : enemyWords[index]}`}
                >
                  {
                    gameMode &&
                    (item as Array<string>).map(text =>
                      <Word
                        key={text}
                        text={text}
                      ></Word>
                    )
                  }
                </AtCard>
              )
            }
          </View>
        </View>
        <View className='rotate-btn'>
          <AtFab
            onClick={() => {this.changePaper()}}
            size='small'
          >
            <Text className='at-fab__icon at-icon at-icon-repeat-play'></Text>
          </AtFab>
        </View>
        <View className='home-btn'>
          <AtFab
            onClick={() => {this.gotoHome()}}
            size='small'
          >
            <Text className='at-fab__icon at-icon at-icon-home'></Text>
          </AtFab>
        </View>
      </View>
    )
  }
}
