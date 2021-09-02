import { RequestParams, Chain, addInterceptor, showToast, request as Q, hideToast, redirectTo } from '@tarojs/taro';
import defaultsDeep from 'lodash/defaultsDeep';
import defaults from 'lodash/defaults';
// import trim from 'lodash/trim';
// import { pathToRegexp, compile } from 'path-to-regexp';
import { formatPath } from 'going-merry';

export interface AnyObject {
  [key: string]: any;
}

export interface MessageConfig {
  loading?: {
    title?: string;
    icon?: string;
    duration?: number;
    mask?: boolean;
    showToast?: boolean;
  };
  error?: {
    title?: string;
    icon?: string;
    mask?: boolean;
    duration?: number;
    showToast?: boolean;
    redirectToErrorPage?: string;
  };
}

export interface Request extends AnyObject {
  request: (params: RequestParams, messageConfig?: MessageConfig) => Promise<any>;
  get: (params: RequestParams, messageConfig?: MessageConfig) => Promise<any>;
  post: (params: RequestParams, messageConfig?: MessageConfig) => Promise<any>;
  put: (params: RequestParams, messageConfig?: MessageConfig) => Promise<any>;
  patch: (params: RequestParams, messageConfig?: MessageConfig) => Promise<any>;
  delete: (params: RequestParams, messageConfig?: MessageConfig) => Promise<any>;
}

export interface BehaviorData {
  [key: string]: any;
  error:
    | boolean
    | {
        [key: string]: string;
      }
    | null;
  response: {
    header: {
      [key: string]: string;
    };
    data: any;
    statusCode: number;
  };
  responseData: any;
  isRequestError?: boolean;
}

export type HttpCodeBehavior = {
  [key: string]: {
    message: string;
    behavior: (data: BehaviorData) => boolean | void;
  };
};

export type Interceptor = (chain: Chain) => Promise<any>;

interface Language {
  loading: string;
  defaultError: string;
}
type Locale = 'zh-cn' | 'en';

const LANGUAGES = new Map<Locale, Language>([
  [
    'zh-cn',
    {
      loading: '加载中...',
      defaultError: '出错啦！请稍后重试!',
    },
  ],
  [
    'en',
    {
      loading: 'Loading...',
      defaultError: 'failed, please try again later!',
    },
  ],
]);

export interface Ray {
  baseUrl: string;
  interceptors: Interceptor[] | [];
  httpCodeBehavior: HttpCodeBehavior;
  header: {
    [key: string]: string | number;
  };
  init: (option: InitOption) => Request;
  locale?: Locale;
}

export interface InitOption {
  baseUrl?: string;
  interceptors?: Interceptor[] | [];
  httpCodeBehavior?: HttpCodeBehavior;
  header?: {
    [key: string]: string | number;
  };
  locale?: Locale;
}

const STATUS_CODE = {
  ok: 200,
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
        chain,
      });
    })
    .catch(error => {
      const { status } = error;

      if (status !== STATUS_CODE.ok) {
        // 如果传入了自定义的默认错误消息, 将会走默认的错误消息提示
        const detail = defaultsDeep({}, TaroRay.httpCodeBehavior[status]);
        const { behavior } = detail;
        behavior && behavior(detail);
        return Promise.reject({
          isRequestError: true,
          error: detail,
          chain,
        });
      }
      return Promise.reject({
        isRequestError: true,
        chain,
        error,
      });
    });
};

const METHODS = ['get', 'post', 'put', 'patch', 'delete'];

let DEFAULT_MESSAGE_CONFIG = {};
let DEFAULTERROR = '';

const request: Request = {
  request: async (params: RequestParams, messageConfig: MessageConfig): Promise<any> => {
    const { loading: loadingConfig, error: errorConfig } = defaultsDeep({}, messageConfig, DEFAULT_MESSAGE_CONFIG);
    loadingConfig.showToast && showToast(loadingConfig);
    const res = await Q(params)
      .then(response => {
        loadingConfig.showToast && hideToast();
        return response;
      })
      .catch(e => {
        const { error = {}, message } = e;
        const title = errorConfig.title || message || error.message || DEFAULTERROR;
        const options = defaults({ title }, errorConfig);
        setTimeout(() => {
          errorConfig.showToast && showToast(options);
          if (errorConfig.redirectToErrorPage) {
            redirectTo({ url: `${errorConfig.redirectToErrorPage}?msg=${options.title}` });
          }
        }, 100);
        loadingConfig.showToast && hideToast();
        return Promise.reject(e);
      });
    return res;
  },
} as Request;

METHODS.forEach((key: string) => {
  request[key] = async (params: RequestParams, messageConfig: MessageConfig = {}): Promise<any> => {
    const options = Object.assign({}, { ...params }, { method: key });
    const res = await request.request(options, messageConfig);
    return res;
  };
});

// 初始化会格式化url地址, 并用默认参数合并传入的参数
const initInterceptor = async (chain: Chain) => {
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

  return chain.proceed(options);
};

export const TaroRay: Ray = {
  baseUrl: '',
  interceptors: [],
  httpCodeBehavior: {},
  header: {},
  locale: 'zh-cn',
  init({ baseUrl = '', interceptors = [], httpCodeBehavior = {}, header = {}, locale = 'zh-cn' }) {
    this.baseUrl = baseUrl;
    this.interceptors = interceptors;
    this.httpCodeBehavior = httpCodeBehavior;
    this.header = header;
    this.locale = locale;
    const language = LANGUAGES.get(locale) as Language;

    DEFAULTERROR = language?.defaultError;
    DEFAULT_MESSAGE_CONFIG = {
      loading: {
        title: language?.loading,
        icon: 'loading',
        duration: 60000,
        mask: true,
        showToast: true,
      },
      error: {
        icon: 'none',
        mask: true,
        duration: 1500,
        showToast: true,
        redirectToErrorPage: '',
      },
    };
    [initInterceptor, ...interceptors, httpCodeHandle].forEach(interceptor => addInterceptor(interceptor));
    return request;
  },
};

export default TaroRay;
