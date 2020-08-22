import * as Taro from '@tarojs/taro';
import defaultsDeep from 'lodash/defaultsDeep';
import defaults from 'lodash/defaults';

import { Request, MessageConfig, Ray } from '../../@types';
import { init, httpCodeHandle } from './interceptors';

const METHODS = ['get', 'post', 'put', 'patch', 'delete'];
const DEFAULT_MESSAGE_CONFIG = {
  loading: {
    title: '加载中...',
    icon: 'loading',
    duration: 60000,
    mask: true,
    showToast: true,
  },
  error: {
    title: '出错啦！请稍后重试！',
    icon: 'none',
    mask: true,
    duration: 1500,
    showToast: true,
    redirectToErrorPage: '',
  },
};

const request: Request = {
  request: async (params: Taro.RequestParams, messageConfig: MessageConfig): Promise<any> => {
    const { loading: loadingConfig, error: errorConfig } = defaultsDeep({}, messageConfig, DEFAULT_MESSAGE_CONFIG);
    loadingConfig.showToast && Taro.showToast(loadingConfig);
    const res = await Taro.request(params)
      .then(response => {
        loadingConfig.showToast && Taro.hideToast();
        return response;
      })
      .catch(e => {
        const { error = {}, message } = e;
        let errorMessage = message || error.message;
        const options = defaults(errorConfig, { title: errorMessage });
        setTimeout(() => {
          errorConfig.showToast && Taro.showToast(options);
          if (errorConfig.redirectToErrorPage) {
            Taro.redirectTo({ url: `${errorConfig.redirectToErrorPage}?msg=${options.title}` });
          }
        }, 100);
        loadingConfig.showToast && Taro.hideToast();
        return Promise.reject(e);
      });
    return res;
  },
} as Request;

METHODS.forEach((key: string) => {
  request[key] = async (params: Taro.RequestParams, messageConfig: MessageConfig = {}): Promise<any> => {
    const options = Object.assign({}, { ...params }, { method: key });
    const res = await request.request(options, messageConfig);
    return res;
  };
});

export const TaroRay: Ray = {
  baseUrl: '',
  interceptors: [],
  httpCodeBehavior: {},
  header: {},
  init({ baseUrl = '', interceptors = [], httpCodeBehavior = {}, header = {} }) {
    this.baseUrl = baseUrl;
    this.interceptors = interceptors;
    this.httpCodeBehavior = httpCodeBehavior;
    this.header = header;
    [init, ...interceptors, httpCodeHandle].forEach(interceptor => Taro.addInterceptor(interceptor));
    return request;
  },
};

export default TaroRay;
