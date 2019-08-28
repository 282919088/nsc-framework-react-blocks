import { request } from 'nsc-framework-react-components/lib/utils';
import config from 'nsc-framework-react-components/lib/config';
let { authorization } = config();
/**
 * 根据随机数获取公钥
 * @param {随机数} random
 */
export async function getPublicKeyByRandom(random) {
  return request(`/api/encrypt/rsa/${random}`);
}

/**
 * 获取随机验证码 返回验证码图片
 * @param {随机数} random
 */
export async function getImageCaptcha(random) {
  return request(`/api/captcha/image/${random}`);
}

/**
 * 根据手机号码获取公钥并发送短信验证码
 * @param {手机号码} mobile
 */
export async function getMobileCaptcha(mobile) {
  return request(`/api/captcha/sms/${mobile}`);
}

/**
 * 登录
 * @param {参数} params
 */
export async function login(params) {
  return request('/api/signin', {
    method: 'POST',
    headers: {
      Authorization: authorization,
    },
    data: params,
  });
}