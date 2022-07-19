# JavaScript 的 Map、Set、WeakMap 和 WeakSet

Object：对象，存储键值对数据，键名必须是字符串或 Symbol，标准没有规定对象属性的存储顺序
Map：映射，键名可以是任意数据类型，能记住每组键值对插入的顺序，在`for..of`迭代时能按照插入的顺序以`[key, value]`格式输出
Array：数组，下标在表现上是数字，但实际上是将数字转换成字符进行存储的，不过引擎会对数组的下标查找进行优化
Set：集合，值唯一的数组
WeakMap：弱引用的 Map，仅接受对象作为 key，如果对象本身没有其他的引用了（不包括 WeakMap），那么自动从 WeakMap 删除
WeakSet：弱引用的 Set，仅接受对象作为 value，如果对象本身没有其他的引用了（不包括 WeakSet），那么自动从 WeakSet 删除

Map 的键和 Set 的值相等比较依据：（底层比较算法是`SameValueZero`，参见 ES6 规范的`7.2.10`小节）
`NaN`与`NaN`相等（即便`NaN !== NaN` === true），且`-0`和`+0`严格相等，其他的值根据`===`运算符来判断是否相等。
故：在 Map，多个值是`NaN`的键会发生覆盖；在 Set，多个`NaN`的值会只保留一个。

Map 基本操作：
新建 Map 数据类型：`new Map()`或`new Map([[key1, val1], [key2, val1]])`或`new Map(anotherMapObject)`或其他能返回`[key, value]`格式的一维数组的可迭代对象
插入：`Map#set(key, val)`，返回 Map 对象本身，相同的键名的值会覆盖（即更新）
读取：`Map#get(key)`，键名不存在返回`undefined`
删除：`Map#delete(key)`，删除存在的键名返回`true`，删除不存在的键名返回`false`
存在：`Map#has(key)`，判断一个键是否存在
返回长度：`Map#size`，这是一个 getter 属性
遍历：`Map#forEach((thisVal, thisKey, thisMap) => {}, thisArg)`
清空：`Map#clear()`，无返回值
获取 key 和 value 的迭代对象：`Map#entries()`，返回的迭代对象按照插入顺序生产值`[key, value]`
获取仅 key 的迭代对象：`Map#keys()`，返回的迭代对象按照插入顺序生产值`key`
获取仅 value 的迭代对象：`Map#values()`，返回的迭代对象按照插入顺序生产值`value`
可从`Array.from(mapObject)`得到 Map 对象对应的二维数组（等价于`Array.from(mapObject.entries())`），这与使用展开运算符`[...mapObject]`相同。
Map 对象可以进行浅拷贝，即`new Map(anotherMapObject)`。
本质上，Map 让你将一些额外的信息（值）与一个对象（键）相关联，而不用将这些信息实际存储在对象本身中。

Set 基本操作：
新建 Set 数据类型：`new Set()`或`new Set([val1, val2])`或`new Set('string')`或`new Set(anotherSetObject)`或其他能返回`value`格式的可迭代对象
插入：`Set#add(value)`，插入，如果已经存在相同的值，忽略本次操作
删除：`Set#delete(value)`，移除与给定值相同的值，如果值存在返回 true，否则返回 false
存在：`Set#has(value)`，判断值是否存在
遍历：`Set#forEach((thisVal, thisKey, thisSet) => {}, thisArg)`
清空：`Set#clear()`，无返回值
返回长度：`Set#size`，这是一个 getter 属性
获取 key 和 value 的迭代对象：`Set#entries()`，返回的迭代对象按照插入顺序生产值`[value, value]`，之所以返回两个相同元素的数组是为了与`Set#entries()`保持一致
获取仅 value 的迭代对象：`Set#values()`或`Set#keys()`，返回的迭代对象按照插入顺序生产值`value`
Set 迭代出来的值的顺序与插入时的一致。
可从`Array.from(setObject)`得到 Set 对象对应的一维数组（等价于`Array.from(setObject.values())`），这与使用展开运算符`[...setObject]`相同。
Set 对象可以进行浅拷贝，即`new Set(anotherSetObject)`。

WeakMap 的提出：
Map 的实现其实是利用了二维数组，保存一次 set 时候对应的`[key, value]`，故查找的算法复杂是 O(n)。
注意：WeakMap 仅有 set、get、has 和 delete 方法，没有 size 属性！

```js
var foo = new Map()
;(function () {
  var obj = { aa: 11 }
  foo.set(obj, 'obj.aa.value.11')
})()
console.log(foo.size) // 1
// 由于立即函数的作用域已不复存在，意味着无法再访问obj对象，无法再通过foo.get方法得到键obj对应的值
// 但是可以通过`for..of`遍历出这对键值对
// 由于保存key的数组引用了立即函数内部的obj对象，导致即便obj在外部已经不可访问，但仍旧在内存中保存着（因为存在引用），这就造成了内存泄露
var bar = new WeakMap()
;(function () {
  var obj = { bb: 22 }
  bar.set(obj, 'obj.bb.value.22')
})()
console.log(bar) // bar会在下一轮GC之后变成空WeakMap，这就意味着WeakMap的size是不确定的！所以，WeakMap也没有提供size属性和其他任何能得到它长度或全部内容的方法！
// 由于不具备size属性和一切迭代方法，同时由于立即函数的obj无法在函数外被访问，也不能使用get方法判断，你只能信任引擎一定会将没有任何引用的obj对象从WeakMap中删除
// Map对它的键持有强引用（GC不能忽略此引用），而WeakMap对它的键持有弱引用（GC可以忽略此引用）
// 不过，WeakMap的键对它的值(value)持有强引用，即
// 在WeakMap中，如果一对键值对的键不存在任何引用了，这对键值对就会自动从WeakMap中删除；而如果一对键值对的值不存在除WeakMap之外的其他任何引用了，这对键值对并不会从WeakMap中删除
```

WeakMap 的 polyfill：

```js
// WeakMap的polyfill
var WeakMap = function () {
  this.name = '__wm__' + getUUID()
}
WeakMap.prototype.set = function (key, value) {
  Object.defineProperty(key, this.name, {
    // 重点
    value: [key, value],
  })
  return this
}
WeakMap.prototype.get = function (key) {
  var entry = key[this.name] // 拿到 set 时候放在目标对象属性的值
  return entry && (entry[0] === key ? entry[1] : undefined)
}
// 可以看出WeakMap不再和Map一样使用二维数组来存储数据（格式：`[[key, value], ...]`），而是直接将值`[key, value]`定义在传入的对象本身的属性`this.name`上，故而WeakMap只接收对象作为key
```

WeakSet 只能存储对象，且只是持有对这些对象的弱引用，即如果有对象没有再被引用，那么这个对象就会被 GC，也自然而然地从 WeakSet 中删除，出于此，WeakSet 是不可被枚举的，和 WeakMap 一样也仅有 set、get、has 和 delete 方法，也没有 size 属性！。

**注意：WeakSet 或 WeakMap 都没有 size 属性和任何迭代方法！<b style="color: red;">这是因为：我们无法确定浏览器什么时候进行 GC，一旦浏览器进行了 GC，WeakSet 或 WeakMap 的长度有可能减少了！那么刚刚拿到的长度也就没有意义了！</b>**

> 《你不知道的 JavaScript（下）》GitHub 中文第一版对 WeakMap 描述：WeakMap（仅）接收对象作为键。这些对象被**弱**持有，这意味着如果对象本身被垃圾回收掉了，那么在 WeakMap 中的记录也会被移除。**这是观察不到的**，因为一个对象可以被垃圾回收的唯一方法是不再有指向它的引用，一旦不再有指向它的引用，你就没有对象引用可以用来检查它是否存在于这个 WeakMap 中。
> 同理，WeakSet 只是**弱**持有它的值。

> 2020-11-02
