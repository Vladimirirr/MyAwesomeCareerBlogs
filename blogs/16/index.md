# typedef 声明变量也是一种求值过程

前言：

什么叫做：声明变量是求值过程？请看下面的声明，

int i;

很简单，声明了个整型变量 i，再看如下声明，

int \*p;

也很简单，立刻反应出来它是指向整型的指针，但是具体如何推倒出来的呢？其实在 C 语言中，变量的声明就是一种求值过程，把 \*p 这部分声明看成表达式，对这个表达式的求值的结果是 int 类型，这样就可以倒推出 p 是指针整型的指针了，因为只有对指向整型的指针进行解引用操作才是整型类型！还有很多复杂的声明，都可以使用这种方法求其具体的类型。

下面让我们来验证 typedef 定义的新类型和普通的声明变量一样，也是一种求值过程：

```c
/*
验证：
用typedef定义的新类型名声明的变量是否与普通的声明变量一样，是一种求值的过程，还是单纯的替换过程？
*/

typedef short int arrTen[10]; //定义了一个新类型，这个类型是：一个包含10个short类型元素的一维数组

int main(){
    short int j;
    short int myarr[10];
    arrTen *arr1;
    /*
    现在需要验证arr1的类型：
    假设是求值过程，那么意味着对表达式*arr1求值的结果是arrTen类型，也就是说arr1是一个指针，指向一个数组，但是在C语言中数组是一个很朴素的概念，它只是连续的内存单元，所以指向一个数组准确地说是指向一片拥有10个short元素的内存空间
    假设是替换过程，那么上述声明相当于：short int *arrTen[10]，而这个声明意味着arrTen是一个拥有10个元素的数组，每个元素的类型是指针，指向short类型的内存单元，在这里发现了问题，如果声明（用typedef定义(或声明)新类型时和用typedef声明变量时）用到了很多操作符，替换过程就会出现优先级的失调，所以在此猜测这种假设是错的
    */

    /* 实际操作验证 */
    //arr1[1]=&j; //报错，GCC5.2:error: assignment to expression with array type
    arr1=&myarr; //未报错，myarr的类型是一个指向short的指针，而&myarr的类型是一个指向拥有10个short元素的数组的指针
    /* 综上，arr1是一个指向数组的指针，所以第一种假设成立，typedef声明变量时也是一种求值过程 */

    return 0;
}
```

> 2020-01-26