/**
 * 封装FormId组件，以提供向服务端发送formId的功能
 */
import Taro, { Component } from '@tarojs/taro'
import { AtButton } from 'taro-ui'
import { Form } from '@tarojs/components'
import './index.scss'

interface IProps {
  text: String
  onClick: Function
}

export default class FormIdBtn extends Component<IProps, any> {
  constructor(props) {
    super(props)
  }
  /**
   * formSubmit()
   * @description 提交formId到后端服务器
   * @param {*} e event对象
   */
  formSubmit(e) {
    // 打印在控制台
    // console.info('formId:', e.detail.formId)
    // 模态框展示
    // Taro.showModal({
    //   title: 'formId',
    //   content: e.detail.formId,
    //   showCancel: false
    // })
  }
  render() {
    let { text, onClick } = this.props
    return (
      <Form className="form" reportSubmit={true} onSubmit={this.formSubmit}>
        <AtButton
          className="menu-btn"
          circle
          type="primary"
          size="normal"
          onClick={onClick}
          formType="submit"
        >
          {text}
        </AtButton>
      </Form>
    )
  }
}
