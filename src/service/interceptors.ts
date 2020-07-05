import { Chain } from '@tarojs/taro';
import defaultsDeep from 'lodash/defaultsDeep';
import trim from 'lodash/trim';
import { pathToRegexp, compile } from 'path-to-regexp';

import { AnyObject } from './interface.d';
import { TaroRay } from './request';

const STATUS_CODE = {
  ok: 200,
};

/**
 * 格式化接口地址
 * @param {string} relPath - 相对地址，支持声明路径参数，会通过 params 中的数据进行格式化处理
 * @param {object} params - 参数对象，若其中有参数被注入到了 url 中，则会将该参数从对象中移除
 * @return {string} 完整的接口地址
 */
function formatPath(relPath: string, params: AnyObject): string {
  const relPathKeys = [];
  const relPathParams: AnyObject = {};

  relPath = trim(relPath);

  if (relPath === '/') {
    relPath = '';
  }

  // 将路径参数移到 relPathParams 中
  pathToRegexp(relPath, relPathKeys);
  relPathKeys.forEach(keyMatch => {
    const { name } = keyMatch;

    relPathParams[name] = params[name];
    delete params[name];
  });

  // 格式化相对地址
  relPath = compile(relPath)(relPathParams);

  return relPath;
}

// 初始化会格式化url地址, 并用默认参数合并传入的参数
const init = async (chain: Chain) => {
  const { requestParams } = chain;
  const { data, url } = requestParams;
  let formatUrl = url;

  try {
    formatUrl = `${TaroRay.baseUrl}${formatPath(url, data)}`;
  } catch (error) {
    throw Error(`data 中缺少 url 所需必要的参数值) 或 ${error}`);
  }

  const options = defaultsDeep(
    {},
    {
      url: formatUrl,
    },
    requestParams,
    {
      header: {
        ...TaroRay.header,
      },
    }
  );

  return chain.proceed(options)
};

// 处理默认的 http 错误
const httpCodeHandle = (chain: Chain) => {
  const { requestParams } = chain;
  return chain
    .proceed(requestParams)
    .then(response => {
      const { data, statusCode } = response;
      if (statusCode !== STATUS_CODE.ok) {
        // 如果传入了自定义的默认错误消息, 将会走默认的错误消息提示
        const detail = defaultsDeep(
          {},
          TaroRay.httpCodeBehavior[statusCode],
          typeof data === 'string' ? { message: data } : data
        );
        const { behavior } = detail;
        behavior && behavior(detail);
        return Promise.reject({
          error: detail,
          response,
          responseData: data,
          chain,
        });
      }
      return Promise.resolve({
        responseData: data,
        error: null,
        response,
      });
    })
    .catch(error => {
      return Promise.reject({
        isRequestError: true,
        error,
      });
    });
};

export { init, httpCodeHandle };
export default { init, httpCodeHandle };
