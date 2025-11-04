// JS Hunter - Injected Script (捕获eval和动态代码执行)

(function () {
  'use strict';

  // 保存原始函数
  const originalEval = window.eval;
  const originalFunction = window.Function;
  const originalSetTimeout = window.setTimeout;
  const originalSetInterval = window.setInterval;

  /**
   * 发送消息到content script
   */
  function notifyEval(code, type) {
    try {
      const stack = new Error().stack;
      window.postMessage(
        {
          type: 'JS_HUNTER_EVAL_DETECTED',
          payload: {
            code: String(code),
            evalType: type,
            stack: stack,
            url: window.location.href,
            timestamp: Date.now(),
          },
        },
        '*'
      );
    } catch (error) {
      console.error('Error notifying eval:', error);
    }
  }

  /**
   * 拦截eval
   */
  window.eval = function (code) {
    notifyEval(code, 'eval');
    return originalEval.call(this, code);
  };

  /**
   * 拦截Function构造器
   */
  window.Function = function (...args) {
    const code = args[args.length - 1];
    notifyEval(code, 'Function');
    return originalFunction.apply(this, args);
  };

  /**
   * 拦截setTimeout (字符串参数)
   */
  window.setTimeout = function (handler, ...args) {
    if (typeof handler === 'string') {
      notifyEval(handler, 'setTimeout');
    }
    return originalSetTimeout.call(this, handler, ...args);
  };

  /**
   * 拦截setInterval (字符串参数)
   */
  window.setInterval = function (handler, ...args) {
    if (typeof handler === 'string') {
      notifyEval(handler, 'setInterval');
    }
    return originalSetInterval.call(this, handler, ...args);
  };

  console.log('JS Hunter: Eval interceptor injected');
})();
