# 其他杂项

## 路由与 URL

在 URL 上，你可以位于【一个文件】或【一个目录】，以【\】做区分，而在命令行模式下，你不能位于【一个文件】，永远只能位于【一个目录】，这是 URL 与命令行在路径处理上的最大区别，ReachRouter 使用命令行风格的路径在做路由导航，它忽视末尾的【\】，"\some\where\"被视作"\some\where"。

## 什么是 FaaS 和 Serverless

FaaS 是一种云计算理念，即无服务端计算(Serverless Computing)，用户只关注编写业务代码，而不需要去关心云服务器的配置（任务都交给云提供商），而 FaaS 则是 Serverless 的关键，通常 Serverless 提供商还会提供 BaaS(Backend as a Service)，诸如对象存储、传统数据库、消息机制等等。
最著名的 FaaS 即 AWS 的 Lambda(Run code without thinking about servers. Pay only for the compute time you consume.)，用户只需上传代码即可，服务端会自动帮你运行。

## axios 核心代码

```js
/**
 * 发送请求的核心axios方法，来自axios.0.19.2
 * @param {Object} config 请求的配置对象，与默认配置进行整合
 * @return {Promise} 返回一个promise对象表示此请求的结果
 */
Axios.prototype.request = function request(
  config = mergeConfig(this.defaults, config)
) {
  // 初始化请求的promise链
  // dispatchRequest在浏览器里就是XMLHttpRequest方法的封装
  // 如果一个promise的then的fulfillment为undefined，表示将结果继续传递下去
  // 如果一个promise的then的rejection为undefined，表示将错误继续抛出
  var chain = [dispatchRequest, undefined]

  // 初始化表示请求结果的promise
  var promise = Promise.resolve(config)

  // 将此请求的全部请求拦截器（在请求前的中间件）插入到chain前面
  this.interceptors.request.forEach(function unshiftRequestInterceptors(
    interceptor
  ) {
    chain.unshift(interceptor.fulfilled, interceptor.rejected)
  })

  // 将此请求的全部响应拦截器（在响应后的中间件）插入到chain后面
  this.interceptors.response.forEach(function pushResponseInterceptors(
    interceptor
  ) {
    chain.push(interceptor.fulfilled, interceptor.rejected)
  })

  // 激活整个promise链
  while (chain.length) {
    promise = promise.then(chain.shift(), chain.shift())
  }
  // 核心！promise链！
  // return (
  //  Promise.resolve(config)
  //  .then(requestInterceptor_2_fulfillment, requestInterceptor_2_rejection)
  //  .then(requestInterceptor_1_fulfillment, requestInterceptor_1_rejection)
  //  .then(dispatchRequest, undefined)
  //  .then(responseInterceptor_1_fulfillment, responseInterceptor_1_rejection)
  //  .then(responseInterceptor_2_fulfillment, responseInterceptor_2_rejection)
  // )
  // 返回表示请求结果的promise

  return promise
}
```

## 跨域请求

在一个请求即将被返回时，如果 web 服务器发现这是一个跨域请求，将直接把它的响应体置空（如果有的话），同时浏览器端也会发现此请求是跨域请求，向控制台报错，同时不予显示 response 面板。
通过 wireshark 抓包，发现跨域请求和普通请求一样有来（请求）有回（响应），只是响应体不再包含任何内容。
