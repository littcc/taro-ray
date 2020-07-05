// 抹平微信、支付宝request方法错误信息字段不一致的问题
const flattedRequestError = error => {
  return { message: error.errMsg || error.errorMessage || '未知错误', ...error };
};

export { flattedRequestError };

export default { flattedRequestError };
