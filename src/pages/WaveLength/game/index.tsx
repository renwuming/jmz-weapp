import Taro, { Component, Config } from '@tarojs/taro';
import { View, Text, Input } from '@tarojs/components';
import { AtBadge, AtButton, AtSlider, AtFab } from 'taro-ui';
import './index.scss';
import UserItem from '../../../components/UserItem';
import LoginBtn from '../../../components/loginBtn';
import { request } from '../../../api/wavelength';
import { GameData, IState, Player, Round, Team } from './interface';

export default class Index extends Component<any, IState> {
  updateGameDataTimer;
  rotatingFlag: boolean = false;

  config: Config = {
    navigationBarTitleText: '电波同步',
  };

  constructor() {
    super();
    this.state = {
      answer: 0,
      rotating: false,
      selectIndex: 0,
      question: '',
      guessDirection: -1,
      gameData: null,
    };
  }

  onShareAppMessage() {
    const { id } = this.$router.params;
    return {
      title: '快来体验新作品，电波同步！',
      path: `/pages/WaveLength/game/index?id=${id}`,
      imageUrl: 'https://cdn.renwuming.cn/static/wavelength/imgs/share.jpg',
    };
  }

  componentDidHide() {
    clearInterval(this.updateGameDataTimer);
  }
  componentWillUnmount() {
    clearInterval(this.updateGameDataTimer);
  }

  componentDidShow() {
    this.updateGameData();

    this.updateGameDataTimer = setInterval(() => {
      this.updateGameData();
    }, 1500);
  }

  async updateGameData() {
    const { id } = this.$router.params;
    const gameData = await request({
      method: 'GET',
      url: `/games/${id}`,
    });

    this.setState({
      gameData: {
        answer: 0, // 重置指针
        ...gameData,
      },
    });
  }

  // 未开始状态
  async joinRoom() {
    const { id } = this.$router.params;
    await request({
      method: 'POST',
      url: `/games/${id}/join`,
    });
  }
  async startGame() {
    const { id } = this.$router.params;
    const res = await request({
      method: 'POST',
      url: `/games/${id}/start`,
    });
    const { statusCode, message } = res;
    if (statusCode >= 400) {
      Taro.showToast({
        title: message,
        icon: 'none',
        duration: 2000,
      });
    }
  }
  async quitGame() {
    const { id } = this.$router.params;
    await request({
      method: 'POST',
      url: `/games/${id}/quit`,
    });
  }
  gotoHome() {
    Taro.reLaunch({
      url: `/pages/WaveLength/home/index`,
    });
  }

  // 游戏状态
  overturnCard(selectIndex) {
    this.setState({
      selectIndex: 1 - selectIndex,
    });
  }

  onQuestionChange(e) {
    const question = e.detail.value;
    this.setState({
      question,
    });
  }
  async submitQuestion() {
    const { id } = this.$router.params;
    const { question, selectIndex } = this.state;
    if (!question) {
      Taro.showToast({
        title: '请正确填写提示',
        icon: 'none',
        duration: 2000,
      });
      return;
    }

    await request({
      method: 'POST',
      url: `/games/${id}`,
      data: {
        selectWords: selectIndex,
        question,
      },
    });
  }

  async submitPointer() {
    const { id } = this.$router.params;
    const { answer } = this.state;

    await request({
      method: 'POST',
      url: `/games/${id}`,
      data: {
        answer,
      },
    });
  }

  async submitGuess() {
    const { id } = this.$router.params;
    const { guessDirection } = this.state;
    if (guessDirection < 0) {
      Taro.showToast({
        title: '请正确选择',
        icon: 'none',
        duration: 2000,
      });
      return;
    }

    await request({
      method: 'POST',
      url: `/games/${id}`,
      data: {
        guessDirection,
      },
    });
  }

  async changeGuessDirection(direction) {
    this.setState({
      guessDirection: direction,
    });
  }

  changePointer(e) {
    const { value } = e;
    this.setState({
      answer: value,
    });
  }

  handleGuessDirectionResult(
    otherGuessDirection: number[],
    round: Round,
    teams: Team[]
  ): Player[][] {
    const { team } = round;
    const result: Player[][] = [[], []];
    otherGuessDirection.forEach((direction, index) => {
      const player = teams[1 - team].teamPlayers[index];
      if (direction === 1) {
        result[0].push(player);
      } else if (direction === 2) {
        result[1].push(player);
      }
    });
    return result;
  }

  handleStageText(
    round: Round,
    teams: Team[]
  ): {
    text: string;
    player: Player;
  } {
    const { status, superman, guessman, answerman, team } = round;
    const stageMap = ['发射电波阶段：', '电波同步阶段：', '电波拦截阶段：'];
    const midTextMap = ['超能力者', '最终同步者', '最终拦截者'];
    const playerMap = [
      teams[team].teamPlayers[superman],
      teams[team].teamPlayers[answerman],
      teams[1 - team].teamPlayers[guessman],
    ];

    return {
      text: `${stageMap[status] || ''}${midTextMap[status] || ''}`,
      player: playerMap[status] || {},
    };
  }

  render() {
    const {
      answer,
      rotating,
      selectIndex,
      question,
      guessDirection,
      gameData,
    } = this.state;
    const {
      teams,
      round,
      start,
      players,
      owner,
      isOwner,
      inGame,
      role,
      winner,
    } = gameData as GameData;
    const {
      status,
      target,
      words,
      question: realQuestion,
      answer: realAnswer,
      otherGuessDirection,
      selectWords,
      // guessDirection: realGuessDirection,
    } = round || {};

    const guessDirectionResult = start
      ? this.handleGuessDirectionResult(otherGuessDirection, round, teams)
      : [];

    const stageData = start ? this.handleStageText(round, teams) : null;
    return gameData ? (
      <View className="wrapper">
        {start ? (
          <View className="game-container">
            <View className="team-list">
              <View className="team-item team-left">
                <Text>分数：{teams[0].score}</Text>
                <View className="team-box">
                  {teams[0].teamPlayers.map((player) => {
                    const { userInfo, _id } = player;
                    return (
                      <UserItem
                        nonick
                        data={{ id: _id, ...userInfo, online: true }}
                      ></UserItem>
                    );
                  })}
                </View>
              </View>
              <View className="team-item team-right">
                <Text>分数：{teams[1].score}</Text>
                <View className="team-box">
                  {teams[1].teamPlayers.map((player) => {
                    const { userInfo, _id } = player;
                    return (
                      <UserItem
                        nonick
                        data={{ id: _id, ...userInfo, online: true }}
                      ></UserItem>
                    );
                  })}
                </View>
              </View>
            </View>
            {winner || winner === 0 ? (
              <View className="notice-box">
                <Text>获胜队伍：</Text>
                <View className="team-box">
                  {teams[winner].teamPlayers.map((player) => {
                    const { userInfo, _id } = player;
                    return (
                      <UserItem
                        nonick
                        data={{ id: _id, ...userInfo, online: true }}
                      ></UserItem>
                    );
                  })}
                </View>
              </View>
            ) : (
              stageData && (
                <View className="notice-box">
                  <Text>{stageData.text}</Text>
                  <UserItem
                    nonick
                    data={{
                      id: stageData.player._id,
                      ...stageData.player.userInfo,
                      online: true,
                    }}
                  ></UserItem>
                </View>
              )
            )}
            <View
              className={`gaming-box ${winner || winner === 0 ? 'hidden' : ''}`}
            >
              {status === 0 && (
                <View className="turnplate-container">
                  {role === 0 && (
                    <View
                      className={`scores ${rotating ? 'rotating' : ''}`}
                      style={{
                        transform: `rotate(${target}deg)`,
                      }}
                    ></View>
                  )}
                  <View className="turnplate"></View>
                </View>
              )}
              {status === 1 && (
                <View className="turnplate-container">
                  <View className="turnplate"></View>
                  <View
                    className="pointer"
                    style={{
                      transform: `rotate(${answer}deg)`,
                    }}
                  ></View>
                </View>
              )}
              {status === 2 && (
                <View className="turnplate-container">
                  <View className="turnplate"></View>
                  <View
                    className="pointer"
                    style={{
                      transform: `rotate(${realAnswer}deg)`,
                    }}
                  ></View>
                </View>
              )}
              {status === 3 && (
                <View className="turnplate-container">
                  <View
                    className={`scores ${rotating ? 'rotating' : ''}`}
                    style={{
                      transform: `rotate(${target}deg)`,
                    }}
                  ></View>
                  <View className="turnplate"></View>
                  <View
                    className="pointer"
                    style={{
                      transform: `rotate(${answer}deg)`,
                    }}
                  ></View>
                </View>
              )}
              {words ? (
                <View
                  className={`card ${selectIndex === 1 ? 'back' : ''}`}
                  onClick={() => {
                    if (status === 0) this.overturnCard(selectIndex);
                  }}
                >
                  <View className="left">
                    {status === 0
                      ? words[selectIndex][0]
                      : words[selectWords as number][0]}
                  </View>
                  <View className="right">
                    {status === 0
                      ? words[selectIndex][1]
                      : words[selectWords as number][1]}
                  </View>
                </View>
              ) : (
                <View className={`card ${selectIndex === 1 ? 'back' : ''}`}>
                  <View className="left">???</View>
                  <View className="right">???</View>
                </View>
              )}
              {status === 0 && role === 0 && (
                <View>
                  <Input
                    className="question-input"
                    type="text"
                    onInput={(e) => {
                      this.onQuestionChange(e);
                    }}
                    value={question}
                  ></Input>
                  <AtButton
                    type="primary"
                    className="submit-btn"
                    onClick={() => {
                      this.submitQuestion();
                    }}
                  >
                    确定
                  </AtButton>
                </View>
              )}
              {status && status >= 1 && (
                <View>
                  <View className="question">{realQuestion}</View>
                </View>
              )}
              {status === 1 && [1, 3].includes(role) && (
                <View>
                  <AtSlider
                    className="slider"
                    step={1}
                    min={-76}
                    max={76}
                    value={answer}
                    onChanging={(e) => {
                      this.changePointer(e);
                    }}
                    onChange={(e) => {
                      this.changePointer(e);
                    }}
                  ></AtSlider>
                  <AtButton
                    type="primary"
                    className="submit-btn"
                    onClick={() => {
                      this.submitPointer();
                    }}
                  >
                    确定
                  </AtButton>
                </View>
              )}
              {status === 2 && (
                <View className="guess-box">
                  <View className="token-box">
                    <View className="token-item">
                      <View
                        className={`token ${
                          guessDirection === 1 ? 'selected' : ''
                        }`}
                        onClick={() => {
                          this.changeGuessDirection(1);
                        }}
                      ></View>
                      <View className="team-box">
                        {guessDirectionResult[0].map((player) => {
                          const { userInfo, _id } = player;
                          return (
                            <UserItem
                              nonick
                              data={{ id: _id, ...userInfo, online: true }}
                            ></UserItem>
                          );
                        })}
                      </View>
                    </View>
                    <View className="token-item right">
                      <View className="team-box">
                        {guessDirectionResult[1].map((player) => {
                          const { userInfo, _id } = player;
                          return (
                            <UserItem
                              nonick
                              data={{ id: _id, ...userInfo, online: true }}
                            ></UserItem>
                          );
                        })}
                      </View>
                      <View
                        className={`token ${
                          guessDirection === 2 ? 'selected' : ''
                        }`}
                        onClick={() => {
                          this.changeGuessDirection(2);
                        }}
                      ></View>
                    </View>
                  </View>
                  {[2, 4].includes(role) && (
                    <AtButton
                      type="primary"
                      className="submit-btn"
                      onClick={() => {
                        this.submitGuess();
                      }}
                    >
                      确定
                    </AtButton>
                  )}
                </View>
              )}
            </View>
          </View>
        ) : (
          <View className="room-container">
            <View className="player-box">
              {(players || []).map((player, index) => {
                const { userInfo, _id } = player;
                const ownerFlag = _id === owner;
                return (
                  <View className="player-row">
                    <Text className="index">{index + 1}</Text>
                    {ownerFlag ? (
                      <AtBadge value={'房主'}>
                        <UserItem
                          big={true}
                          data={{ id: _id, ...userInfo, online: true }}
                        ></UserItem>
                      </AtBadge>
                    ) : (
                      <UserItem
                        big={true}
                        data={{ id: _id, ...userInfo, online: true }}
                      ></UserItem>
                    )}
                  </View>
                );
              })}
            </View>
            {isOwner && (
              <AtButton
                className="menu-btn"
                circle
                type="primary"
                size="normal"
                onClick={() => {
                  this.startGame();
                }}
              >
                开始
              </AtButton>
            )}
            {!inGame && (
              <LoginBtn
                text={'加入房间'}
                className={'menu-btn'}
                callback={() => {
                  this.joinRoom();
                }}
              />
            )}
            {inGame && !isOwner && (
              <AtButton
                className="menu-btn"
                circle
                type="primary"
                size="normal"
                onClick={() => {
                  this.quitGame();
                }}
              >
                退出房间
              </AtButton>
            )}

            <View className="invite-btn">
              <AtFab
                onClick={() => {
                  // this.changePaper();
                }}
                size="small"
              >
                <AtButton size="normal" openType="share">
                  邀请朋友
                </AtButton>
              </AtFab>
            </View>
            <View className="home-btn">
              <AtFab
                onClick={() => {
                  this.gotoHome();
                }}
                size="small"
              >
                回首页
              </AtFab>
            </View>
          </View>
        )}
      </View>
    ) : null;
  }
}
