# React 知识清单（只记录难的知识点）

> 环境：React 18

## 生命周期钩子（类组件）

前言：由于 React 在 16.4 版本引入了异步渲染，导致以前的`componentWillMount`、`componentWillReceiveProps`和`componentWillUpdate`钩子不再稳定。

1. `getDerivedStateFromProps(newProps, oldState) => newState: Object`: 此钩子存在的目的是为了在 props 变化时，根据最新的 props 得到（派生出）对应的 state，此钩子在业务代码中几乎用不到
2. `getSnapshotBeforeUpdate(oldProps, oldState) => snapshot: any`: 此钩子在 React 把当前最新的视图提交到 dom 前被调用，以获取上一次渲染的 dom 的一些信息，此钩子的任何返回值将当作`componentDidUpdate`的第三个参数

React 16.4 生命周期流程图：
![alt theLifecycleOfReact16.4](./imgs/the%20lifecycle%20of%20react%20whose%20version%20ge%2016.4.jpg)

> 图表来源：https://github.com/wojtekmaj/react-lifecycle-methods-diagram

## Hook 索引

### `useState`

### `useEffect`

### `useContext`

### `useReducer`

### `useCallback`

### `useMemo`

### `useRef`

### `useImperativeHandle`

### `useLayoutEffect`

### `useDebugValue`

## 内置组件

### `React.lazy`

语法：`React.lazy(() => import('dynamicComponent.jsx'))`
说明：返回一个 React 内置的 Lazy 组件（对象类型），Lazy 组件将在**整个 App 的组件树**里找到与它最近的 Suspense 组件，如果 Lazy 组件最终都没找到对应的 Suspense 组件，那么整个 App 将被延迟渲染直到 Lazy 组件可用

### `React.Suspense`

说明：指定其中的子组件树还没初始化完成时的加载器

与 Lazy 组件一起使用达到组件懒加载目的：

```jsx
// 一个懒加载的动态组件，一种常见的代码分割手段
const dynamicComponent = React.lazy(() => import('./dynamicComponent.jsx'))

function MyComponent() {
  return (
    // 显示 Loading 组件直到 dynamicComponent 组件加载完成
    <React.Suspense fallback={<Loading />}>
      <div>
        {/* 在父组件首次渲染时，才加载此子组件 */}
        <dynamicComponent />
      </div>
    </React.Suspense>
  )
}
```

对于已经展示给用户的内容来说，在切换回去时又显示加载指示器可能会让人困惑。有时，在准备新的 UI 时，展示 “旧” 的 UI 的体验会更加友好，使用新的 transition API `startTransition` 和 `useTransition` 将更新标记为 transition，避免不恰当的兜底方案。

## React with Redux

## React 18 与并发相关的底层 API

### `startTransition`

方法原型：`React.startTransition(callback: Function): void`

说明：当不能使用`useTransition`时，使用此方法代替，不包含`isPending`功能

### `useTransition`

方法原型：`React.useTransition(): [isPending: Boolean, startTransition: Function]`

说明：将更新标记为过渡任务

案例：

```jsx
import React from 'react'

const __Apple = import('./Apple.js')
const __Banana = import('./Banana.js')

// 延迟一个动态组件的加载
const delayLazyComponent = (lazyComponent, time = 2000) =>
  new Promise((resolve) =>
    setTimeout(
      () => lazyComponent.then((component) => resolve(component)),
      time
    )
  )

// React.lazy接受一个函数，执行此函数应当返回一个promise，此promise的值是一个暴露默认导出的模块对象（即`export default <component>`）
const Apple = React.lazy(() => __Apple)
// 模拟一个需要较长时间加载的组件
const Banana = React.lazy(() => delayLazyComponent(__Banana))

function App() {
  const components = React.useMemo(() => [Apple, Banana], []) // Lazy组件的集合
  const [which, setWhich] = React.useState(0)
  const [age, setAge] = React.useState(20)
  const [isPending, startTransition] = React.useTransition()
  // 当从 Apple 切到 Banana 时，由于需要动态加载此组件，导致Suspense显示了fallback内容
  // const changeWhich = () => setWhich(which + 1)
  // 此处使用了startTransition，位于startTransition的callback内触发的所有更新都会被标记为一个过渡任务（告诉React此任务需要一些准备时间，是低优先级的任务），此任务执行期间将被插入的高优先级任务打断（比如响应用户的点击操作），而且，过渡任务不会导致Suspense组件重新渲染fallback，Suspense将保持旧的UI直到新的UI准备就绪（使得用户能继续与旧的UI交互，再某些UI交互场合非常的合适）
  const changeWhich = () => {
    startTransition(() => {
      setWhich(which + 1)
      console.log(isPending)
    })
    setAge(age + 1)
  }
  const WhichComponent = components[which % components.length]
  return (
    <div className="App">
      <div>I am App Component</div>
      <div>
        <p>current which is: {which}, low priority</p>
        <p>current age is: {age}, normal priority</p>
      </div>
      <div>
        <button onClick={changeWhich}>click</button>
      </div>
      <React.Suspense fallback={<p style={{ color: 'red' }}>loading</p>}>
        <div>
          <WhichComponent />
        </div>
      </React.Suspense>
    </div>
  )
}

export default App
```

### `useDeferredValue`

语法：`useDeferredValue(value: T: any): copiedValue: T`

说明：接收一个值并返回它的副本，对于这个值的更新将被视作低优先级，当一个紧急任务进来时，此 hook 将返回上次被渲染过的旧值，以避免在本次紧急任务期间触发不必要的额外渲染

### `useId`

### `useSyncExternalStore`

### `useInsertionEffect`
