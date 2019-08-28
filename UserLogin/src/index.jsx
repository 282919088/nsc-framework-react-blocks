import { Alert, Checkbox } from 'antd';
import { FormattedMessage, formatMessage } from 'umi-plugin-react/locale';
import React, { Component } from 'react';
import { connect } from 'dva';
import LoginComponents from './components/Login';
import styles from './style.less';
import { randomLetterAndNums } from 'nsc-framework-react-components/lib/utils/utils';
import { createAction } from 'nsc-framework-react-components/lib/utils/actions';
import JSEncrypt from 'jsencrypt';
const { Tab, UserName, Password, Mobile, Captcha, Submit, CaptchaImage } = LoginComponents;

class UserLogin extends Component {
  loginForm = undefined;
  state = {
    type: 'account',
    autoLogin: true,
    imgUrl: '',
    publicRandom: ''
  };
  changeAutoLogin = e => {
    this.setState({
      autoLogin: e.target.checked,
    });
  };
  handleSubmit = (err, values) => {
    const { type, publicRandom, captchaRandom } = this.state;
    const { userLogin, dispatch } = this.props;
    const { publicKey } = userLogin;
    if (!err) {
      // 手机登录
      if (type === 'mobile') {
        const formData = new FormData();
        formData.append('mobile', values.mobile);
        formData.append('signinType', '201');
        formData.append('captchaRandom', captchaRandom);
        formData.append('captcha', values.captcha);
        formData.append('type', 'mobile');
        dispatch(createAction('userLogin/login')(formData));
      }
      // 账户登录
      if (type === 'account') {
        // 加密
        let crypt = new JSEncrypt();
        crypt.setPublicKey(publicKey);
        const formData = new FormData();
        formData.append('username', values.username);
        formData.append('password', crypt.encrypt(values.password));
        formData.append('signinType', '201');
        formData.append('publicRandom', publicRandom);
        formData.append('captchaRandom', captchaRandom);
        formData.append('captcha', values.captcha);
        formData.append('type', 'account');
        dispatch(createAction('userLogin/login')(formData));
      }
    }
  };
  onTabChange = type => {
    this.setState({
      type,
    });
  };
  onGetCaptcha = () =>
    new Promise((resolve, reject) => {
      if (!this.loginForm) {
        return;
      }

      this.loginForm.validateFields(['mobile'], {}, (err, values) => {
        if (err) {
          reject(err);
        } else {
          const { dispatch } = this.props;
          dispatch({
            type: 'userLogin/getMobileCaptcha',
            payload: values.mobile,
          })
            .then(resolve)
            .catch(reject);
        }
      });
    });
  renderMessage = content => (
    <Alert
      style={{
        marginBottom: 24,
      }}
      message={content}
      type="error"
      showIcon
    />
  );

  /**
   * 随机数生成公钥
   */
  _handleRandomPublicKey() {
    //生成随机数
    const random = randomLetterAndNums();
    this.setState({ publicRandom: random });
    //服务器获取公钥
    this.props.dispatch(createAction('userLogin/getPublicKeyByRandom')(random));
  }

  /**
  * 加载完成
  */
  componentDidMount() {
    const random = randomLetterAndNums();
    this.setState({ imgUrl: `/api/captcha/image/${random}`, captchaRandom: random });
    this._handleRandomPublicKey();
  }

  render() {
    const {  submitting } = this.props;
    const { type, autoLogin, imgUrl } = this.state;
    return (
      <div className={styles.main}>
        <LoginComponents
          defaultActiveKey={type}
          onTabChange={this.onTabChange}
          onSubmit={this.handleSubmit}
          ref={form => {
            this.loginForm = form;
          }}
        >
          <Tab
            key="account"
            tab={formatMessage({
              id: 'userlogin.login.tab-login-credentials',
            })}
          >
            <UserName
              name="username"
              placeholder={`${formatMessage({
                id: 'userlogin.login.userName',
              })}`}
              rules={[
                {
                  required: true,
                  message: formatMessage({
                    id: 'userlogin.userName.required',
                  }),
                },
              ]}
            />
            <Password
              name="password"
              placeholder={`${formatMessage({
                id: 'userlogin.login.password',
              })}`}
              rules={[
                {
                  required: true,
                  message: formatMessage({
                    id: 'userlogin.password.required',
                  }),
                },
              ]}
              onPressEnter={() =>
                this.loginForm && this.loginForm.validateFields(this.handleSubmit)
              }
            />
            <CaptchaImage
              name="captcha"
              imgUrl={imgUrl}
              placeholder={formatMessage({
                id: 'userlogin.verification-code.placeholder',
              })}
              rules={[
                {
                  required: true,
                  message: formatMessage({
                    id: 'userlogin.verification-code.required',
                  }),
                },
              ]}
              onCaptchaPress={() => {
                const random = randomLetterAndNums();
                this.setState({
                  imgUrl: `/api/captcha/image/${random}`,
                  captchaRandom: random,
                });
              }}
            />
          </Tab>
          <Tab
            key="mobile"
            tab={formatMessage({
              id: 'userlogin.login.tab-login-mobile',
            })}
          >
            <Mobile
              name="mobile"
              placeholder={formatMessage({
                id: 'userlogin.phone-number.placeholder',
              })}
              rules={[
                {
                  required: true,
                  message: formatMessage({
                    id: 'userlogin.phone-number.required',
                  }),
                },
                {
                  pattern: /^1\d{10}$/,
                  message: formatMessage({
                    id: 'userlogin.phone-number.wrong-format',
                  }),
                },
              ]}
            />
            <Captcha
              name="captcha"
              placeholder={formatMessage({
                id: 'userlogin.verification-code.placeholder',
              })}
              countDown={120}
              onGetCaptcha={this.onGetCaptcha}
              getCaptchaButtonText={formatMessage({
                id: 'userlogin.form.get-captcha',
              })}
              getCaptchaSecondText={formatMessage({
                id: 'userlogin.captcha.second',
              })}
              rules={[
                {
                  required: true,
                  message: formatMessage({
                    id: 'userlogin.verification-code.required',
                  }),
                },
              ]}
            />
          </Tab>
          <div>
            <Checkbox checked={autoLogin} onChange={this.changeAutoLogin}>
              <FormattedMessage id="userlogin.login.remember-me" />
            </Checkbox>
            <a style={{ float: 'right' }} href="#" >
              <FormattedMessage id="userlogin.login.forgot-password" />
            </a>
          </div>
          <Submit loading={submitting}>
            <FormattedMessage id="userlogin.login.login" />
          </Submit>
          {/* <div className={styles.other}>
            <FormattedMessage id="userlogin.login.sign-in-with" />
            <Icon type="alipay-circle" className={styles.icon} theme="outlined" />
            <Icon type="taobao-circle" className={styles.icon} theme="outlined" />
            <Icon type="weibo-circle" className={styles.icon} theme="outlined" />
            <Link className={styles.register} to="#">
              <FormattedMessage id="userlogin.login.signup" />
            </Link>
          </div> */}
        </LoginComponents>
      </div>
    );
  }
}

export default connect(({ userLogin, loading }) => ({
  userLogin,
  submitting: loading.effects['userLogin/login'],
}))(UserLogin);
