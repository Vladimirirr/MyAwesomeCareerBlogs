# flex 布局

## 区分 space-between 和 space-around

space-between: Items/Lines display with equal spacing between them
space-around: Items/Lines display with equal spacing around them
Items: justify-content
Lines: align-content

## 区分 align-content 和 align-items

This can be confusing, but align-content determines the spacing between lines, while align-items determines how the items as a whole are aligned within the container. When there is only one line, align-content has no effect.

## 其他

只要`flex-wrap`的值是换行，那么`align-content`就能起作用，即便实际上没发生换行
