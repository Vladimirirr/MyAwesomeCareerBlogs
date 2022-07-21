## All

1. 类是有行为的数据，闭包是有数据的行为。
2. 字体由贝塞尔曲线描述
3. 只要`flex-wrap`的值是换行，那么`align-content`就能起作用，即便实际上没发生换行

## 区分 space-between 和 space-around

space-between: Items/Lines display with equal spacing between them
space-around: Items/Lines display with equal spacing around them
Items: justify-content
Lines: align-content

## 区分 align-content 和 align-items

This can be confusing, but align-content determines the spacing between lines, while align-items determines how the items as a whole are aligned within the container. When there is only one line, align-content has no effect.

## 微任务

微任务是简短的函数，当创建该函数的函数执行之后，**且当前调用栈为空**，控制权又还没返还给浏览器的事件循环之前，该微任务才会被执行，随后控制权返回给事件循环，事件循环接下来执行 RAF（有的话）和渲染（需要的话）。
微任务对框架或库很重要，因为能执行 finally-clean 功能，以及在渲染前执行必要的操作，而传统的通过 Promise.resolve 或其他手段 hack 都会带来多余开销和埋下隐患（比如使用 Promise.resolve 的方法会多出一个多余的 promise 实例，然后 then 函数如果出现错误，会导致 rejected 的 promise 而不是标准的报错流程），故标准给出了`queueMicrotask(void): void`方法，它能手动追加一个微任务，但是 IE 都不支持。
微任务的重要性在于它们能以指定的顺序执行异步代码，且这些异步代码之间拥有差不多相同的执行环境。
queueMicrotask 提案的起稿：https://github.com/fergald/docs/blob/master/explainers/queueMicrotask.md
微任务的执行时间点在当前执行的宏任务的执行栈空时，在把控制权交给浏览器的事件循环前。

## 微任务与事件冒泡

环境：Chrome89 Firefox87

```html
<div class="div1" id="div1">
  <div class="div2" id="div2"></div>
</div>
```

```js
div1.addEventListener("click", (e) => {
  queueMicrotask(() => {
    console.log("micro in div1");
  });
  console.log("div1");
});
div2.addEventListener("click", (e) => {
  queueMicrotask(() => {
    console.log("micro in div2");
  });
  console.log("div2");
});
```

1. 手动点击 div2，div2 -> micro in div2 -> div1 -> micro in div1
2. 使用`div2.click()`或`div2.dispatchEvent(new CustomEvent('click', {bubbles: true}))`或`div2.dispatchEvent(new MouseEvent('click', {bubbles: true}))`都是 div2 -> div1 -> micro in div2 -> micro in div1（任何代码触发的事件都是同步的）

## 微任务与阻止事件的默认行为

环境：Chrome89 Firefox87

```js
let nextClick = new Promise((resolve) => {
  alink.addEventListener("click", resolve);
});
nextClick.then((e) => e.preventDefault());
```

1. 手动点击超链接，都只有第一次能阻止默认行为，因为 Promise 是单决议
2. 在控制台输`alink.click()`，Chrome 第一次都不能阻止，Firefox 只有第一次能阻止
3. 在控制台输`alink.dispatchEvent(new CustomEvent('click'))`，都能一直阻止

当事件处理程序已经结束，此时没有标记阻止默认行为的话，浏览器接下来就会执行默认行为。
理论上：`alink.click()`被调用，执行了对应的事件处理函数 resolve，此时调用栈有 click -> resolve，当 resolve 执行完，没有标记阻止默认行为，就会触发超链接的跳转行为，因为此时调用栈没空，还不能执行微任务队列。
