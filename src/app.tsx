import '@tarojs/async-await';
import Taro, { Component, Config } from '@tarojs/taro';
import Index from './pages/game/index';
import 'taro-ui/dist/style/index.scss';
import './app.scss';
import { validate } from './api';

// 如果需要在 h5 环境中开启 React Devtools
// 取消以下注释：
// if (process.env.NODE_ENV !== 'production' && process.env.TARO_ENV === 'h5')  {
//   require('nerv-devtools')
// }

class App extends Component {
  /**
   * 指定config的类型声明为: Taro.Config
   *
   * 由于 typescript 对于 object 类型推导只能推出 Key 的基本类型
   * 对于像 navigationBarTextStyle: 'black' 这样的推导出的类型是 string
   * 提示和声明 navigationBarTextStyle: 'black' | 'white' 类型冲突, 需要显示声明类型
   */
  config: Config = {
    pages: [
      'pages/home/index',
      'pages/room/index',
      'pages/game/index',
      'pages/gamelist/index',
      'pages/about/index',
      'pages/imglist/index',
      'pages/addword/index',
      'pages/onlineMatch/index',
      'pages/hall/index',
      'pages/createRoom/index',
      'pages/ranking/index',
      // 波长
      'pages/WaveLength/home/index',
      'pages/WaveLength/game/index',
    ],
    window: {
      backgroundTextStyle: 'light',
      navigationBarBackgroundColor: '#eef5ff',
      navigationBarTitleText: '截码战',
      navigationBarTextStyle: 'black',
    },
    navigateToMiniProgramAppIdList: ['wx78bc21b55d1cc0c5'],
  };

  componentDidShow() {
    validate();
  }

  // 在 App 类中的 render() 函数没有实际作用
  // 请勿修改此函数
  render() {
    return <Index />;
  }
}

Taro.render(<App />, document.getElementById('app'));
