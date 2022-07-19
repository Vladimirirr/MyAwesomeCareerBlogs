# 浏览器与服务器长连接技术

浏览器和服务器保持持久连接的手段。

## 定时器

最简单，使用 setTimeout、setInterval 或其他计时手段定期向服务器发送请求，此方法优点就是简单，缺点就是不灵活，容易造成大量没有意义的请求，而且，如果网络某段时刻拥塞，那么上一个请求就会覆盖本次请求，导致旧的数据覆盖了新的数据。

## 长轮询

浏览器向服务器发出一个请求，服务器收到请求并将这个请求挂起(pending)，当服务器需要向浏览器发送数据了，就响应挂起的这个请求，浏览器收到响应之后立刻再发送一个请求，服务器再把它挂起，如此反复，即实现了最简单的长轮询机制，它不需要任何新的协议。
适合 B/S 不频繁的通信，因为即便是很小的数据量，也要重新发送一个完整的 http 请求。
浏览器端代码：

```js
function validHttpStatus() {
  return arguments[0] > 199 && arguments[0] < 300
}
async function longPolling() {
  let response = await fetch('http://localhost:3000/getdata')
  if (!validHttpStatus(response.status)) {
    // 发生了错误，打印一下错误
    console.error(`${response.url}: ${response.statusText}`)
    setTimeout(longPolling, 1e3) // 过一会再试
  } else {
    // 打印出服务器返回的数据
    let data = await response.text()
    console.info(data)
    // 立刻再次调用，保持连接一直处于打开状态
    longPolling()
  }
}
longPolling() // 开始长轮询
```

服务器端代码：

```js
// 使用了Koa
function delay(seconds) {
  return new Promise((ok) => setTimeout(ok, 1e3 * seconds))
}
router.get('/getdata', async (ctx, next) => {
  ctx.set('Access-Control-Allow-Origin', '*')
  ctx.set('Content-Type', 'text/plain; charset=utf-8')
  ctx.set('Cache-Control', 'no-store') // 禁用缓存
  await delay(Math.floor(Math.random() * 10) + 1) // 模拟服务器突然向浏览器响应数据
  ctx.body = 'hi ' + new Date()
  await next()
})
```

## Server Sent Event

规范文档: https://html.spec.whatwg.org/multipage/server-sent-events.html#the-eventsource-interface
浏览器内建的 EventSource 构造函数能创建一个对应的实例，只有 IE 全系列不支持。
支持 SSE 的服务器使用`text/event-stream`格式推送消息。
约束：

1. 只能由服务器向浏览器推送数据，浏览器不能主动向服务器发送数据
2. 推送的数据只能是文本

SSE 使用的也是 http 协议，它可以自动重连，而 websocket 需要我们手动处理重连，对于单向的且数据量不多的情景可以使用 SSE，没必要强行使用 websocket。
浏览器端代码：

```js
function start() {
  var eventSource = new EventSource('http://localhost:3000/getdata')
  eventSource.onmessage = function (e) {
    // 或addEventListener
    console.log('a new msg here:', e.data)
  }
  eventSource.addEventListener('goodbye', function (e) {
    // 对于自定义事件，不能使用onxxxx，必须是addEventListener
    console.log('finial message:', e.data)
  })
  setTimeout(() => {
    // 一小时后自动关闭
    // 一旦一个EventSource实例被关闭，就无法再复用它了，必须再新建一个实例
    eventSource.close()
  }, 1e3 * 60 * 60)
}
// start(); // 启动
```

服务器端代码：

```js
var http = require('http')
var count = 0
http
  .createServer(function (req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*')
    if (req.url.includes('getdata')) {
      if (count++ == 2) {
        // 2次之后不让浏览器继续连接了
        count = 0 // 重置
        res.statusCode = 204 // 规范约定了204是告诉浏览器不要重试了，服务器关闭连接了，204状态码本身表示无内容，No-Content
        res.end()
        return
      }
      res.statusCode = 200
      res.setHeader('Content-Type', 'text/event-stream; charset=utf-8')
      let id = setInterval(() => {
        // 每条消息以双LF分隔，每条消息还有event、retry和id字段
        // event: 表示本消息的事件名，浏览器需要对它进行addEventListener
        // retry: 告诉浏览器重试等待事件，单位毫秒，默认3000
        // id：本消息的ID，重试时浏览器会发送最后一个接收到的ID以告诉服务器从哪继续开始重传，就像TCP的ack确认号
        res.write(`data: hi ${new Date()}\n\n`)
      }, (Math.floor(Math.random() * 2) + 1) * 1e3)
      setTimeout(() => {
        clearInterval(id)
        // 本次消息周期完成，然后浏览器将尝试自动重连
        res.end(`event: goodbye\ndata: see next time\n\n`)
      }, 1e3 * 4)
    } else {
      res.end()
    }
  })
  .listen(3000)
```

## WebSocket

是浏览器和服务器全双工通信的解决方案，通信不基于 http（websocket 握手还是采用 http），而是使用自己的 ws 协议，以及 TSL 加密的 wss 协议。
当浏览器请求建立 websocket 连接时，发送的 http 请求有 2 个重要字段：（不能使用 XHR 或 fetch 来模拟 websocket 的握手，因为 JavaScript 无法设置这些请求头）
GET /getdata
Connection: Upgrade // 表示浏览器需要改变（升级）协议
Upgrade: websocket // 改变为 websocket
如果服务器支持 websocket，就判断来源并同意是否升级，如果同意返回如下响应：
101 Switching Protocols
Connection: Upgrade
Upgrade: websocket
握手完成了，之后就是用 ws 的数据帧开始通信了。
强大的 websocket：

1. 它没有同源策略的限制
2. 浏览器对它支持很好，IE10 开始也支持了
3. 既可以发送文本也可以发送二进制
4. 2 个方法 4 个事件
   方法：

   - `socket.send(data)`
   - `socket.close([code], [reason])`

   事件：

   - `open`
   - `message`
   - `error`
   - `close`

浏览器端代码：

```js
function start() {
  var id
  let socket = new WebSocket('ws://localhost:3000/getdata') // 注意是ws://
  socket.binaryType = 'arraybuffer' // 默认是'blob'，即把接收到的二进制当作blob，blob是有类型的二进制数据块，作为高层的二进制数据存在，可以直接供<a>、<img>等标签使用，而arraybuffer提供了细颗粒的二进制操作
  socket.onopen = function (e) {
    console.log('opened')
    socket.send('hi') // 发送文本
    // id = setInterval(() => {
    //   socket.send(new Uint8Array([1,2,3,4])); // 发送二进制，可以是ArrayBuffer或Blob
    // }, 2000);
  }
  socket.onmessage = function (e) {
    console.log('a msg here:', e.data)
  }
  socket.onclose = function (e) {
    console.log(`closed, code=${e.code}, reason=${e.reason}`)
    // clearInterval(id);
    // 如果返回的code是1006，表示对方被异常关闭，比如进程被杀死了，而这个状态码是无法通过代码设置的
  }
}
// start(); // 启动
```

服务器端代码：

```js
const http = require('http')
const ws = require('ws')

const wsinstance = new ws.Server({ noServer: true })

http
  .createServer(function (req, res) {
    // 只接受websocket
    if (
      !req.headers.upgrade ||
      req.headers.upgrade.toLowerCase() != 'websocket'
    ) {
      res.end()
      return
    }
    // Connection: keep-alive, Upgrade
    if (!/upgrade/i.test(req.headers.connection)) {
      res.end()
      return
    }
    // 进行协议升级
    wsinstance.handleUpgrade(
      req,
      req.socket,
      Buffer.allocUnsafe(0),
      function (ws) {
        ws.on('message', function (data) {
          console.log('receive data from browser:', data)
          // ws.send(`now ${new Date}!`); // 发送文本
          ws.send(new Uint8Array([5, 6, 7, 8])) // 发送二进制数据
          setTimeout(() => ws.close(1000, 'Bye!'), 5000)
        })
      }
    )
  })
  .listen(3000)
```

> 2021-04-29
