# 函数式编程

简单描述：数据**流经**由**纯函数**组成的**管道**，最终得到结果。

举例：

```js
_.chain(originData) // 对此数据开启管道流
  .filter((i) => i.success) // 第一个纯函数，也是管道流的第一个中间件
  .mapKeys( // 第二个中间件
    (val, key) => (key === 'path' && val.startsWith('/') ? 'fullpath' : key)
  )
  .value() // 计算出最终的结果
```

**TODO**
