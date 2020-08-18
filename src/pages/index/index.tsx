import React, { Component } from 'react';
import Taro, { Chain } from '@tarojs/taro';
import { View, Button } from '@tarojs/components';
// import { TaroRay } from 'taro-ray';

// TODO 测试
// import { TaroRay } from '../../../lib';
import TaroRay from '../../service';

const codeErrorBehavior = {
  default: {
    message: '出错啦！请稍后重试！',
  },
  // TODO example
  xxx: {
    message: '接口METHOD类型似乎错误了',
    behavior: res => {
      Taro.showModal({
        title: '错误',
        content: '接口METHOD类型似乎错误了',
        complete: () => {
          console.log(res);
        },
      });
    },
  },
};

const httpCodeBehavior = {
  404: {
    message: '测试404',
    behavior: detail => {
      console.log(detail, detail);
    },
  },
};

const responseCodeErrorHandle = (chain: Chain) => {
  const { requestParams } = chain;
  return chain.proceed(requestParams).catch(error => {
    const { code } = error;
    const { behavior } = codeErrorBehavior[code] || { behavior: null, message: '' };
    behavior && behavior(error);

    return Promise.reject(error);
  });
};

const errorHandle = (chain: Chain) => {
  const { requestParams } = chain;
  return chain
    .proceed(requestParams)
    .then(({ responseData }) => {
      const { data, code } = responseData;
      if (code !== '0000') {
        return Promise.reject(responseData);
      }
      return data;
    })
    .catch(error => {
      return Promise.reject(error);
    });
};

const urls = {
  h5: '/api',
  weapp: 'http://${url}',
  url: '/v2',
};

const getUrlOfTaroEnv = () => {
  return urls[process.env.TARO_ENV] || urls.weapp;
};

const request = TaroRay.init({
  baseUrl: getUrlOfTaroEnv(),
  header: {
    'content-type': 'application/json',
  },
  httpCodeBehavior,
  interceptors: [
    responseCodeErrorHandle,
    errorHandle,
    function (chain) {
      const { requestParams } = chain;
      return chain.proceed(requestParams).then(response => {
        // TODO 什么也不干 打印一下数据
        console.log(response);
        return response;
      });
    },
  ],
});

export default class Index extends Component {
  onRequest = () => {
    request
      .get({
        url: urls.url,
      })
      .then(response => {
        console.log('页面返回数据', response);
      });
  };

  onRequest1 = () => {
    request
      .post({
        url: '/api/grocery',
        data: {
          id: 111,
          name: 222,
          age: 333,
        },
        header: {
          a: '1111',
        },
      })
      .then(response => {
        console.log('页面返回数据', response);
      });
  };
  render() {
    return (
      <View className='index'>
        <Button onClick={this.onRequest}>请求</Button>
        <Button onClick={this.onRequest1}>POST请求</Button>
      </View>
    );
  }
}
