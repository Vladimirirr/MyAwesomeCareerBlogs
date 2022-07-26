# CSS 相关

## 主题

### flex 布局

[See document.](./flex%E5%B8%83%E5%B1%80/index.md)

## 其他

### 为什么 img 标签底部会有间隙

重现代码：

```html
<div><!-- TODO --></div>
```

答：img 标签（inline 标签）默认 baseline 对齐，因而它的底部有一些空隙（即 baseline-bottom）
