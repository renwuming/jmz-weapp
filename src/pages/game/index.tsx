import Taro, { Component, Config } from '@tarojs/taro'
import { View, Text, Image, Button } from '@tarojs/components'
import {
  AtCard,
  AtButton,
  AtMessage,
  AtFab,
  AtIcon,
  AtBadge,
  AtCountdown,
  AtModal,
  AtModalContent,
  AtModalAction
} from 'taro-ui'
import RoundItem from '../../components/RoundItem'
import Word from '../../components/Word'
import UserItem from '../../components/UserItem'
import AD from '../../components/AD'
import './index.scss'
import { request } from '../../api'
import { connectWs, getData, listeningWs, closeWs } from '../../api/websocket'

let updateTimer

const submitTextMap = {
  加密: '传递情报',
  解密: '破译',
  拦截: '识破',
  等待: '等待'
}

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
  quickMode: boolean
  teamIndex: number
  resultMap: Array<any>

  paperIndex: number
  changePaper: boolean
  mode: string
  submitLoading: boolean // loading
}

let changePaperTimer

export default class Index extends Component<any, IState> {
  config: Config = {
    navigationBarBackgroundColor: '#eee'
  }

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
    quickMode: false,
    teamIndex: 0,
    resultMap: [{}, {}],

    paperIndex: 0,
    changePaper: false,
    actionPaperIndex: 0,
    submitLoading: false
  }

  onShareAppMessage() {
    const { id } = this.$router.params
    return {
      title: '我们正在玩截码战，速来围观！',
      path: `/pages/game/index?id=${id}`,
      imageUrl: 'http://cdn.renwuming.cn/static/jmz/share.jpg'
    }
  }

  updateGameData() {
    // 修正背景音乐状态
    this.getMusicStatus()
    const { gameOver } = this.state
    if (gameOver) return

    const { id } = this.$router.params

    // 通过websocket获取游戏数据
    getData(`game-${id}`)
  }

  // 将data更新到state
  updateDataToView(data) {
    const { id } = this.$router.params
    const { battle, ...otherData } = data
    // 只更新正确id的数据
    if (data.id !== id) {
      return
    }
    this.setState(otherData)
    // 根据玩家人数，设置mode
    this.initMode(data.userList.length)

    data.types.forEach((type, teamIndex) => {
      if (type === '解密' || type === '拦截') {
        if (this.waiting[teamIndex]) {
          this.waiting[teamIndex] = false
          this.news[teamIndex] = true
        }
        battle[teamIndex].forEach((item, index) => {
          item.answer = this.state.battle[teamIndex]
            ? this.state.battle[teamIndex][index].answer
            : -1
        })
        this.jiami[teamIndex] = false
      } else if (type === '加密') {
        if (this.waiting[teamIndex]) {
          this.waiting[teamIndex] = false
          this.news[teamIndex] = true
        }
        if (!this.jiami[teamIndex]) {
          this.jiami[teamIndex] = true
        } else {
          battle[teamIndex].forEach((item, index) => {
            item.question = this.state.battle[teamIndex]
              ? this.state.battle[teamIndex][index].question
              : ''
          })
        }
      } else {
        this.waiting[teamIndex] = true
        this.news[teamIndex] = false
        this.jiami[teamIndex] = false
      }
    })
    this.setState({
      battle
    })
  }

  componentDidHide() {
    clearInterval(updateTimer)
    // closeWs()
    // 停止背景音乐
    wx.stopBackgroundAudio({})
  }
  componentWillUnmount() {
    clearInterval(updateTimer)
    // 停止背景音乐
    wx.stopBackgroundAudio({})
  }

  componentDidShow() {
    // 是否处于加密状态
    this.jiami = [false, false]
    // 是否处于等待状态
    this.waiting = [true, true]
    // 是否有新操作
    this.news = [false, false]

    clearInterval(updateTimer)
    updateTimer = setInterval(() => {
      this.updateGameData()
    }, 2000)

    connectWs()

    listeningWs(res => {
      const { data } = res
      this.updateDataToView(JSON.parse(data))
    })
    this.updateGameData()
  }

  getMusicStatus(fn = () => {}) {
    wx.getBackgroundAudioPlayerState({
      success: data => {
        const { status } = data
        this.setState({
          music: status
        })
        fn(data)
      },
      fail: () => {
        fn({ status: 0 })
      }
    })
  }

  // 暂停/播放背景音乐
  changeMusicPower() {
    this.getMusicStatus(data => {
      const { status } = data
      if (status === 1) {
        wx.pauseBackgroundAudio()
        this.setState({
          music: 0
        })
      } else {
        // 播放背景音乐
        wx.playBackgroundAudio({
          dataUrl: 'http://cdn.renwuming.cn/static/jmz/music2.mp3',
          title: '截码战-music'
        })
        this.setState({
          music: 1
        })
      }
    })
  }

  initMode(length) {
    const mode = length > 1 ? 'game' : 'tool'
    this.setState({
      mode
    })
  }

  submit() {
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
      const questionList = currentBattle.map(item => {
        const { question } = item
        item.question = question.trim()
        return item.question
      })
      // 若有未填写的加密
      if (questionList.filter(n => !!n).length < 3) {
        Taro.atMessage({
          message: '请正确填写!',
          type: 'warning'
        })
        return
      }

      currentBattle.forEach(item => {
        item.answer = item.code
      })
    }

    this.setState({
      isOpenedSubmitTip: true,
      preSubmit: currentBattle
    })
  }

  // 确认提交加密/解密
  confirmSubmit() {
    const { id } = this.$router.params
    const { battle, types, paperIndex } = this.state
    const currentBattle = battle[paperIndex]
    const type = types[paperIndex]

    this.setState({
      submitLoading: true,
      isOpenedSubmitTip: false
    })

    // 处理提交内容
    if (type === '解密' || type === '拦截') {
      currentBattle.forEach(item => {
        item.question = ''
      })
    } else {
      currentBattle.forEach(item => {
        item.answer = -1
      })
    }

    request({
      method: 'POST',
      url: `/games/wx/${id}/submit`,
      data: {
        battle: currentBattle,
        battleIndex: paperIndex
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
      .catch(() => {
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
    }, 500)
  }

  gotoHome() {
    Taro.reLaunch({
      url: '/pages/home/index'
    })
  }

  render() {
    const {
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
      teamWords,
      enemyWords,
      paperIndex,
      observeMode,
      teamIndex,
      changePaper,
      resultMap,
      quickMode,
      countdownData,
      mode,
      isOpenedSubmitTip,
      preSubmit,
      stageName,
      music
    } = this.state
    // 处理倒计时
    if (countdownData) {
      const { time } = countdownData
      countdownData.minute = Math.floor(time / 60)
      countdownData.second = time % 60
    }

    const { submitLoading } = this.state
    const showTable = teamIndex === paperIndex ? table : tableEnemy
    const showHistory = teamIndex === paperIndex ? history : historyEnemy
    const pageTitleMap = [`${teamNames[0]}密电`, `${teamNames[1]}密电`]
    const resultString =
      winner >= 0 ? `${teamNames[winner]}获得胜利！` : '双方战成平局！'
    const gameMode = mode === 'game'
    const desUser = userList[desUsers[paperIndex]]
    const jiemiUser = userList[jiemiUsers[paperIndex]]
    const lanjieUser = userList[lanjieUsers[paperIndex]]
    const desUser2 = userList[desUsers[1 - paperIndex]]
    const jiemiUser2 = userList[jiemiUsers[1 - paperIndex]]
    const lanjieUser2 = userList[lanjieUsers[1 - paperIndex]]
    const type = types[paperIndex]
    const jiemiStatus = battleData['jiemiStatus'][paperIndex]
    const lanjieStatus = battleData['lanjieStatus'][paperIndex]
    const jiamiStatus = battleData['jiamiStatus'][paperIndex]
    const jiemiStatus2 = battleData['jiemiStatus'][1 - paperIndex]
    const lanjieStatus2 = battleData['lanjieStatus'][1 - paperIndex]
    const jiamiStatus2 = battleData['jiamiStatus'][1 - paperIndex]
    const currentBattle = battle[paperIndex] || []

    return (
      <View className={`container  bk${paperIndex}`}>
        <AtMessage />
        <AtModal
          isOpened={isOpenedSubmitTip}
          closeOnClickOverlay={true}
          onClose={() => {
            this.setState({
              isOpenedSubmitTip: false
            })
          }}
        >
          <AtModalContent className="submit-tip">
            {preSubmit.map(item => (
              <View className="detail-row">
                <Text className="left">{item.question}</Text>
                <Text className="right">
                  {item.answer + 1}{' '}
                  {paperIndex === teamIndex ? teamWords[item.answer] : ''}
                </Text>
              </View>
            ))}
          </AtModalContent>
          <AtModalAction>
            <Button
              onClick={() => {
                this.confirmSubmit()
              }}
            >
              提交！
            </Button>
          </AtModalAction>
        </AtModal>
        <View className="top-menu">
          <View className="top-bk"></View>
          <View
            className="menu-btn"
            onClick={() => {
              this.gotoHome()
            }}
          ></View>
        </View>
        {gameMode && (
          <View className="team-status">
            {teamNames.map((team, index) => {
              const baseIndex = index * 2
              const result = resultMap[index]
              const result2 = resultMap[1 - index]
              return (
                <View className={`team-title team${index}`}>
                  <View className="title-row">
                    <Image
                      src={`http://cdn.renwuming.cn/static/jmz/team-icon${index}.png`}
                    />
                    <Text className="title">{team}</Text>
                  </View>
                  <View className="detail-row">
                    <View className="user-list">
                      <UserItem data={userList[baseIndex]}></UserItem>
                      <UserItem data={userList[baseIndex + 1]}></UserItem>
                    </View>
                    <View className="score-list">
                      <Text className="sum-score">{result.sum}</Text>
                      <Text className="score">退回：</Text>
                      <Text className="score right">
                        {result.black > 0 ? '-' : ''}
                        {result.black}
                      </Text>
                      <Text className="score">识破：</Text>
                      <Text className="score right">{result2.red}</Text>
                    </View>
                  </View>
                </View>
              )
            })}
          </View>
        )}
        {gameMode && gameOver && (
          <View className={`over-card ${winner >= 0 ? 'team' + winner : ''}`}>
            <View
              className="img-btn-box"
              onClick={() => {
                this.changePaper()
              }}
            >
              <Image src="http://cdn.renwuming.cn/static/jmz/left-rotate.jpg" />
              <Text>切换密电卡</Text>
            </View>
            <Text className="over-tip">{resultString}</Text>
            <View
              className="img-btn-box right"
              onClick={() => {
                this.changeMusicPower()
              }}
            >
              <Image src="http://cdn.renwuming.cn/static/jmz/music.png" />
              <Text>音乐 {music === 1 ? '开' : '关'}</Text>
            </View>
          </View>
        )}
        {!gameOver && (
          <View className="stage-count-down-box">
            <View
              className="img-btn-box"
              onClick={() => {
                this.changePaper()
              }}
            >
              <Image src="http://cdn.renwuming.cn/static/jmz/left-rotate.jpg" />
              <Text>切换密电卡</Text>
            </View>
            {quickMode &&
              (countdownData.time > 0 ? (
                <View className="row">
                  <Text className="title">{countdownData.name}</Text>
                  <AtCountdown
                    className="count-down"
                    isCard
                    minutes={countdownData.minute}
                    seconds={countdownData.second}
                  />
                </View>
              ) : (
                <Text className="title">即将进入下一阶段...</Text>
              ))}
            {!quickMode && (
              <View className="row">
                <Text className="title">{stageName}</Text>
              </View>
            )}

            <View
              className="img-btn-box right"
              onClick={() => {
                this.changeMusicPower()
              }}
            >
              <Image src="http://cdn.renwuming.cn/static/jmz/music.png" />
              <Text>音乐 {music === 1 ? '开' : '关'}</Text>
            </View>
          </View>
        )}
        <View className="padding-container">
          <View className={changePaper ? 'rotate-container' : ''}>
            {gameOver && teamNames[0] && (
              <View className={`title-box title${paperIndex}`}>
                <Text>{pageTitleMap[paperIndex]}</Text>
              </View>
            )}
            {gameMode && !gameOver && (
              <View>
                <AtCard
                  className={`round-item battle-item team${paperIndex}`}
                  title={`第${roundNumber + 1}封 ${pageTitleMap[paperIndex]}卡`}
                  extra={`点击右下圆形按钮翻面\n查看【${
                    pageTitleMap[1 - paperIndex]
                  }卡】`}
                >
                  <View className="round-container">
                    <View className="round-status">
                      <View className="row-tip">
                        <Image src="http://cdn.renwuming.cn/static/jmz/mid-bk.png"></Image>
                        <Text className={`team${paperIndex}`}>
                          ▽ {paperIndex === teamIndex ? '我方' : '敌方'}密电进度
                        </Text>
                      </View>
                      <View className="row">
                        <Text className="left">加密者</Text>
                        <UserItem long={true} data={desUser}></UserItem>
                        {jiamiStatus ? (
                          <AtIcon
                            value="check"
                            size="20"
                            color="#009966"
                          ></AtIcon>
                        ) : (
                          <AtIcon
                            className="hidden"
                            value="check"
                            size="20"
                            color="#009966"
                          ></AtIcon>
                        )}
                      </View>
                      <View className="row">
                        <Text className="left">解密者</Text>
                        <UserItem long={true} data={jiemiUser}></UserItem>
                        {jiemiStatus && (
                          <AtIcon
                            value="check"
                            size="20"
                            color="#009966"
                          ></AtIcon>
                        )}
                      </View>
                      {lanjieUser && (
                        <View className="row">
                          <Text className="left">拦截者</Text>
                          <UserItem long={true} data={lanjieUser}></UserItem>
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
                    <View className="round-status right">
                      <View className="row-tip">
                        <Text className={`team${1 - paperIndex}`}>
                          ▽ {paperIndex === teamIndex ? '敌方' : '我方'}密电进度
                        </Text>
                      </View>
                      <View className="row">
                        <UserItem nonick={true} data={desUser2}></UserItem>
                        {jiamiStatus2 ? (
                          <AtIcon
                            value="check"
                            size="20"
                            color="#009966"
                          ></AtIcon>
                        ) : (
                          <AtIcon
                            className="hidden"
                            value="check"
                            size="20"
                            color="#009966"
                          ></AtIcon>
                        )}
                      </View>
                      <View className="row">
                        <UserItem nonick={true} data={jiemiUser2}></UserItem>
                        {jiemiStatus2 && (
                          <AtIcon
                            value="check"
                            size="20"
                            color="#009966"
                          ></AtIcon>
                        )}
                      </View>
                      {lanjieUser2 && (
                        <View className="row">
                          <UserItem nonick={true} data={lanjieUser2}></UserItem>
                          {lanjieStatus2 && (
                            <AtIcon
                              value="check"
                              size="20"
                              color="#009966"
                            ></AtIcon>
                          )}
                        </View>
                      )}
                    </View>
                  </View>

                  <View>
                    {observeMode ? (
                      <Text className="card-tip">您处于【旁观】状态</Text>
                    ) : (
                      <Text className="card-tip">
                        您处于【{submitTextMap[type]}】阶段，请【
                        {submitTextMap[type]}】
                      </Text>
                    )}
                    <View style={{ marginTop: '6px' }}>
                      {(currentBattle as Array<BattleRow>).map(
                        (data, wordIndex) => (
                          <RoundItem
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
                      {type !== '等待' &&
                        (!countdownData ||
                          (countdownData && countdownData.time > 0)) && (
                          <AtButton
                            onClick={() => {
                              this.submit()
                            }}
                            loading={submitLoading}
                            disabled={submitLoading}
                            className={`submit-btn team${paperIndex}`}
                            type="primary"
                            size="normal"
                          >
                            {submitTextMap[type]}
                          </AtButton>
                        )}
                    </View>
                  </View>
                </AtCard>
              </View>
            )}

            <View className={`result-talbe team${paperIndex}`}>
              {showTable.map((item, index) => (
                <AtCard
                  className={`table-item ${index % 2 === 1 ? 'grey' : ''}`}
                  title={`情报${index + 1}`}
                  extra={
                    paperIndex === teamIndex
                      ? teamWords[index]
                      : enemyWords[index]
                  }
                >
                  {gameMode &&
                    (item as Array<string>).map((text, index2) => (
                      <Word key={index * 10 + index2} text={text}></Word>
                    ))}
                </AtCard>
              ))}
            </View>

            {gameMode && (
              <View
                style={{
                  minHeight: '100px'
                }}
              >
                <View className={`round-list team${paperIndex}`}>
                  {showHistory.map((item: HistoryItem, index) => (
                    <AtCard
                      className="round-item"
                      title={`第${index + 1}封密电`}
                      note={`${item.black ? '·退回' : ''} ${
                        item.red ? '·被识破' : ''
                      }`}
                    >
                      {(item.list as Array<BattleRow>).map(
                        (data, wordIndex) => (
                          <RoundItem
                            data={{ teamIndex: paperIndex, ...data }}
                            index={wordIndex}
                          ></RoundItem>
                        )
                      )}
                    </AtCard>
                  ))}
                </View>

                {showHistory.length > 0 && (
                  <View className="tuli-container">
                    <View className="tuli">
                      <View className="block team0"></View>
                      <Text>{teamNames[0]}</Text>
                    </View>
                    <View className="tuli">
                      <View className="block key"></View>
                      <Text>正确情报</Text>
                    </View>
                    <View className="tuli">
                      <View className="block team1"></View>
                      <Text>{teamNames[1]}</Text>
                    </View>
                  </View>
                )}
              </View>
            )}
          </View>
          <View className="rotate-btn">
            <AtFab
              onClick={() => {
                this.changePaper()
              }}
              size="small"
            >
              {this.news && this.news[1 - paperIndex] && !gameOver ? (
                <AtBadge className="shake" value={'new'}>
                  <Image src="http://cdn.renwuming.cn/static/jmz/rotate-btn.png" />
                </AtBadge>
              ) : (
                <Image src="http://cdn.renwuming.cn/static/jmz/rotate-btn.png" />
              )}
            </AtFab>
          </View>
        </View>
        <AD />
      </View>
    )
  }
}
