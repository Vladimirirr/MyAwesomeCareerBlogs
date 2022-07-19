# JavaScript 实现 timeoutify、asyncify 和 promiseify

三个在 JavaScript 异步编程中常用的 ployfill 工具：

```js
function timeoutify(f, t) {
  //作用：对异步函数做超时检测，当异步函数在指定的时间内完成时才让它调用传入的回调
  let id = setTimeout(() => {
    id = undefined
  }, t)
  return function () {
    if (id) {
      //id还存在说明没有超时
      clearTimeout(id)
      f.apply(this, arguments)
    } else {
      //id是undefined说明超时了
      f(Error(`Refuse to execute the callback beacuse of Timeout.`))
    }
  }
}

function asyncify(f) {
  //作用：避免出现Zalgo竞态条件，使异步函数对回调的调用始终是异步调用
  let id, origin_f
  id = setTimeout(() => {
    //使用hack=setTimeout(0)检测回调是否被异步调用
    id = undefined
    if (f) {
      //能进入这个if语句，说明回调被同步调用
      f() //使用hack-setTimeout(0)对这个回调强制进行异步调用
    }
  }, 0)
  origin_f = f
  f = null
  return function _result() {
    //原理：当调用asyncify时，立刻进行setTimeout(0)倒计时，只有是同步调用，才会导致触发_result时id存在值
    if (id) {
      //id还存在说明出现了Zalgo，即这个回调被同步调用了，要避免这种情况
      f = origin_f.bind.apply(origin_f, [this].concat([].slice.call(arguments))) //arguments作为科里化参数
    } else {
      //已经是异步了，正常执行
      origin_f.apply(this, arguments)
    }
  }
}

function promiseify(f) {
  //作用：将一个传统的异步函数promise化
  /*
    传入的异步函数要求：
    1.最后一个参数是回调函数
    2.这个回调函数使用error-first风格
    promiseify返回一个新函数，新函数的参数列表移除了原函数参数列表的回调函数，其他参数相同
    */
  return function () {
    return new Promise((ok, fail) => {
      let args = [].slice.call(arguments)
      args.push(function (err, data) {
        //传入用于断定promise决议结果的函数作为原函数的回调函数
        if (err) fail(err) //ok和fail函数本身不返回值（即返回undefined）
        else ok(data)
      })
      f.apply(this, args)
    })
  }
}
```

> 2020-07-08
