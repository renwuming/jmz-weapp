import Taro, { Component } from '@tarojs/taro'
import { View, Text } from '@tarojs/components'
import { AtCard, AtButton, AtMessage, AtFab, AtIcon } from 'taro-ui'
import RoundItem from '../../components/RoundItem'
import Word from '../../components/Word'
import UserItem from '../../components/UserItem'
import './index.scss'
import { request } from '../../api'

let updateTimer

interface BattleRow {
  question: string
  answer: number
  code: number
}

interface HistoryItem {
  list: Array<Object>
  black: boolean
  red: boolean
}

interface UserInfo {
  nickName: string
  avatarUrl: string
}

interface IState {
  battle: Array<BattleRow>
  desUsers: Array<number>
  jiemiUsers: Array<number>
  lanjieUsers: Array<number>
  userIndex: number
  types: Array<string>
  roundNumber: number
  history: Array<HistoryItem>
  historyEnemy: Array<HistoryItem>
  table: Array<Array<string>>
  tableEnemy: Array<Array<string>>
  teamWords: Array<string>
  enemyWords: Array<string>
  battleData: Object
  teamNames: Array<string>
  userList: Array<UserInfo>
  gameOver: boolean
  sumList: Array<number>
  winner: number
  observeMode: boolean
  teamIndex: number

  paperIndex: number
  changePaper: boolean
  mode: string
  submitLoading: boolean // loading
}

let changePaperTimer

export default class Index extends Component<any, IState> {
  state = {
    mode: 'tool', // 模式
    battle: [] as Array<BattleRow>,
    battleData: {
      jiemiStatus: [],
      jiamiStatus: [],
      lanjieStatus: []
    },
    desUsers: [],
    jiemiUsers: [],
    lanjieUsers: [],
    userIndex: 0,
    types: [],
    roundNumber: 0,
    history: [],
    historyEnemy: [],
    table: [],
    tableEnemy: [],
    teamWords: [],
    enemyWords: [],
    teamNames: [],
    userList: [],
    sumList: [],
    gameOver: false,
    winner: 0,
    observeMode: false,
    teamIndex: 0,

    paperIndex: 0,
    changePaper: false,
    actionPaperIndex: 0,
    submitLoading: false
  }

  onShareAppMessage() {
    const { id } = this.$router.params
    return {
      title: '截码战，火热进行中',
      path: `/pages/game/index?id=${id}`,
      imageUrl: 'http://cdn.renwuming.cn/static/jmz/share.jpg'
    }
  }

  updateGameData() {
    const { id } = this.$router.params
    return request({
      method: 'GET',
      url: `/games/wx/${id}`
    }).then(data => {
      const { battle, ...otherData } = data
      this.setState(otherData)
      // 根据玩家人数，设置mode
      this.initMode(data.userList.length)

      data.types.forEach((type, teamIndex) => {
        if (type === '解密' || type === '拦截') {
          battle[teamIndex].forEach((item, index) => {
            item.answer = this.state.battle[teamIndex]
              ? this.state.battle[teamIndex][index].answer
              : -1
          })
        }
        if (type === '加密') {
          battle[teamIndex].forEach((item, index) => {
            item.question = this.state.battle[teamIndex]
              ? this.state.battle[teamIndex][index].question
              : ''
          })
        }
      })
      this.setState({
        battle
      })
    })
  }

  componentDidHide() {
    clearInterval(updateTimer)
  }
  componentWillUnmount() {
    clearInterval(updateTimer)
  }

  componentDidShow() {
    this.updateGameData()
    clearInterval(updateTimer)
    updateTimer = setInterval(() => {
      this.updateGameData()
    }, 3000)
  }

  initMode(length) {
    const mode = length > 1 ? 'game' : 'tool'
    this.setState({
      mode
    })
  }

  submit() {
    const { id } = this.$router.params
    const { battle, types, paperIndex } = this.state
    const currentBattle = battle[paperIndex]
    const type = types[paperIndex]
    if (type === '解密' || type === '拦截') {
      const answerList = currentBattle.map(item => item.answer)
      // 若有未填写数字 or 有重复数字
      if (new Set(answerList.filter(n => n >= 0)).size < 3) {
        Taro.atMessage({
          message: '请正确填写!',
          type: 'warning'
        })
        return
      }
    } else {
      const questionList = currentBattle.map(item => item.question)
      // 若有未填写的加密
      if (questionList.filter(n => !!n).length < 3) {
        Taro.atMessage({
          message: '请正确填写!',
          type: 'warning'
        })
        return
      }
    }
    this.setState({
      submitLoading: true
    })
    request({
      method: 'POST',
      url: `/games/wx/${id}/submit`,
      data: {
        battle: currentBattle,
        battleIndex: paperIndex,
      }
    })
      .then(() => {
        return this.updateGameData()
      })
      .then(() => {
        this.setState({
          submitLoading: false
        })
      })
  }

  updateAnswer(index, answer) {
    const { battle, paperIndex } = this.state
    battle[paperIndex][index].answer = answer
    this.setState({
      battle
    })
  }
  updateQuestion(index, question) {
    const { battle, paperIndex } = this.state
    battle[paperIndex][index].question = question
    this.setState({
      battle
    })
  }

  changePaper() {
    if (this.state.changePaper) return
    clearTimeout(changePaperTimer)
    const { paperIndex } = this.state
    this.setState({
      changePaper: true,
      paperIndex: 1 - paperIndex // 切换答题纸的正反面
    })
    changePaperTimer = setTimeout(() => {
      this.setState({
        changePaper: false
      })
    }, 1200)
  }

  gotoHome() {
    Taro.reLaunch({
      url: '/pages/home/index'
    })
  }

  render() {
    const {
      userIndex,
      battleData,
      battle,
      history,
      historyEnemy,
      table,
      tableEnemy,
      roundNumber,
      teamNames,
      userList,
      desUsers,
      jiemiUsers,
      lanjieUsers,
      types,
      gameOver,
      winner,
      sumList,
      teamWords,
      enemyWords,
      paperIndex,
      observeMode,
      teamIndex,
      changePaper,
      mode
    } = this.state
    const { submitLoading } = this.state
    const showTable = teamIndex === paperIndex ? table : tableEnemy
    const showHistory = teamIndex === paperIndex ? history : historyEnemy
    const pageTitleMap = observeMode
      ? ['马里奥队截码卡', '酷霸王队截码卡']
      : ['我方截码卡', '敌方截码卡']
    const resultString =
      winner >= 0 ? `获胜者是【${teamNames[winner]}队】！` : '双方战成平局！'
    const gameMode = mode === 'game'
    const desUser = userList[desUsers[paperIndex]]
    const jiemiUser = userList[jiemiUsers[paperIndex]]
    const lanjieUser = userList[lanjieUsers[paperIndex]]
    const type = types[paperIndex]
    const jiemiStatus = battleData['jiemiStatus'][paperIndex]
    const lanjieStatus = battleData['lanjieStatus'][paperIndex]
    const jiamiStatus = battleData['jiamiStatus'][paperIndex]
    const currentBattle = battle[paperIndex] || []

    return (
      <View className="container">
        <AtMessage />
        {gameMode && (
          <View className="team-status">
            {teamNames.map((team, index) => {
              const baseIndex = index * 2
              return (
                <View className="team-title">
                  <Text style={{ marginRight: '10px' }}>{team}队</Text>
                  <UserItem data={userList[baseIndex]}></UserItem>
                  <UserItem data={userList[baseIndex + 1]}></UserItem>
                  <Text className="score">{sumList[index]}分</Text>
                </View>
              )
            })}
          </View>
        )}
        {gameMode && gameOver && (
          <View>
            <AtCard className="round-item battle-item over-card" title="结束">
              <View>
                <Text className="over-tip">{resultString}</Text>
              </View>
            </AtCard>
          </View>
        )}
        <View className={changePaper ? 'rotate-container' : ''}>
          <View className="title-box">
            <Text>{pageTitleMap[Math.abs(paperIndex - teamIndex)]}</Text>
          </View>
          {gameMode && (
            <View className="round-list">
              {showHistory.map((item: HistoryItem, index) => (
                <AtCard
                  className="round-item"
                  title={`回合 ${index + 1}`}
                  note={`${item.black ? '·解密失败' : ''} ${
                    item.red ? '·被拦截' : ''
                  }`}
                >
                  {(item.list as Array<BattleRow>).map((data, wordIndex) => (
                    <RoundItem
                      key={data.question}
                      data={data}
                      index={wordIndex}
                    ></RoundItem>
                  ))}
                </AtCard>
              ))}
            </View>
          )}
          {gameMode && !gameOver && (
            <View>
              <AtCard
                className="round-item battle-item"
                title={`当前回合 ${roundNumber + 1}`}
              >
                <View className="round-status">
                  <View className="row">
                    <Text className="left">加密者</Text>
                    <UserItem data={desUser}></UserItem>
                    {jiamiStatus && (
                      <AtIcon value="check" size="20" color="#009966"></AtIcon>
                    )}
                  </View>
                  <View className="row">
                    <Text className="left">解密者</Text>
                    <UserItem data={jiemiUser}></UserItem>
                    {jiemiStatus && (
                      <AtIcon value="check" size="20" color="#009966"></AtIcon>
                    )}
                  </View>
                  {lanjieUser && (
                    <View className="row">
                      <Text className="left">拦截者</Text>
                      <UserItem data={lanjieUser}></UserItem>
                      {lanjieStatus && (
                        <AtIcon
                          value="check"
                          size="20"
                          color="#009966"
                        ></AtIcon>
                      )}
                    </View>
                  )}
                </View>
                {!observeMode && (
                  <View>
                    <Text className="card-tip">
                      您处于【{type}】阶段，请【{type}】
                    </Text>
                    <View style={{ marginTop: '6px' }}>
                      {(currentBattle as Array<BattleRow>).map(
                        (data, wordIndex) => (
                          <RoundItem
                            key={data.question}
                            data={data}
                            index={wordIndex}
                            onAnswerChange={(...args) => {
                              this.updateAnswer.apply(this, args)
                            }}
                            onQuestionChange={(...args) => {
                              this.updateQuestion.apply(this, args)
                            }}
                            type={type}
                          ></RoundItem>
                        )
                      )}
                      {type !== '等待' && (
                        <AtButton
                          onClick={() => {
                            this.submit()
                          }}
                          loading={submitLoading}
                          disabled={submitLoading}
                          className="submit-btn"
                          type="primary"
                          size="normal"
                        >
                          提交
                        </AtButton>
                      )}
                    </View>
                  </View>
                )}
              </AtCard>
            </View>
          )}

          <View className="result-talbe">
            {showTable.map((item, index) => (
              <AtCard
                className={`table-item ${index % 2 === 1 ? 'grey' : ''}`}
                title={`${index + 1}\n${
                  paperIndex === teamIndex
                    ? teamWords[index]
                    : enemyWords[index]
                }`}
              >
                {gameMode &&
                  (item as Array<string>).map(text => (
                    <Word key={text} text={text}></Word>
                  ))}
              </AtCard>
            ))}
          </View>
        </View>
        <View className="rotate-btn">
          <AtFab
            onClick={() => {
              this.changePaper()
            }}
            size="small"
          >
            <Text className="at-fab__icon at-icon at-icon-repeat-play"></Text>
          </AtFab>
        </View>
        <View className="home-btn">
          <AtFab
            onClick={() => {
              this.gotoHome()
            }}
            size="small"
          >
            <Text className="at-fab__icon at-icon at-icon-home"></Text>
          </AtFab>
        </View>

        <View className="ad-box">
          <ad unit-id="adunit-ba222e7895349b2d"></ad>
        </View>
      </View>
    )
  }
}
