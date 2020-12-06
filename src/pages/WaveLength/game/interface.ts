export interface IState {
  answer: number; // 指针所指的角度
  rotating: boolean;
  selectIndex: number; // 0 正面，1 背面
  question: string;
  guessDirection: number;
  gameData: GameData | null;
  showHistory: boolean;
}

export interface GameData {
  _id: string;
  players: Player[];
  owner: string;
  start: boolean;
  startAt: Date;
  end: boolean;
  endAt: Date;
  winner: number; // 胜利队伍的index
  teams: Team[];
  round: Round;
  roundHistory: Round[];
  gameMode: string; // 游戏模式，1 竞争，2 合作
  // 额外属性
  isOwner: boolean;
  inGame: boolean;
  role: RoundRole;
  onlineStatus: Map<string, boolean>;
  countdown: number;
  tags: Tag[];
  // 合作模式
  roundCount: number;
  coComment: string;
}

export class Tag {
  text: string;
  red: boolean;
}
/**
 * 在一回合中的角色
 * -1 不在游戏中
 * 0 超能力者
 * 1 确定答案者（队友）
 * 2 确定猜测方向者（敌人）
 * 3 其他队友
 * 4 其他敌人
 */
export type RoundRole = -1 | 0 | 1 | 2 | 3 | 4;

export interface Round {
  status: number; // 回合阶段，0 超能力者提示阶段，1 队友猜测阶段，2 对方猜测阶段，3 公布结果并结束
  team: number; // 当前回合，超能力者所在的队伍index
  superman: number; // 当前回合，超能力者的玩家index
  answerman: number; // 当前回合，最终确定答案的玩家index
  guessman: number; // 当前回合，对方最终确定猜测方向的玩家index
  words: string[][];
  target: number; // 目标角度值
  selectWords?: number;
  question?: string; // 超能力者的提示
  answer?: number; // 队友猜测的角度值
  otherAnswers: Map<string, number>; // 其他队友猜测的角度值数组
  guessDirection?: number; // 对方猜测的方向，1 左侧，2 右侧
  otherGuessDirection: Map<string, number>; // 其他队友猜测的方向数组
  combo?: boolean; // 是否为连续的回合
  updateScores?: number[]; // 本回合产生的分数变化
  startAt: Date[];
}
export interface Team {
  teamPlayers: Player[];
  score: number;
  lastSuperman: number; // 上一个超能力者的玩家index
}

export interface Player {
  _id: string;
  userInfo: UserInfo;
}

interface UserInfo {
  nickName: string;
  avatarUrl: string;
}
