import { routerRedux } from 'dva/router';
import { message } from 'antd';
import { login, getMobileCaptcha, getPublicKeyByRandom, getImageCaptcha } from './service';
import { getPageQuery, setAuthority } from './utils/utils';
import { createAction, net } from 'nsc-framework-react-components/lib/utils/actions';
const Model = {
  namespace: 'userLogin',
  state: {
    publicKey: '',
    imgCaptcha: '',
  },
  effects: {
    /**
     * 根据随机数获取公钥
     * @param {*} param0 
     * @param {*} param1 
     */
    *getPublicKeyByRandom({ payload }, { call, put }) {
      const response = yield call(getPublicKeyByRandom, payload);
      if (net(response)) {
        yield put(createAction('updateState')({ publicKey: response.data }));
      }
    },
    /**
     * 获取图片验证码
     * @param {*} param0 
     * @param {*} param1 
     */
    *getImageCaptcha({ payload }, { call, put }) {
      const response = yield call(getImageCaptcha, payload);
      if (net(response)) {
        yield put(createAction('updateState')({ imgCaptcha: response }));
      }
    },
    /**
     * 根据手机号码获取公钥并发送短信验证码
     * @param {*} param0 
     * @param {*} param1 
     */
    *getMobileCaptcha({ payload }, { call, put }) {
      const response = yield call(getMobileCaptcha, payload);
      if (net(response)) {
        yield put(createAction('updateState')({ publicKey: response.data }));
      }
    },

    *login({ payload }, { call, put }) {
      const response = yield call(login, payload);
      if (net(response)) {
        //删除旧的token
        sessionStorage.removeItem('access_token');
        //登录成功
        message.success('登录成功');
        //保存 token
        sessionStorage.setItem('access_token', response.data.value);
        //跳转到首页
        yield put(
          routerRedux.push({
            pathname: '/',
          })
        );
      }
    },
  },
  reducers: {
    updateState(state, { payload }) {
      return { ...state, ...payload };
    }
  }
};
export default Model;
