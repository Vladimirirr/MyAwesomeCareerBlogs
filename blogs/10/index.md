# 对 C99 新增的 `_Bool` 类型的理解

传统（指 C90）C 标准中是没有布尔类型的，对于 C 来说，非 0 即是真，而 0 即是假，这里 0 不仅包括整型家族的 0，还包括浮点家族的 0.0，有如下代码，

```c
if (0.0){
        puts("true");
}else{
        puts("false");
}
```

输出的结果是：false

在 C 中，**一直使用 int 类型表示真假值（布尔值）**，所以，任何条件表达式的结果要么是 1（真），要么是 0（假），在 C99 标准中，引入了新的类型 `_Bool`，即布尔类型，布尔类型的变量只能存储 1 或 0 的整型值，把任何假值（整型和浮点的零值）赋值给 `_Bool`，该变量会被设为 0，否则被设为 1，为此，C99 还提供了 stdbool.h 头文件，该文件让 bool 成为 `_Bool` 的别名，同时宏定义了 true 和 false，分别是 1 和 0 的字面量，这让写出的代码能与 C++兼容，因为 C++把 true 和 false 视作关键字，下面对 `_Bool` 类型的一些测试代码，

```c
#include <stdio.h>
#include <stdbool.h>

int main(){
    _Bool flag=true;
    printf("sizeof flag = %d\n",sizeof flag);
    printf("type of flag is %s\n",_Generic(flag,int:"int",_Bool:"_Bool",default:"default"));
    printf("the conditional expression of C language is %s\n",_Generic(2>3,int:"int",_Bool:"_Bool",default:"default"));
    printf("the conditional expression of C language is %s\n",_Generic(flag==false,int:"int",_Bool:"_Bool",default:"default"));
    return 0;
}
```

输出结果：

sizeof flag = 1
type of flag is \_Bool
the conditional expression of C language is int
the conditional expression of C language is int

_需要注意：以上代码使用了 C11 的泛型表达式 `_Generic` （简单地说，它接受若干参数，第一个参数必须是一个符合 C 语言的表达式，然后会根据提供的这个表达式的类型去匹配后面给出的类型，最后，整个 `_Generic` 表达式的值就是匹配成功项冒号后面的值），所以需要对编译器开启-std=c11 标记。_

分析输出的 3 行结果的含义：

1. 这说明了 `_Bool` 类型占用 1 字节，对于布尔类型，理论上只需要占 1bit 的空间就足够了，但是大多数的编译器在实际实现上都采用 1 字节，因为在现在的计算机内存性能下没必要减少那 7bit 的空间

2. 很明显，flag 的类型就是 `_Bool`

3. **这点就很重要了！上面也提及过，在 C 语言中，一直只用 int 类型作为条件表达式的值，条件是真则表达式值就是 1，条件是假则表达式值就是 0**

4. 验证了上面的第 3 点，即便是 `_Bool` 类型的变量在做逻辑运算时，返回的结果还是 int 类型

所以， `_Bool` 并没有改变 C 的规则，对于所有的条件表达式仍然以 1 表示真，以 0 表示假，它的加入，只是使得让编写人员有一种更直观的类型去保存那些期望是布尔值的变量。

您应该这样使用 `_Bool` 类型：对 `_Bool` 类型的赋值应该用条件表达式的值或返回类型是 `_Bool` 类型的函数。

个人观点，新的 `_Bool` 可以理解为只能保存 0 或 1 的 unsigned char 类型，。

（上文是本人对 C99 标准新类型 `_Bool` 的理解，错误或不严谨之处恳请指出。）

> 2020-02-18
