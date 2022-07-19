# 一个简单的 JS 模板引擎的设计与实现

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
  </head>
  <body style="background: gray;">
    <div id="app"></div>
    <script>
      'use strict'

      // 学到：
      // 1. 正则表达式的`.`不能匹配JS的行终止符(\n \r \u2028 \u2029)，所以匹配任意字符的正则表达式是`[\s\S]`
      // 2. 量词的惰性化，在量词后面加`?`即可，使得量词从最长匹配变成最短匹配

      var userListView = `
        <ol>
        <%for ( let i = 0; i < users.length; i++ ){%>
          <li>
            <a href="<%=users[i].url%>">
              <%=users[i].name%>
              is
              <%=users[i].age%>
              years old.
            </a>
          </li>
        <% } %>
        </ol>
        <b>above total: <%= users.length %></b>
      `
      var userListData = [
        { name: 'nat', age: 18, url: 'http://localhost:3000/nat' },
        { name: 'jack', age: 22, url: 'http://localhost:3000/jack' },
      ]

      function myTemplate1(str) {
        var head = "var p = []; with(data){ p.push('" // 起一个开头的push
        var body = str
          .replace(/[\r\n]/g, ' ') // 防止由于换行导致语法解析错误
          .replace(/<%=(.+?)%>/g, "');p.push($1);p.push('") // 先替换表达式，它是<%和%>的特殊例子
          // 下面两行顺序无关紧要，因为被替换的字符串本身不存在交集
          .replace(/%>/g, "p.push('")
          .replace(/<%/g, "');")
        var tail = "');} return p.join('');" // 起一个结束的push
        return new Function('data', head + body + tail)
      }

      function myTemplate2(str) {
        // 升级，对特殊字符进行了处理
        // 1. 处理JS的行终止符(\n)，由于要把字符串代码通过new Function包装产生函数，其本质是解析传入的字符串，所以诸如`new Function("var a = 'ab\nc';")`直接报错，而是要`"var a = 'ab\\nc';"`，前者源代码文本就被换行了，导致了语法解析错误，JS一共有4个终止符，\r \n \u2028 \u2029，除了IE遵守这个标准，其他浏览器只把\n当作行终止符，其他都视作零宽空白字符
        // 2. 处理单引号和反斜杠这两个特殊字符
        // 最终：**把真正的 \r \n \u2028 \u2029 \' \\ 变成对应的文本形式，即从1个字符变成2个字符，从而防止这些特殊字符参与JS源代码的语法解析**
        // 有点难理解的地方是 '\\': '\\' 和 '\'': '\''
        // 这是因为单字符的 \' 和双字符的 \' 表现是一样的
        var escapes = {
          '\n': 'n',
          '\r': 'r',
          '\u2028': 'u2028',
          '\u2029': 'u2029',
          '\\': '\\',
          "'": "'",
        }
        var escapeReg = /[\n\r\u2028\u2029\\']/g
        var escapeChar = (match) => '\\' + escapes[match]
        // 换了一种实现方式，不再使用数组，直接使用字符串拼接（效率高了）
        var head = "var p = ''; with(data){ p+='" // 起一个开始的单引号
        var body = str
          .replace(escapeReg, escapeChar) // 是第一版的[\r\n]升级版，第一版的做法是把会导致在new Function时使得JS解析失败的语法直接替换成空格，而这个版本做法保留了这些特殊字符，但是在new Function之前把它们文本化了，这就确保了模板输出的目标字符串和模板本身的格式相同
          // .replace(/<%=(.+?)%>/g, '\'+ $1 +\'') // 和第一版一样也是先求表达式
          // 上面当目标表达式返回的结果是不符合预期的，比如undefined，也会输出它，这是不希望的，加入判断
          .replace(/<%=(.+?)%>/g, "' + ($1 || '') + '")
          .replace(/<%(.+?)%>/g, "'; $1 p+='")
        var tail = "';} return p;" // 起一个结束的单引号
        return new Function('data', head + body + tail)
      }

      function myTemplate3(str) {
        // 最终版本，继续优化了性能，在一个replace完成全部替换
        var [interpolate, evaluate] = [/<%=(.+?)%>/g, /<%(.+?)%>/g] // interpolate插值 和 evaluate语句
        var matcher = new RegExp(
          `${interpolate.source}|${evaluate.source}|$`,
          'g'
        )
        var index = 0,
          p = ''
        var escapes = {
          '\n': 'n',
          '\r': 'r',
          '\u2028': 'u2028',
          '\u2029': 'u2029',
          '\\': '\\',
          "'": "'",
        }
        var escapeReg = /[\n\r\u2028\u2029\\']/g
        var escapeChar = (match) => '\\' + escapes[match]
        str.replace(matcher, function (match, interpolate, evaluate, offset) {
          // 正则对象的lastIndex属性只有在开启g标志且在regexp.exec和regexp.test方法有效，指定下次匹配的开始位置，此属性可读可写，如果方法没找到任何匹配则自动将它设置0，而在这里，用index来模拟lastIndex的作用
          // 另外需要注意，matcher最后的`$`目的是匹配字符串结束位置，从而得到结束位置的offset，当`$`发生匹配时，match是空字符串，因为`$`是零宽断言，确实发生匹配但是没有匹配内容，故返回空字符串

          // 使用slice方法取子字符串的副本，确保str保持不变
          // 将本次匹配到的<%=xxx%>或<%xxx%>之前的文本进行特殊字符文本化
          p += str.slice(index, offset).replace(escapeReg, escapeChar)

          // 记录下次replace匹配的开始位置
          index = offset + match.length

          // 进行替换
          // 这里巧妙利用了正则表达式的 捕获分组 和 或运算
          // `/part1(group1)|part2(group2)|part3/g`这是上面matcher的结构，由于或运算的存在，只要三者之一匹配成功，整个正则表达式匹配成功，就会执行replace的回调函数，由于group1和group2必然要存在（因为它们写在正则表达式里面），那么其中某一个就得是undefined，如果是part3发生的匹配，那么group1和group2都是undefined
          if (interpolate) {
            p += `' + (${interpolate} || \'\') + '`
          } else if (evaluate) {
            p += `'; ${evaluate} p+='`
          }

          // 把匹配到的字符串原封不动地还回去，确保str保持不变
          return match
        })
        // 给p拼上头部和尾部的代码
        p = "var p = ''; with(data){ p+='" + p + "';} return p;"
        // 可以在`new Function`包上try-catch语句，避免创建函数失败
        return new Function('data', p)
      }

      // var userListRender1 = myTemplate1(userListView);
      // var userListRender2 = myTemplate2(userListView);
      var userListRender3 = myTemplate3(userListView)
      // var res1 = userListRender1({users: userListData});
      // var res2 = userListRender2({users: userListData});
      var res3 = userListRender3({ users: userListData })
      // console.log('res1', res1);
      // console.log('res2', res2);
      console.log('res3', res3)
      // document.getElementById('app').innerHTML = res1;
      // document.getElementById('app').innerHTML = res2;
      document.getElementById('app').innerHTML = res3

      // underscore 0.1.1
      function underscore_template(str, data) {
        var fn = new Function(
          'obj',
          'var p=[],print=function(){p.push.apply(p,arguments);};' +
            "with(obj){p.push('" +
            str
              .replace(/[\r\t\n]/g, ' ')
              .split('<%')
              .join('\t')
              .replace(/((^|%>)[^\t]*)'/g, '$1\r')
              .replace(/\t=(.*?)%>/g, "',$1,'")
              .split('\t')
              .join("');")
              .split('%>')
              .join("p.push('")
              .split('\r')
              .join("\\'") +
            "');}return p.join('');"
        )
        return data ? fn(data) : fn
      }
    </script>
  </body>
</html>
```

> 2022-07-17
