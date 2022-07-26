# 遍历以二维数组存储的图

==主题：遍历以二维数组存储的图==

给出如下的图：

0 0
0 0
0 0

这是一个 3 行 2 列的图，用二维数组 map[2][3]存储，规定：数组的第 1 个下标表示行，第 2 个下标表示列，
假设起点是 map[0][0]点，即左上角，终点是 map[2][1]点，即右下角，回答下列问题：

1.从起点出发，遍历整个图，但只遍历一次，按每个点被遍历的顺序，依次打印出这些点：

```c
#include <stdio.h>

/*
变量说明：
C语言中，具有文件作用域的变量都是静态存储类别，编译器会自动给它们赋默认值，int类型的默认值是0
map：存储图
book：标记图中的哪个点已经走过，1表示已经走过，0表示还未走过
recordY：保存已经走过的点的Y坐标（所在行）
recordX：保存已经走过的点的X坐标（所在列）
next：方向数组，用于指定下一步去往的点的坐标，方向的顺序是：上、右、下、左
*/
int map[3][2];
int book[3][2];
int recordY[6];
int recordX[6];
int next[4][2] = {{-1, 0}, {0, 1}, {1, 0}, {0, -1}};

void dfs(int y, int x, int step)
{
  int i, tx, ty;
  if (step == 5)
  { //遍历结束，因为整个图一共6个点，起点的step是0，所以遍历的最后一个点的step是5
    printf("Traverse complete\n");
    for (i = 0; i <= step; i++)
    { //打印出保存在recordY和recordX中的点的坐标
      printf("step: %d, at y=%d and x=%d\n", i, recordY[i], recordX[i]);
    }
    return;
  }
  for (i = 0; i < 4; i++)
  {                      //还没遍历完，继续枚举各个方向并进行下次递归
    ty = y + next[i][0]; //下个点所在的行
    tx = x + next[i][1]; //下个点所在的列
    if (tx > -1 && tx < 2 && ty > -1 && ty < 3 && book[ty][tx] != 1)
    {                         //这个点必须在图内，且没有被标记
      book[ty][tx] = 1;       //标记这个点
      recordY[step + 1] = ty; //保存这个点所在的行
      recordX[step + 1] = tx; //保存这个点所在的列
      dfs(ty, tx, step + 1);  //对这个点继续DFS
    }
  }
}

int main()
{
  book[0][0] = 1; //从起点出发，所以起点已经走过了，把它标记为1
  recordY[0] = 0; //先把起点所在的行保存下来
  recordX[0] = 0; //并把起点所在的列保存下来
  dfs(0, 0, 0);   //从第0行，第0列，即起点，开始遍历图，当前步数是0

  return 0;
}
```

输出：
Traverse complete
step: 0, at y=0 and x=0
step: 1, at y=0 and x=1
step: 2, at y=1 and x=1
step: 3, at y=2 and x=1
step: 4, at y=2 and x=0
step: 5, at y=1 and x=0

Process returned 0 (0x0) execution time : 0.623 s
Press any key to continue.

2.从起点出发，遍历整个图，要求得到全部的遍历结果，每种遍历结果都要打印出来：
只需加一行代码在(1)中的 `dfs(ty, tx, step + 1); //对这个点继续DFS` 的后面：
`book[ty][tx] = 0; //取消对这个点的标记，以便其他遍历能访问这个点`
输出：
Traverse complete
step: 0, at y=0 and x=0
step: 1, at y=0 and x=1
step: 2, at y=1 and x=1
step: 3, at y=2 and x=1
step: 4, at y=2 and x=0
step: 5, at y=1 and x=0
Traverse complete
step: 0, at y=0 and x=0
step: 1, at y=0 and x=1
step: 2, at y=1 and x=1
step: 3, at y=1 and x=0
step: 4, at y=2 and x=0
step: 5, at y=2 and x=1
Traverse complete
step: 0, at y=0 and x=0
step: 1, at y=1 and x=0
step: 2, at y=2 and x=0
step: 3, at y=2 and x=1
step: 4, at y=1 and x=1
step: 5, at y=0 and x=1

Process returned 0 (0x0) execution time : 0.327 s
Press any key to continue.

PS：发现，最终的遍历结果只有 3 种，而不是预想的 4 种，少了下面这种，
从起点出发，先去 y=1,x=0 点，再去 y=1,x=1 点，再去 y=0,x=1 点，这时，对 y=0,x=1 点进行所有方向的枚举都是失败的，往上走超出了边界，往右走也超出了边界，往下走的点已经被标记，往左走的点也已经被标记，这时，枚举方向的 for 循环结束，整个函数也随之结束，递归返回，又回到了 y=1,x=1 点，此时的 step 值是 2，再去 y=2,x=1 点，再去 y=2,x=0 点，而这个点已经是访问的最后一个点了，可是此时的 step 值是 4，不满足等于 5 的条件，进不去 if 语句，然后进入了 for 循环，但是没有一次循环能符合内部的 if 条件，最后 for 循环结束，整个函数也结束，递归开始返回，最终导致这次遍历的结果没有被打印，
这也是在所有 4 种遍历结果中，唯一一个在中途就发生递归返回的特例，其余的 3 种都是在访问最后一个点时才发生递归返回，这直接导致 step 值少 1，必然输出不了这次的遍历结果，其实，这次遍历结果的路径不是一条简单路径，因为 y=1,x=1 点重复了，路径是：(0,0)->(1,0)->(1,1)->(0,1)->(1,1)->(2,1)->(2,0)，点(1,1)重复出现了，
最后，要解决这个问题，需要改进这个程序。

3.规定，只能从起点的右侧出发（即起点的下一步必是(y=0,x=1)），只遍历一次，打印遍历结果：
只需修改(1)的 main 函数如下：

```c
int main()
{
  book[0][0] = 1; //从起点出发，所以起点已经走过了，把它标记为1
  recordY[0] = 0; //先把起点所在的行保存下来
  recordX[0] = 0; //并把起点所在的列保存下来
  book[0][1] = 1; //规定了只能从起点的右侧出发，那么下个点一定是y=0,x=1
  recordY[0] = 0; //第1步的Y坐标
  recordX[1] = 1; //第1步的X坐标
  dfs(0, 1, 1);   //从第0行，第0列，开始遍历图，当前步数是1

  return 0;
}
```

输出：
Traverse complete
step: 0, at y=0 and x=0
step: 1, at y=0 and x=1
step: 2, at y=1 and x=1
step: 3, at y=2 and x=1
step: 4, at y=2 and x=0
step: 5, at y=1 and x=0

Process returned 0 (0x0) execution time : 0.967 s
Press any key to continue.

4.规定，只能从起点的右侧出发，打印所有的遍历结果：
只需在(3)的基础上，类似于(2)，每次遍历之后取消标记那个点

5.规定，只能从起点的下方出发，只遍历一次，打印遍历结果：
等同于(3)，只需要这样修改 main 函数：

```c
book[0][0] = 1; //从起点出发，所以起点已经走过了，把它标记为1
recordY[0] = 0; //先把起点所在的行保存下来
recordX[0] = 0; //并把起点所在的列保存下来
book[0][1] = 1; //规定了只能从起点的下方出发，那么下个点一定是y=1,x=0
recordY[1] = 0; //第1步的Y坐标
recordX[0] = 1; //第1步的X坐标
dfs(1, 0, 1);   //从第0行，第0列，开始遍历图，当前步数是1
```

6.规定，只能从起点的下方出发，打印所有的遍历结果：
等同于(4)，每次遍历之后取消标记那个点

7.打印出从起点出发到终点的所有路径，并给出最短的步数：

```c
#include <stdio.h>

int map[3][2];
int book[3][2];
int recordY[6];
int recordX[6];
int next[4][2] = {{-1, 0}, {0, 1}, {1, 0}, {0, -1}};
int minStep = 9999; //保存每次遍历结果的最小步数

void dfs(int y, int x, int step)
{
  int i, tx, ty;
  if (y == 2 && x == 1)
  { //到达终点
    printf("Traverse complete\n");
    for (i = 0; i <= step; i++)
    { //打印出保存在recordY和recordX中的点的坐标
      printf("step: %d, at y=%d and x=%d\n", i, recordY[i], recordX[i]);
    }
    if (minStep > step)
      minStep = step; //发现步数更少的遍历方式，更新最小步数
    return;
  }
  for (i = 0; i < 4; i++)
  {                      //还没遍历完，继续枚举各个方向并进行下次递归
    ty = y + next[i][0]; //下个点所在的行
    tx = x + next[i][1]; //下个点所在的列
    if (tx > -1 && tx < 2 && ty > -1 && ty < 3 && book[ty][tx] != 1)
    {                         //这个点必须在图内，且没有被标记
      book[ty][tx] = 1;       //标记这个点
      recordY[step + 1] = ty; //保存这个点所在的行
      recordX[step + 1] = tx; //保存这个点所在的列
      dfs(ty, tx, step + 1);  //对这个点继续DFS
      book[ty][tx] = 0;       //取消标记这个点
    }
  }
}

int main()
{
  book[0][0] = 1; //从起点出发，所以起点已经走过了，把它标记为1
  recordY[0] = 0; //先把起点所在的行保存下来
  recordX[0] = 0; //并把起点所在的列保存下来
  dfs(0, 0, 0);   //从第0行，第0列，开始遍历图，当前步数是1
  printf("The minimum step is %d\n", minStep);

  return 0;
}
```

输出：Traverse complete
step: 0, at y=0 and x=0
step: 1, at y=0 and x=1
step: 2, at y=1 and x=1
step: 3, at y=2 and x=1
Traverse complete
step: 0, at y=0 and x=0
step: 1, at y=0 and x=1
step: 2, at y=1 and x=1
step: 3, at y=1 and x=0
step: 4, at y=2 and x=0
step: 5, at y=2 and x=1
Traverse complete
step: 0, at y=0 and x=0
step: 1, at y=1 and x=0
step: 2, at y=1 and x=1
step: 3, at y=2 and x=1
Traverse complete
step: 0, at y=0 and x=0
step: 1, at y=1 and x=0
step: 2, at y=2 and x=0
step: 3, at y=2 and x=1
The minimum step is 3

Process returned 0 (0x0) execution time : 0.399 s
Press any key to continue.

8.由于故障，点(y=1,x=1)不能被访问，求出现在从起点到终点的所有路径：
只需修改(7)的 main 函数和 dfs 函数，具体如下，
修改 main 函数：

```c
map[1][1] = -1; //值为-1表示这个点不能被访问
book[0][0] = 1; //从起点出发，所以起点已经走过了，把它标记为1
recordY[0] = 0; //先把起点所在的行保存下来
recordX[0] = 0; //并把起点所在的列保存下来
dfs(0, 0, 0);   //从第0行，第0列，开始遍历图，当前步数是1
printf("The minimum step is %d\n", minStep);
```

修改 dfs 函数：

```c
if (tx > -1 && tx < 2 && ty > -1 && ty < 3 && book[ty][tx] != 1 && map[ty][tx] != -1)
{ //这个点必须在图内，且没有被标记，还要是能能访问的点
  // ...
}
```

输出：
Traverse complete
step: 0, at y=0 and x=0
step: 1, at y=1 and x=0
step: 2, at y=2 and x=0
step: 3, at y=2 and x=1
The minimum step is 3

Process returned 0 (0x0) execution time : 0.572 s
Press any key to continue.

PS：可以看出，map 数组其实只在第 8 问中使用到了。

==主题结束==

> 2020-02-10
