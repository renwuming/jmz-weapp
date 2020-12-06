import Taro, { Component } from '@tarojs/taro';
import { View, Text } from '@tarojs/components';
import './index.scss';
import { Round, Team } from 'src/pages/WaveLength/game/interface';
import UserItem from '../../../components/WaveLength/UserItem';
import LongText from '../../../components/LongText';

interface IProps {
  index: number;
  round: Round;
  teams: Team[];
  CoMode: boolean; // 是否合作模式
  handleGuessDirectionResult: Function;
  handleAnswersResult: Function;
}

export default class Index extends Component<IProps, any> {
  componentDidHide() {}
  componentWillUnmount() {}
  componentDidShow() {}

  render() {
    const {
      index,
      round,
      teams,
      CoMode,
      handleGuessDirectionResult,
      handleAnswersResult,
    } = this.props;
    const {
      answer,
      target,
      question,
      team,
      superman,
      answerman,
      guessman,
      words,
      selectWords,
      guessDirection,
      otherAnswers,
      otherGuessDirection,
      updateScores,
      combo,
    } = round;

    const guessDirectionResult = handleGuessDirectionResult(
      otherGuessDirection,
      round,
      teams
    );

    const answerDirectionResult = handleAnswersResult(
      otherAnswers,
      round,
      teams
    );

    const supermanUser = teams[team].teamPlayers[superman];
    const answermanUser = teams[team].teamPlayers[answerman];
    const guessmanUser = teams[1 - team].teamPlayers[guessman];
    return (
      <View className="row-col container">
        <Text className="title">
          第 <Text className="score">{index}</Text> 回合
        </Text>
        <View className="row">
          <View className="turnplate-container">
            <View
              className={`scores ${CoMode ? 'co-scores' : ''}`}
              style={{
                transform: `rotate(${target}deg)`,
              }}
            ></View>
            <View className="turnplate"></View>
            {answerDirectionResult.map((item) => {
              const { player, answer } = item;
              return (
                <View
                  className="other-answers"
                  style={{
                    transform: `rotate(${answer}deg)`,
                  }}
                >
                  <UserItem
                    nonick
                    data={{ id: player._id, ...player.userInfo }}
                  ></UserItem>
                  <View className="line"></View>
                </View>
              );
            })}
            <View
              className="pointer"
              style={{
                transform: `rotate(${answer}deg)`,
              }}
            ></View>
            <View
              className="other-answers"
              style={{
                transform: `rotate(${answer}deg)`,
              }}
            >
              <UserItem
                strong
                nonick
                data={{
                  id: answermanUser._id,
                  ...answermanUser.userInfo,
                }}
              ></UserItem>
            </View>
          </View>
          <View className="row-col round-info">
            <View className="row">
              <View className="card">
                <View className="left">{words[selectWords as number][0]}</View>
                <View className="right">{words[selectWords as number][1]}</View>
              </View>
            </View>
            <View className="row">
              <View className="question">
                <LongText text={question} />
              </View>
              <UserItem
                nonick
                data={{
                  id: supermanUser._id,
                  ...supermanUser.userInfo,
                  online: true,
                }}
              ></UserItem>
            </View>
            <View className="row score-box">
              <Text className="text">最终同步者</Text>
              <UserItem
                nonick
                data={{
                  id: answermanUser._id,
                  ...answermanUser.userInfo,
                  online: true,
                }}
              ></UserItem>
              <Text className="score">+{(updateScores as number[])[team]}</Text>
            </View>
            {!CoMode && (
              <View className="row score-box">
                <Text className="text">最终拦截者</Text>
                <UserItem
                  nonick
                  data={{
                    id: guessmanUser._id,
                    ...guessmanUser.userInfo,
                    online: true,
                  }}
                ></UserItem>
                <Text className="score">
                  +{(updateScores as number[])[1 - team]}
                </Text>
              </View>
            )}
            {combo && (
              <View className="row score-box">
                <Text className="text bonus">额外的回合！</Text>
              </View>
            )}
          </View>
        </View>
        {!CoMode && (
          <View className="row guess-box">
            <View className="token-box">
              <View className="token-item">
                <View
                  className={`token ${guessDirection === 1 ? 'selected' : ''}`}
                ></View>
                <View className="team-box">
                  {guessDirection === 1 && (
                    <View className="border">
                      <UserItem
                        strong
                        nonick
                        data={{
                          id: guessmanUser._id,
                          ...guessmanUser.userInfo,
                          online: true,
                        }}
                      ></UserItem>
                    </View>
                  )}
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
                  {guessDirection === 2 && (
                    <View className="border">
                      <UserItem
                        strong={true}
                        nonick
                        data={{
                          id: guessmanUser._id,
                          ...guessmanUser.userInfo,
                          online: true,
                        }}
                      ></UserItem>
                    </View>
                  )}
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
                  className={`token ${guessDirection === 2 ? 'selected' : ''}`}
                ></View>
              </View>
            </View>
          </View>
        )}
      </View>
    );
  }
}
