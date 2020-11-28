import Taro, { Component, Config } from '@tarojs/taro';
import { View, Text, Input } from '@tarojs/components';
import {
  AtBadge,
  AtButton,
  AtSlider,
  AtFab,
  AtFloatLayout,
  AtTag,
} from 'taro-ui';
import './index.scss';
import UserItem from '../../../components/WaveLength/UserItem';
import LoginBtn from '../../../components/loginBtn';
import RoundHistoryItem from '../../../components/WaveLength/RoundHistoryItem';
import PlayerHandler from '../../../components/WaveLength/PlayerHandler';
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
      showHistory: false,
    };
  }

  onShareAppMessage() {
    const { id } = this.$router.params;
    return {
      title: '电波同步中，看看我们是否在同一频率！',
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
    }, 1000);
  }

  async updateGameData() {
    const { id } = this.$router.params;
    const gameData = await request({
      method: 'GET',
      url: `/games/${id}`,
    });

    // 根据回合状态重置一些参数
    const { start, round } = gameData;
    let resetState: any = {};
    if (start) {
      const { status } = round;
      if (status !== 0) {
        resetState.question = '';
        resetState.selectIndex = 0;
      }
      if (status !== 1) {
        resetState.answer = 0;
      }
    }
    this.setState({
      ...resetState,
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

    Taro.showModal({
      content: '确定提交吗？',
      success: function (res) {
        if (res.confirm) {
          request({
            method: 'POST',
            url: `/games/${id}`,
            data: {
              selectWords: selectIndex,
              question,
            },
          });
        }
      },
    });
  }

  async submitPointer() {
    const { id } = this.$router.params;
    const { answer } = this.state;

    Taro.showModal({
      content: '确定提交吗？',
      success: function (res) {
        if (res.confirm) {
          request({
            method: 'POST',
            url: `/games/${id}`,
            data: {
              answer,
            },
          });
        }
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

    Taro.showModal({
      content: '确定提交吗？',
      success: function (res) {
        if (res.confirm) {
          request({
            method: 'POST',
            url: `/games/${id}`,
            data: {
              guessDirection,
            },
          });
        }
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
    otherGuessDirection: Map<string, number> = new Map<string, number>(),
    round: Round,
    teams: Team[]
  ): Player[][] {
    const { team } = round;
    const result: Player[][] = [[], []];
    Object.keys(otherGuessDirection).forEach((id) => {
      const direction = otherGuessDirection[id];
      const player = teams[1 - team].teamPlayers.find(
        (player) => player._id === id
      );
      if (!player) return;
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
  handleHistory(visible: boolean) {
    this.setState({
      showHistory: visible,
    });
  }

  render() {
    const { id: gameID } = this.$router.params;
    const {
      answer,
      rotating,
      selectIndex,
      question,
      guessDirection,
      gameData,
      showHistory,
    } = this.state;
    const {
      teams,
      round,
      start,
      end,
      players,
      owner,
      roundHistory,
      isOwner,
      inGame,
      role,
      winner,
      onlineStatus,
      countdown,
      gameMode,
      tags,
    } = gameData as GameData;
    const {
      status,
      target,
      words,
      question: realQuestion,
      answer: realAnswer,
      otherGuessDirection,
      selectWords,
    } = round || {};

    const CoMode = gameMode === '2'; // 合作模式

    const guessDirectionResult = start
      ? this.handleGuessDirectionResult(otherGuessDirection, round, teams)
      : [];

    const stageData = start ? this.handleStageText(round, teams) : null;

    const teamPlayers0 = start ? teams[0].teamPlayers : [];
    const teamPlayers1 = start ? teams[1].teamPlayers : [];
    const winTeam = end && winner >= 0 ? teams[winner] : null;
    const roundIndex = roundHistory.length;

    return gameData ? (
      <View className="wrapper">
        {start ? (
          <View className="game-container">
            {CoMode ? (
              <View className="team-list co-team-list">
                <View className="img"></View>
                <View className="co-team-box">
                  <Text>
                    回合数：<Text className="score">{roundIndex}</Text>
                    <Text className="score"> / 7</Text>
                  </Text>
                  <Text>
                    分数：<Text className="score">{teams[0].score}</Text>
                    <Text className="score"> / 16</Text>
                  </Text>
                  <View className="team-box">
                    {teamPlayers0.map((player) => {
                      const { userInfo, _id } = player;
                      return (
                        <UserItem
                          nonick
                          data={{
                            id: _id,
                            ...userInfo,
                            online: onlineStatus[_id],
                          }}
                        ></UserItem>
                      );
                    })}
                  </View>
                </View>
                <View className="img right"></View>
              </View>
            ) : (
              <View className="team-list">
                <View className="team-item team-left">
                  <Text>
                    分数：<Text className="score">{teams[0].score}</Text>
                  </Text>
                  <View className="team-box">
                    {teamPlayers0.map((player) => {
                      const { userInfo, _id } = player;
                      return (
                        <UserItem
                          nonick
                          data={{
                            id: _id,
                            ...userInfo,
                            online: onlineStatus[_id],
                          }}
                        ></UserItem>
                      );
                    })}
                  </View>
                </View>
                <View className="team-item team-right">
                  <Text>
                    分数：<Text className="score">{teams[1].score}</Text>
                  </Text>
                  <View className="team-box">
                    {teamPlayers1.map((player) => {
                      const { userInfo, _id } = player;
                      return (
                        <UserItem
                          nonick
                          data={{
                            id: _id,
                            ...userInfo,
                            online: onlineStatus[_id],
                          }}
                        ></UserItem>
                      );
                    })}
                  </View>
                </View>
              </View>
            )}
            {winner || winner === 0 ? (
              CoMode ? (
                <View className="notice-box result-box">
                  {winner === 0 ? (
                    <Text className="success">胜利</Text>
                  ) : (
                    <Text>失败</Text>
                  )}
                </View>
              ) : winTeam ? (
                <View className="notice-box">
                  <Text className="success">胜利队伍</Text>
                  <View className="team-box">
                    {winTeam.teamPlayers.map((player) => {
                      const { userInfo, _id } = player;
                      return (
                        <UserItem
                          nonick
                          data={{ id: _id, ...userInfo }}
                        ></UserItem>
                      );
                    })}
                  </View>
                </View>
              ) : (
                <View className="notice-box">
                  <Text>双方平局</Text>
                </View>
              )
            ) : (
              stageData && (
                <View>
                  <View className="notice-box">
                    <Text>{stageData.text}</Text>
                    <UserItem
                      nonick
                      data={{
                        id: stageData.player._id,
                        ...stageData.player.userInfo,
                      }}
                    ></UserItem>
                  </View>
                  {countdown >= 0 && (
                    <View className="notice-box">
                      <Text>
                        <Text className="score">
                          {countdown.toString().padStart(2, '0')}
                        </Text>
                        秒
                      </Text>
                    </View>
                  )}
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
              {!CoMode && status === 2 && (
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
                    className="scores"
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
              {status === 1 && role === 1 && (
                <View className="slider-box">
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
              {!CoMode && status === 2 && (
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
                              data={{ id: _id, ...userInfo }}
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
                              data={{ id: _id, ...userInfo }}
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
                <View className="question">{realQuestion}</View>
              )}
            </View>
            {(winner || winner === 0) && (
              <View className="history-box">
                {roundHistory
                  .concat()
                  .reverse()
                  .map((round, index) => (
                    <RoundHistoryItem
                      index={roundHistory.length - index}
                      round={round}
                      teams={teams}
                      CoMode={CoMode}
                      handleGuessDirectionResult={
                        this.handleGuessDirectionResult
                      }
                    />
                  ))}
              </View>
            )}
            <View className="invite-btn gaming">
              <AtFab size="small">
                <AtButton size="normal" openType="share">
                  邀请旁观
                </AtButton>
              </AtFab>
            </View>
            <View className="home-btn gaming">
              <AtFab
                onClick={() => {
                  this.gotoHome();
                }}
                size="small"
              >
                回首页
              </AtFab>
            </View>
            {!(winner || winner === 0) && roundHistory.length > 0 && (
              <View className="history-btn">
                <AtFab
                  onClick={() => {
                    this.handleHistory(true);
                  }}
                  size="small"
                >
                  回合列表
                </AtFab>
              </View>
            )}
            <AtFloatLayout
              isOpened={showHistory}
              title="回合列表"
              onClose={() => {
                this.handleHistory(false);
              }}
            >
              {roundHistory
                .concat()
                .reverse()
                .map((round, index) => (
                  <RoundHistoryItem
                    index={roundHistory.length - index}
                    round={round}
                    teams={teams}
                    CoMode={CoMode}
                    handleGuessDirectionResult={this.handleGuessDirectionResult}
                  />
                ))}
            </AtFloatLayout>
          </View>
        ) : (
          <View className="room-container">
            <View className="status-row">
              {tags.map((tag) => {
                const { text, red } = tag;
                return (
                  <AtTag className={red ? 'red' : ''} type="primary" circle>
                    {text}
                  </AtTag>
                );
              })}
            </View>
            <View className="player-box">
              {(players || []).map((player, index) => {
                const { userInfo, _id } = player;
                const ownerFlag = _id === owner;
                return (
                  <View className="player-row">
                    <Text className="index">{index + 1}</Text>
                    {ownerFlag ? (
                      <AtBadge value={'房主'}>
                        <View className="row">
                          <UserItem
                            big={true}
                            data={{
                              id: _id,
                              ...userInfo,
                              online: onlineStatus[_id],
                            }}
                          ></UserItem>
                          {isOwner && (
                            <PlayerHandler
                              gameID={gameID}
                              owner={owner}
                              player={player}
                            />
                          )}
                        </View>
                      </AtBadge>
                    ) : (
                      <View className="row">
                        <UserItem
                          big={true}
                          data={{
                            id: _id,
                            ...userInfo,
                            online: onlineStatus[_id],
                          }}
                        ></UserItem>
                        {isOwner && (
                          <PlayerHandler
                            gameID={gameID}
                            owner={owner}
                            player={player}
                          />
                        )}
                      </View>
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
              <AtFab size="small">
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
