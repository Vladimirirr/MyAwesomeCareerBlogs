# 关于 C 语言中 EOF 的一点认识

总结来说：EOF（即 End Of File）是一个文件结束的标记，当文件被读取到 EOF 位置时，参与读取的函数会返回整型值 -1，这时要注意的是：这个值被赋值给有符号 char 类型时是 0xff，被赋值给有符号 short 时是 0x00ff，有符号 int 即 0x000000ff。

有以下代码：

```c
#include <stdio.h>
struct student{
    char name[5];
    char sex;
    short age;
};
int main(){
    FILE * f1, * f2;
    unsigned int count;
    short ch;

    count = 0;

    f1 = fopen("ascii.txt", "rb");
    ch=fgetc(f1);
    while (ch!=EOF){
        count++;
        ch = fgetc(f1);
        //可以看到被测试文件的第二个字符是FF，它以有符号char类型保存时值是-1，与EOF值相符，如果变量ch类型是有符号char就会出现结束循环，导致错误的计数
        //然而这里的ch类型是有符号short，当FF赋值给有符号short类型时是0x00FF，它的值是255，所以不与EOF（-1）相符，可以正常计数
    }
    fseek(f1, 2, SEEK_SET);
    printf("%d\n", ftell(f1));
    printf("code is:%x\n", getc(f1)==EOF);
    printf("code is:%x\n", getc(f1)==EOF);
    printf("code is:%x\n", getc(f1));
    //最后一个getc(f1)输出为八个f，原因很简单，因为这时候已经取到了EOF，而EOF的值是-1，所以这时getc返回-1，C语言中整型直接常量的类型是有符号int，所以就得到了有符号int类型的0xffffffff（它的值就是-1）

    fclose(f1);

    printf("total btyes:%ld\n", count);

    return 1;
}
```

输出结果：

2
code is:0
code is:1
code is:ffffffff
total btyes:3
Press any key to continue

被测试文件（ascii.txt）的十六进制结构为：

33 FF 55

另外，任何尝试读取非法的文件指针所指向的字符（字节）时都会返回 -1，如下代码所示：

```c
fseek(f1, 14, SEEK_SET);
printf("%d\n", ftell(f1));
printf("code is:%x\n", getc(f1));
```

输出：

14
code is:ffffffff
Press any key to continue

解释：还是以"ascii.txt"为例，fseek 移到了非法的位置 14 时（因为一共就 0， 1， 2 三个位置），getc 函数返回-1。

最后：fseek 函数需要注意的是（SEEK_SET, CUR, END 结果都相同，SEEK_END 指向的是文件的 EOF 位置），它不会把文件指针移到位置 0 之前（如下代码所示），但是能移到 EOF 位置之后（如上代码所示）：

```c
fseek(f1, -2, SEEK_SET);
printf("%d\n", ftell(f1));
printf("code is:%x\n", getc(f1));
```

输出：

0
code is:33
Press any key to continue

解释：第二个参数是 -2，应该从 SEEK_SET 位置向前移动两个字符，即 ftell 函数应该返回 -2，但是实际上并没有移动。

> 2018-07-23
