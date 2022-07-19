# AJAX 传输二进制数据

## FormData 对象

1. 将整个表单元素映射成一个对象，可实现自动拼接表单对象数据成请求参数的格式
2. 可以上传二进制数据

### 利用 FormData 上传文本数据的表单：

前端网页核心代码：

```html
<form id="myform">
  <!-- form属于块元素 -->
  用户名 = <input type="text" name="username" value="" /> <br />
  密码 = <input type="password" name="pwd" value="" /> <br />
  <input type="button" name="go" value="提交" onclick="doit()" />
</form>
<script>
  'use strict'
  var myform = document.getElementById('myform')
  var formdata // 如果现在执行`formdata = new FormData(myform)`会导致formdata中的表单数据是空
  function doit() {
    formdata = new FormData(myform)
    // FormDate API：https://developer.mozilla.org/zh-CN/docs/Web/API/FormData
    var xhr = new XMLHttpRequest()
    if (formdata.get('username') == 'nat') {
      // IE11支持FormData构造器但是不支持get、set等一些方法
      formdata.set('usernameOrigin', 'nat')
      formdata.set('username', 'natasha') // 同名的键会覆盖
      formdata.delete('pwd')
      formdata.append('username', 'natashe') // 同名的键会保留
    }
    for (let x of formdata) {
      console.log(x) // 如果'username'传入的是'nat'那么输出如下：
      // Array [ "username", "natasha" ]
      // Array [ "usernameOrigin", "nat" ]
      // Array [ "username", "natashe" ]
      // 如果服务器不进行特殊设置，那么username只能获取到最后一次的值，即'natashe'（设置略）
    }
    xhr.open('POST', '/postdata')
    xhr.send(formdata) // 会自动将'Content-Type'设置成'multipart/form-data; boundary=---------------------------20808984378436579741074229525'
    // 注意，FormData数据在Node的Express框架中不能直接通过中间件body-parser获取，尝试通过`req.body`获取始终返回空对象，而是通过`cnpm install --save formidable`这个模块获取，但是它不是中间件
    xhr.onload = function () {
      if (xhr.status == 200) {
        console.log(xhr.responseText)
      } else {
        console.log('Something error happened: ', xhr)
      }
    }
  }
</script>
```

后端 Node 核心代码：

```js
const formidable = require('formidable')
app.post('/postdata', (req, res) => {
  var form = new formidable.IncomingForm()
  form.parse(req, (err, fields, files) => {
    // fields是普通的表单数据（文本）
    // files是上传的文件数据
    console.log(fields)
    res.send('ok')
  })
})
```

### 利用 FormData 上传二进制数据的本地文件：

前端网页核心代码：

```html
<form id="myform">
  昵称 = <input type="text" name="nickname" /> <br />
  文件 = <input type="file" name="doc" /> <br />
  <input type="button" name="go" value="提交" onclick="doit()" />
</form>
<script>
  'use strict'
  var myform = document.getElementById('myform')
  var formdata
  function doit() {
    formdata = new FormData(myform)
    var xhr = new XMLHttpRequest()
    xhr.open('POST', '/postdata')
    xhr.upload.onprogress = function (e) {
      // 这个事件必须在send之前监听有效，在send之后监听不会触发
      console.log(`当前进度：${Math.floor((e.loaded / e.total) * 100)}%`)
    }
    xhr.send(formdata)
    xhr.onload = function () {
      if (xhr.status == 200) {
        console.log(xhr.responseText)
      } else {
        console.log('Something error happened: ', xhr)
      }
    }
  }
</script>
```

后端 Node 核心代码：

```js
app.post('/postdata', (req, res) => {
  var form = new formidable.IncomingForm()
  form.uploadDir = './webroot/uploads' // 上传的文件保存在哪个目录
  form.keepExtensions = true // 保留上传时的后缀名
  form.parse(req, (err, fields, files) => {
    // fields是普通的表单数据（文本）
    // files是上传的文件数据
    console.log(fields)
    console.log(files.doc.path) // 'webroot\\uploads\\upload_4242811d6678445365bbc7c55c0a968f.dat'
    res.send('ok')
  })
})
```

## XHR 上传和下载二进制数据（TypedArray 和 Blob）

[接收和发送二进制数据的 MDN 文档](https://developer.mozilla.org/zh-CN/docs/Web/API/XMLHttpRequest/Sending_and_Receiving_Binary_Data)

### TypedArray

#### 前端传给后端

```js
// 前端
var data = new ArrayBuffer(64)
var dataview = new Uint8Array(data)
for (let i = 0; i < data.byteLength - 1; i++) {
  dataview[i] = 97 + (i % 26) // 将64字节的二进制数据初始化成[a-z]的小写字母
}
dataview[data.byteLength - 1] = 0
function doit() {
  var xhr = new XMLHttpRequest()
  xhr.open('POST', '/postdata')
  // xhr.setRequestHeader('Content-Type', 'application/octet-stream'); // 表示通用二进制流，可不写
  xhr.send(data)
  xhr.onload = function () {
    if (xhr.status == 200) {
      console.log(xhr.responseText)
    } else {
      console.log('Something error happened: ', xhr)
    }
  }
}
// 通过抓包，send出去的报文就是ArrayBuffer的二进制数据
// Node原生http服务器收到的POST数据默认是Buffer类型
```

```js
// 后端
app.post('/postdata', (req, res) => {
  var tmpchunk = []
  var data
  req.on('data', (chunk) => {
    tmpchunk.push(chunk)
  })
  req.on('end', () => {
    data = Buffer.concat(tmpchunk)
    console.log(data)
    res.send('ok')
  })
})
```

#### 后端传给前端

```js
// 前端
function doit() {
  var xhr = new XMLHttpRequest()
  xhr.open('GET', '/getdata')
  xhr.responseType = 'arraybuffer'
  xhr.send()
  xhr.onload = function () {
    if (xhr.status == 200) {
      console.log(xhr.response) // ArrayBuffer 字节长度：8
    } else {
      console.log('Something error happened: ', xhr)
    }
  }
}
```

```js
// 后端
app.get('/getdata', (req, res) => {
  res.set('Content-Type', 'application/octet-stream')
  var data = new ArrayBuffer(8)
  var dataview = new Uint8Array(data)
  dataview[1] = 11
  dataview[3] = 22
  dataview[5] = 33
  dataview[7] = 44
  data = Buffer.from(data) // 将ArrayBuffer转换成Buffer
  res.send(data) // 如果send的是ArrayBuffer，会被JSON化成'{}'（注意，实际没有单引号，这里只做分隔符），只能传入Buffer才能使send方法正确发送二进制数据，通过抓包得到的响应体的数据是：00 0b 00 16 00 21 00 2c
})
```

### Blob

#### 前端传给后端

```js
var data = new Blob(['haha'])
function doit() {
  var xhr = new XMLHttpRequest()
  xhr.open('POST', '/postdata')
  // xhr.setRequestHeader('Content-Type', 'application/octet-stream'); // 表示通用二进制流，可不写
  xhr.send(data)
  xhr.onload = function () {
    if (xhr.status == 200) {
      console.log(xhr.responseText)
    } else {
      console.log('Something error happened: ', xhr)
    }
  }
}
// 原理同ArrayBuffer，send出去的报文就是Blob的二进制数据，报文的请求体：h a h a
```

#### 后端传给前端

```js
// 注意，Node不存在Blob，只需要传递Buffer即可，故此后端代码同【TypedArray的后端传给前端】
// 前端：将xhr.responseType = 'arraybuffer' -> 'blob'，获取到的xhr.response返回`Blob{size: 8, type: "application/json"}`，其中的type会被自动设置成响应头中的'Content-Type'
```

## 旧时代的二进制传输

在 xhr.responseType 还没有'arraybuffer'、'blob'甚至'json'的时代，AJAX 还没有传递二进制功能，但是可以 hack 出来（目前已经不行了）：

```js
function doit() {
  // 没设置responseType的话（默认值是""），相当于设置了"text"
  // 如果响应报文存在`Content-Type = text/plain; charset=someCharset`，浏览器尝试使用此编码来解析响应数据
  // 如果Content-Type不是text或指定的编码不支持，浏览器尝试使用默认的UTF-8编码来解析响应数据
  var xhr = new XMLHttpRequest()
  xhr.open('GET', 'http://localhost:3000/getdata')
  xhr.overrideMimeType('Content-Type', 'text/plain; charset=x-user-defined') // 告诉浏览器不要尝试解析数据，直接返回未处理过的字节数据，目前浏览器（测试浏览器：Chrome>=69, FF>=80）即便设置了此方法也无法覆盖对应的响应头字段，已经无效
  xhr.send(null)
  xhr.onload = function () {
    if (xhr.status == 200) {
      // console.log(xhr.getAllResponseHeaders()); // 即便上面已经覆盖了，但是取到的还是原始的响应头
      // 也就是下面的代码已经无法使用了，overrideMimeType方法被忽略的最主要原因可能是现代的AJAX已经支持了原生二进制数据传递
      var data = xhr.response // 值是'\u0000\u0061\u007F\uFFFD\uFFFD\uFFFD'，因为浏览器尝试将收到的数据当做UTF-8编码的文本来解析，而解析失败的字符被填充'\uFFFD'
      // 128 = 1000,0000 而UTF-8编码表没有10起始的字符，故转换失败被填充0xFFFD
      // 同理，254 = 1111,1110 和 255 = 1111,1111 都不符合UTF-8编码，都转0XFFFD
      var len = data.length
      var received = new ArrayBuffer(len)
      var receivedview = new Uint8Array(received)
      for (let i = 0; i < len; i++) {
        receivedview[i] = data.charCodeAt(i)
      }
      console.log(receivedview) // 输出Uint8Array(6)[0, 97, 127, 253, 253, 253]
      // '\uFFFD'.charCodeAt(0) = 65533
      // 将65533存入Uint8Array时，将发生转换，转换的结果便是253
    } else {
      console.log('Something error happened: ', xhr)
    }
  }
}
```

```js
// 后端
app.get('/getdata', (req, res) => {
  var data = Buffer.allocUnsafe(6)
  data[0] = 0
  data[1] = 97
  data[2] = 127
  data[3] = 128
  data[4] = 254
  data[5] = 255
  res.setHeader('Content-Type', 'application/octet-stream')
  res.send(data)
})
```

> 2020-10-21
