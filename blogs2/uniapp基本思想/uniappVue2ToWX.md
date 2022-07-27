# `uniapp(vue2) -> 微信小程序` 打包输出的项目源码分析

环境：
HBuilder 3.4.18.20220630
uniapp 编译器版本：

- "@dcloudio/uni-template-compiler": "^2.0.1-34920220630001" 内置了 vue-template-compiler，用于编译.vue 文件
- "@dcloudio/uni-mp-vue": "^2.0.1-34920220630001" 修改版的 vue，下面简称 uni-vue2
- "@dcloudio/uni-mp-weixin": "^2.0.1-34920220630001" uniapp 在微信小程序的运行时（运行时代理）

微信开发者工具 1.06.2206090，基本库 >= 1.4.4

## uniapp(vue2) 空模板项目

`/pages/index/index.vue`: 普通页面，vue 单文件的`template`、`script`和`style`将生成对应的`.wxml`、`.js`和`.wxss`微信小程序文件

`/main.js`: uniapp 的入口，初始化 vue 实例，定义全局组件、过滤器、混入，安装插件，等等的初始化操作

`/App.vue`: uniapp 的页面容器，所有的页面都在此组件下进行切换，它本身不渲染任何页面（它没有`template`，即便写了`template`也会被忽略），`script`能定义应用级别的生命周期（比如`onLaunch`），`style`定义全局样式

`/pages.json`: 页面路由配置表

`/uni.scss`: 基础的样式变量，相当于`:root{ --uni-color-success: #4cd964; }`

`/manifest.json`: 应用的配置文件，里面包含了公共配置、h5+app（uniapp 开发原生 APP）和各端小程序的配置集合，微信小程序的配置是`mp-weixin`字段

`/unpackage/dist`: 打包的目录地址

`/static`: 静态文件目录

`/.hbuilderx`: 类似于.vscode

`/.hbuilderx/launch.json`: 在 HBuilder 里启动项目相关的配置

`/index.html`: 只有当使用 uniapp 开发 h5 时才有效

对 main.js 和 App.vue 的详细说明：

main.js 和 App.vue 的`script`字段都将编译到`/common/main.js`，就是单独把 main.js（和它的引用，即 App.vue）打包到 main.js。

App.vue 的`style`字段将编译到`/common/main.wxss`，这里包含一些能共用的全局样式（比如`.w100: { width: 100vw; }`），不要使用`scoped`。

## 空模板编译的结果

`/common/runtime.js`: 初始化 uni-app 的运行时，初始化运行时的全局方法和常量，安装 webpack 的 jsonp 加载器，以加载动态分包的 chunk.js

`/common/vender.js`: node_modules 运行时依赖，默认的包：

1. 适用于微信小程序的运行时`@dcloudio/uni-mp-weixin`，包括：
   1. 一些 polyfill（比如`Promise.finally`）和工具方法（比如`promiseify`）
   2. 得到当前小程序需要的国际化支持（比如得到当前的语言）
   3. 对微信小程序 api 的一些高层封装
   4. 对 uni-vue2 做修改，以支持不同设备不同小程序版本，初始化 Vue（比如挂载工具方法到 Vue.prototype）
   5. 生成一份关于当前小程序和它的运行环境的清单列表（比如`appName`、`osVersion`）
2. 国际化支持`@dcloudio/uni-i18n`
3. 基于 vue2 改装的适用于微信小程序的`@dcloudio/vue-cli-plugin-uni/packages/mp-vue`框架，即 uni-vue2
4. 一个 vue2-sfc-compiler，`@dcloudio/vue-cli-plugin-uni/packages/vue-loader`

`/common/main.js`: 入口，来自于 uniapp 项目的 main.js，一个 App.vue 的容器实例，它将作为微信小程序的 app.js，在这里会调用微信小程序的 App 构造函数来初始化应用

`/common/main.wxss`: 全局样式，来自于 uniapp 项目的 App.vue 的 style，以及其他页面不带 scoped 的样式

`/pages/index`: index 页面的目录，由 vue 文件使用`@dcloudio/uni-template-compiler`编译而来

`/pages/index/index.wxml`: 页面的结构，vue 的 template 的 -> wxml

`/pages/index/index.js`: 逻辑

`/pages/index/index.wxss`: 样式

`/pages/index/index.json`: 配置

`/static`

`/app.js`: `require('./commom/runtime.js'); require('./commom/vendor.js'); require('./commom/main.js');`

`/app.json`

`/app.wxss`: `@import './common/main.wxss'; [data-hidden]{ display: none !important; }`

`/project.config.json`

`/project.private.config.json`

`/sitemap.json`

每个 vue 的 template 编译行为：

```vue
<template>
  <view class="content">
    <image class="logo" src="/static/logo.png"></image>
    <view class="contentaArea">
      <text class="title" v-model="title">{{ title + '!' }}</text>
      <button @click="titleChange()">clickme</button>
      <view v-if="title === 'hello'">v-if test</view>
      <view v-show="title === 'hello'">v-show test</view>
      <view v-for="i in 5" v-text="i"></view>
    </view>
  </view>
</template>
```

根据此 template 对应的 render 函数编译得到：

```xml
<view class="content">
  <image class="logo" src="/static/logo.png"></image>
  <view class="contentaArea">
    <text
      value="{{title}}"
      data-event-opts="{{[['input',[['__set_model',['','title','$event',[]]]]]]}}"
      bindinput="__e"
      class="title"
    >
      {{title+'!'}}
    </text>
    <!-- attr里面的{{}}相当于vue的v-bind:attr -->
    <!-- [['tap',[['titleChange']]]].toString() === 'tap,titleChange' -->
    <!-- button的data-event-opts值是'tap,titleChange' -->
    <button data-event-opts="{{[['tap',[['titleChange']]]]}}" bindtap="__e">clickme</button>
    <!-- block组件相当于React的Fragment组件 -->
    <block wx:if="{{title==='hello'}}">
      <view>v-if test</view>
    </block>
    <view hidden="{{!(title==='hello')}}">v-show test</view>
    <block wx:for="{{5}}" wx:for-item="i" wx:for-index="__i0__">
      <view>{{i}}</view>
    </block>
  </view>
</view>
```

每个 vue 的 script 编译行为：根据 script 导出的组件，对此组件执行来自于 uni-mp-weixin 的 createPage 方法（传入此组件）：

```js
const createPage = (vuePageOptions) => Component(parsePage(vuePageOptions))
```

parsePage：得到一个符合微信小程序 Component 构造器的配置项
Component：得到一个微信小程序的组件
现代的微信小程序的页面也是一个组件，可以使用组件表示页面，但是此时需要在此页面的 json 配置文件里面写明`usingComponent: true`

所以 index.vue 打包的 index.js 里的第一个依赖模块直接使用 IIFE 执行了一次微信小程序的 Component 构造函数，注册了此组件。

`/common/main.js` 的第一个也是 IIFE，它将执行 createApp 方法：

```js
const vueVm = new Vue({ ...options, ...defaultOptions })
const createApp = (vueVm) => App(parseApp(vueVm))
```

parseApp：得到符合 App 构造函数的配置项

## 原生微信小程序的空模板目录

`/pages/demo/index.js.json.wxml.wxss`: demo 页面的目录，都以 index 命名的四个文件：
`index.wxml`

```xml
<!--index.wxml-->
<view class="indexContainer">
  <button bindtap="tap11">测试setData</button>
  <button bindtap="tap22" class="username">{{username}}</button>
</view>
```

`index.js`

```js
// index.js
const app = getApp() // get app instance from `app.js` in the top level of the project

Page({
  data: {
    username: 'nat',
  },
  tap11() {
    const originValue = this.data.username
    this.setData({
      username: 'jack',
    })
    const testResult =
      originValue === this.username
        ? 'setData update by async'
        : 'setData update by sync'
    console.log(testResult) // output 'setData update by sync'
    // 微信小程序的setData都是同步调用！！！
  },
  async tap22(e) {
    console.log(e)
    console.log(await this.getUserAge())
  },
  onLoad() {},
  async getUserAge() {
    // 模拟一下 api
    return 22
  },
})
```

`index.wxss`

```css
/**index.wxss**/
.indexContainer {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: red;
}
.username {
  color: black;
}
```

`index.json`

```json
{
  "navigationBarTitleText": "小程序的title",
  "usingComponents": {} // 自定义组件注册列表，key组件名，value组件路径
}
```

`/pages/demo2/demo2.js.json.wxml.wxss`: 同上，也可以是和目录名相同的四个文件

`/utils/utils.js`: 一些工具方法，使用`module.exports`导出语法

`/app.js`: 小程序启动的入口，执行`App({ ...options })`初始化小程序

`/app.json`: 小程序的全局配置，比如导航栏的颜色

`/app.wxss`: 小程序的全局样式

`/project.config.json`: 项目配置文件

`/project.private.config.json`: 私有项目配置文件，类似于.env.local

`/sitemap.json`: 对微信小程序搜索平台的爬虫开放的信息，类似于 robots.txt

## CSS scoped 的改变

改用`module.css`的风格，比如

```css
<style scoped>
.foo{
  color: red;
}
</style>
```

编译为

```css
.foo.data-v-472cff63 {
  color: red;
}
```

## 自定义组件

微信自定义的组件需要在它的 json 配置文件写明`component: true`，表示是一个自定义组件。
需要导入的自定义组件也要在 json 配置文件写明，可以直接在 wxml 里面使用：

```json
{
  "usingComponents": {
    "component-name": "/path/to/component/component-name"
  }
}
```

在 uniapp 使用 vue 写的自定义组件，将使用

```js
global.webpackJsonp.push([
  '/path/to/component/compoent-name',
  createComponent(componentOptions),
])
```

createComponent 来自于 uni-mp-weixin，

```js
const createComponent = (vueOptions) => Component(parseComponent(vueOptions))
```
