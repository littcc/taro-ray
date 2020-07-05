import { RequestParams } from '@tarojs/taro';

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
}

export type HttpCodeBehavior = {
    [key: string]: {
        message: string;
        behavior: (data: BehaviorData) => boolean | void;
    };
};

export type Interceptor = Function;

export interface InitOption {
    baseUrl?: string;
    interceptors?: Interceptor[] | [];
    httpCodeBehavior?: HttpCodeBehavior;
    header?: {
        [key: string]: string | number;
    };
}
