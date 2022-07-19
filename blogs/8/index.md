# 关于 encodeURIComponent 编码非 UTF-8 字符时出现的怪异情况

现在有个 test.html 文件，这个文件的编码是 UTF-8，其中“你好”的 UTF-8 编码是：E4 BD A0 E5 A5 BD，文件代码如下：

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <script>
      console.log(encodeURIComponent('你好')) //%E4%BD%A0%E5%A5%BD
    </script>
  </head>
  <body>
    <p>hello</p>
  </body>
</html>
```

可以看见，enencodeURIComponent 就是将“你好”以 UTF-8 编码输出（这也正是 encodeURIComponent 方法的定义：将非 URI 字符都以 UTF-8 编码的格式输出为字符串），现在来看一个怪异的情况，还是上面的 test.html（所以文件的编码依旧是 UTF-8），只不过这次手动把 charset 改为了 GBK 编码，用来误导 encodeURIComponent 方法，代码如下：

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="GBK" />
    <script>
      console.log(encodeURIComponent('你好')) //%E6%B5%A3%E7%8A%B2%E3%82%BD
    </script>
  </head>
  <body>
    <p>hello</p>
  </body>
</html>
```

什么，输出的是什么鬼！不着急，我们慢慢分析：
encodeURIComponent 认为需要 encode 的字符的编码是 charset 指定的编码，这里就是 GBK，而 encodeURIComponent 需要的是 UTF-8 编码的字符，这样它才会进行 encode，所以必须发生编码之间的转换，具体如下，
“你好”的 UTF-8：E4 BD A0 E5 A5 BD
所以“你好”实际上是以上面的 6 字节存储在文件 test.html 里面（因为文件的实际编码是 UTF-8）
但是 charset 指定的 GBK 是 2 字节编码（除 128 个 ASCII 外，都是 2 字节编码），所以它把 E4 BD 认为是 1 个 GBK 字符，尝试把它转为 UTF-8，其中 E4 BD 在 GBK 中对应的是“浣”字，而这个字在 UTF-8 则是 E6 B5 A3
由此问题解决！

结论：如果网页文件的文件编码是 UTF-8，而 charset 不小心指定成了其他的编码，那么会发生编码转换，第一次是将原本以 UTF-8 编码保存的字符当作 charset 指定的字符来读取，然后再把它转为 UTF-8 编码。

再来看一个更加离奇的情况，现在有个 test2.html 文件，它的文件编码是 GBK，代码如下：

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <script>
      console.log(encodeURIComponent('你')) //%EF%BF%BD%EF%BF%BD
      console.log(encodeURIComponent('你你')) //%EF%BF%BD%EF%BF%BD%EF%BF%BD%EF%BF%BD
      console.log(encodeURIComponent('你你你')) //%EF%BF%BD%EF%BF%BD%EF%BF%BD%EF%BF%BD%EF%BF%BD%EF%BF%BD
    </script>
  </head>
  <body>
    <p>hello</p>
  </body>
</html>
```

“你”的 GBK 编码是 C4E3，UTF-8 的 EFBFDB 表示这些字节信息无法转为 UTF-8 对应的字符，现在我们来分析这个异常情况出现的本质原因：

C4 的二进制是 1100 0100，查看 UTF-8 编码格式转换表（百度百科的 UTF-8 词条内就有这个表格），确实存在以 110 开头的格式，以 110 开头的字节会和它的下个字节组合为一个字符，而下个 E3 的二进制是 11100 011，而 UTF-8 第二个字节开始都是 10 开始，显然这时不匹配了，也就是说 C4E3 这个编码是非法的 UTF-8 编码，那么就会返回 EFBFDB，由此问题解决。

对于文件本身是 GBK 编码（或者其他非 UTF-8 编码），且 charset 指定的编码不是文件实际的编码，那么这个方法会出现很多意料之外的行为，再比如，如下代码：

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <script>
      console.log(encodeURIComponent('小')) //%D0%A1
      console.log(encodeURIComponent('小小')) //%D0%A1%D0%A1
      console.log(encodeURIComponent('小小小')) //%D0%A1%D0%A1%D0%A1
    </script>
  </head>
  <body>
    <p>hello</p>
  </body>
</html>
```

“小”的 GBK 编码是 D0A1，同理，D0 的二进制是 1101 0000，也存在以 110 开头的 UTF-8 编码，下个 A1 的二进制是 1010 0001，和上个“你”字不同，这个确实是符合 UTF-8 第二字节均以 10 开头的标准，那么这个字符是可以转为 UTF-8 的，由此可以正常输出。

最后再来看一个案例，文件依旧是 GBK 编码，代码如下：

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <script>
      console.log(encodeURIComponent('高')) //%EF%BF%BD%EF%BF%BD
      console.log(encodeURIComponent('高高')) //%EF%BF%BD%DF%B8%EF%BF%BD
      console.log(encodeURIComponent('高高高')) //%EF%BF%BD%DF%B8%DF%B8%EF%BF%BD
    </script>
  </head>
  <body>
    <p>hello</p>
  </body>
</html>
```

“高”的 GBK 编码是 B8DF，而 B8 的二进制是 1011 1000，呀，这个字节对于不了任何 UTF-8 起始字节，随即返回 EFBFBD 编码，示意这个字符无法对应（转换）为 UTF-8 编码，继续看下个 DF 的二进制，它是 1101 1111，110 可以对应，而 UTF-8 中起始字节是 110 会和它的下个字节组合为一个字符，对于只有一个“高”来说，没有下个字符了，单个的起始字符是不对应任何的 UTF-8 编码，随即也输出 EFBFBD，这就是 console.log 第一行输出的结果，来看两个“高”，刚才讲到 DF 没有下个字符了，所以出错，现在有了第二个字符，是 B8，那么就能组合了，因为 B0 的二进制以 10 开头是符合的，剩下的字节同理啦。

总结：通常来说，网页都采用 UTF-8 编码，即文件编码和 charset 指定的编码要相同，enencodeURIComponent 才能封装和解析成功。

其实，只要文件编码和给出的 charset 编码相同，enencodeURIComponent 就能正常工作，输出为 UTF-8 字符序列。

> 2020-03-31
