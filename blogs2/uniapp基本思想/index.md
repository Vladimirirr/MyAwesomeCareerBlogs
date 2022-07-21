# uniapp 基本思想

## 开发小程序的基本思想（简单描述）

> 以微信小程序为例，下面的小程序指的都是微信小程序，Vue 版本为 2.x

uniapp = 数据使用 vue 管理 + 视图依旧（也只能）由小程序管理

uniapp = 编译时（`.vue`转为`.wxml .wxss .js .json`，等） + 运行时（代理事件、生命周期，等）

小程序的 setData 相当于 React 的 setState，但是连续多次的 setData 不会合并，而且小程序的逻辑层和视图层相互独立，两者使用消息管道通信（会经过 native 层），所以每次 setData 都需要消耗很多的资源和时间。

要提高性能，优化 setData 是一个关键，有如下一些优化手段：

1. 减少 setData 的次数，降低通信频率：

   ```js
   setData({ x: 1 })
   setData({ y: 2 })
   ```

   合并两次 setData 为一次

   ```js
   setData({ x: 1, y: 2 })
   ```

2. 减少 setData 一次的数据量，降低通信成本：

   ```js
   const newList = [1, 2]
   setData({
     // 会传递全部的list，其实旧的list里面的元素不需要在再次传递了
     list: [...this.list, ...newList],
   })
   ```

   变成

   ```js
   setData({ // 只值传递新增的值，数组长度length会自动增加
     list[2]: 1,
     list[3]: 2,
   })
   ```

运行时的代理：

1. 代理小程序的事件（在编译时就被处理了，写在 vue 模板的事件被编译为对应的小程序事件名，再统一代理到事件处理方法）
   比如 vue 的
   `<button @click="titleChange()">clickme</button>`
   编译微信小程序是
   `<button data-event-opts="{{[['tap',[['titleChange']]]]}}" bindtap="__e">clickme</button>`
2. 代理小程序的生命周期（在编译时就被处理了，比如在小程序的 onReady 钩子里还将触发 vue 的 mounted 钩子）
3. diff 变化的数据，对最小数据变化量统一 setData

总结：

改写 vue 的 patch 方法，只 patch 数据，不需要 VNode 也不需要 render 函数了，删减了原本 vue 将近 30% 的代码量，最终依旧使用微信小程序自己的 setData 实现小程序试图的刷新，uniapp 改写的 patch 就是找出最小的数据变化量（即 json diff），一次性地 setData。
