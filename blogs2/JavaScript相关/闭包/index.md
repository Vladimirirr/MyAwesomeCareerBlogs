# 闭包

## 闭包的出现和本质

### 出现背景

1. 由于 JavaScript 基于静态作用域（也叫做词法作用域），即函数变量的作用域链查找规则在书写源代码时就决定了，与运行时无关（对应的动态作用域），比如：

```js
var name = 'stark'
function foo(otherFunction) {
  var name = 'thor'
  bar()
}
function bar() {
  console.log(`my name is ${name}`)
}

// run bar directly and print 'stark'
bar()

// run bar wrapped with foo and print 'stark' too
foo()
```

多数图灵完备语言的语言都是静态作用域，如果是动态作用域，那么上述示例代码的第二次 foo 执行将打印'thor'而不是'stark'。

2. 由于 JavaScript 将函数作为一等公民，函数就像普通值一样能传来传去（比如当作其他函数的入参、当作其他函数的返回值，此时这个其他函数也便是高阶函数）

### 引出本质

由于上述提到的两点基本前提，也就导致了闭包的出现：

```js
function foo() {
  var statement = 'hi Mr. stark'
  var count = 0
  // 由于foo函数返回值是另一个bar函数，那么foo就叫做高阶函数
  return function bar() {
    console.log(`${statement} with ${++count} times.`)
  }
}

var fn = foo()
fn() // 'hi Mr. stark with 1 times'
fn() // 'hi Mr. stark with 2 times'

var fn2 = foo() // each foo function will create a **new independent** scope
fn2() // 'hi Mr. stark with 1 times'
fn2() // 'hi Mr. stark with 2 times'
```

由于：

1. 静态作用域：bar 函数对它内部使用到的变量 statement 和 count 的查找作用域链在书写时就被确定
2. JavaScript 是一等公民：bar 函数允许作为 foo 函数的返回值被返回出去

**最终导致：** JavaScript 引擎即便在 foo 函数执行完毕了也要继续保存 foo 函数的作用域，因为此作用域被 bar 函数使用到了，_此时 foo 函数的作用域就叫做【闭包】，而 bar 函数叫做【闭包函数】（拥有闭包的函数）_。
