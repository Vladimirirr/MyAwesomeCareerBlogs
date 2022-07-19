# 遍历以邻接矩阵存储的无向图

==主题：遍历以邻接矩阵存储的无向图==

```txt
给出如下的图：
    A
  /| |\
B--|-|-C
  \| | |
   \ | |
    |\|/
    D-E （这张图就是除了B和D、C和D，其余顶点两两相连的五角星）
```

将这张无向连通图转为邻接矩阵如下：

A B C D E
A 0 1 1 1 1
B 1 0 1 0 1
C 1 1 0 0 1
D 1 0 0 0 1
E 1 1 1 1 0

无向图的邻接矩阵每行存储的是该行所代表的顶点直连的顶点有哪些，
假设起点是 A 点，终点是 E 点，回答下列问题：

1.从起点出发，遍历所有的顶点，得到所有的路径，并按遍历顺序打印出这些路径：

```c
#include <stdio.h>

int book[5];
char vertex[5] = {'A', 'B', 'C', 'D', 'E'};
int edge[5][5] = {
    {0, 1, 1, 1, 1},
    {1, 0, 1, 0, 1},
    {1, 1, 0, 0, 1},
    {1, 0, 0, 0, 1},
    {1, 1, 1, 1, 0}};
char record[5];  //用于记录走过的顶点，已走过列表
int record_num;  //记录已走过列表的长度
int firstGoback; //记录继上次递归后是否发生了第一次回溯，0表示没有，1表示发生
//某次递归发生了第一次回溯，说明DFS找到了一条路径
int path_num; //保存找到的路径个数

void dfs(int now, int step)
{
  int i, j;
  for (i = 0; i < 5; i++)
  {
    if (edge[now][i] == 1 && book[i] != 1)
    {                               //存在直连的顶点，且这个顶点还没走过
      book[i] = 1;                  //标记这个顶点，因为下一步就要去这个顶点
      record[step + 1] = vertex[i]; //把这个顶点记录到已走过列表
      record_num++;                 //对已走过列表长度+1
      firstGoback = 0;              //要进入递归，置0
      dfs(i, step + 1);             //对这个顶点继续DFS
      if (firstGoback == 0)
      {
        //等于0说明之前一直是递归，而现在发生了回溯，意味着这次回溯是继上次递归的第一次回溯
        //打印上次递归找到的所有顶点，然后把firstGoback置1，让之后的回溯不是第一次回溯
        //直到某次又发生递归，意味着又发现了新顶点，也意味着又发现了一条路径，再把firstGoback置0
        //如此反复
        printf("Path %d: ", ++path_num);
        for (j = 0; j < record_num; j++)
        {
          printf("%c ", record[j]);
        }
        printf("\n");
        firstGoback = 1; //置1是为了当发生连续回溯时，使第二次及之后的回溯认为自己不是第一次回溯
      }
      book[i] = 0;  //取消标记
      record_num--; //已走过顶点被取消标记，说明这个顶点现在没走过了，那么已走过列表长度也要-1
    }
  }
}

int main()
{
  book[0] = 1;     //起点是A，所以A已经走过，将它标记
  record[0] = 'A'; //起点其走过，把它加入已走过列表
  record_num = 1;  //已走过列表+1
  dfs(0, 0);       //从起点开始遍历

  return 0;
}
```

输出：
Path 1: A B C E D
Path 2: A B E C
Path 3: A B E D
Path 4: A C B E D
Path 5: A C E B
Path 6: A C E D
Path 7: A D E B C
Path 8: A D E C B
Path 9: A E B C
Path 10: A E C B
Path 11: A E D

Process returned 0 (0x0) execution time : 0.252 s
Press any key to continue.

PS：如果单纯是为了遍历，则不需要输出每次遍历得到的路径，删去那些用于打印路径相关的代码，核心代码是很精简的。

2.从起点出发，要求下一步达到的顶点是 C，然后遍历剩下的顶点，打印出所有的路径：
只需修改 main 函数如下：

```c
book[0] = 1;     //起点是A，所以A已经走过，将它标记
record[0] = 'A'; //起点已走过，把它加入已走过列表
book[2] = 1;     //由于规定了下一步是C，所以把C也标记已走过，C在book数组中是下标2
record[1] = 'C'; //相同
record_num = 2;  //已走过列表+2
dfs(2, 1);       //从C点开始遍历
```

输出：
Path 1: A C B E D
Path 2: A C E B
Path 3: A C E D

Process returned 0 (0x0) execution time : 0.898 s
Press any key to continue.

3.从起点出发，要求下一步达到的顶点是 C，然后遍历剩下的顶点（只遍历一次），打印出遍历的路径：
要实现只遍历一次，只需要当回溯一旦发生，就让它一直回溯到开始，然后结束函数，如下，

```c
#include <stdio.h>

int book[5];
char vertex[5] = {'A', 'B', 'C', 'D', 'E'};
int edge[5][5] = {
    {0, 1, 1, 1, 1},
    {1, 0, 1, 0, 1},
    {1, 1, 0, 0, 1},
    {1, 0, 0, 0, 1},
    {1, 1, 1, 1, 0}};
char record[5]; //用于记录走过的顶点，已走过列表
int record_num; //记录已走过列表的长度
int goback;     //标识是否已经发生了回溯，0表示没有，1表示发生

void dfs(int now, int step)
{
  int i, j;
  for (i = 0; i < 5; i++)
  {
    if (edge[now][i] == 1 && book[i] != 1 && goback != 1)
    {                               //存在直连的顶点，且这个顶点还没走过，且还没发生过回溯
      book[i] = 1;                  //标记这个顶点，因为下一步就要去这个顶点
      record[step + 1] = vertex[i]; //把这个顶点记录到已走过列表
      record_num++;                 //对已走过列表长度+1
      goback = 0;                   //要进入递归，置0
      dfs(i, step + 1);             //对这个顶点继续DFS
      if (goback == 0)
      {             //发生了回溯，要判断是不是首次回溯，如果goback等于0，说明这次是首次回溯
        goback = 1; //发生了首次回溯，就让这个回溯一直进行下去，直到回到递归的首次调用
        for (j = 0; j < record_num; j++)
        {
          printf("%c ", record[j]);
        }
        printf("\n");
      }
    }
  }
}

int main()
{
  book[0] = 1;
  record[0] = 'A';
  book[2] = 1;
  record[1] = 'C';
  record_num = 2;
  dfs(2, 1); //从C点开始遍历

  return 0;
}
```

输出：
A C B E D

Process returned 0 (0x0) execution time : 0.231 s
Press any key to continue.

4.打印从起点到终点的所有路径，并找出最短路径：
这道题比(1)要简单很多，虽然都是打印出所有路径，但是这道题的“什么时候该打印已遍历的路径”这个条件很显而易见的，就是当递归处于终点时（vertext[now]等于'C'时），就代表一次寻路完成，把这个路径打印出来即可，而(1)打印一条路径的条件是“发生了继上次递归后的首次回溯”，这需要一个变量来记录是否发生了首次回溯，本题的代码如下：

```c
#include <stdio.h>

int book[5];
char vertex[5] = {'A', 'B', 'C', 'D', 'E'};
int edge[5][5] = {
    {0, 1, 1, 1, 1},
    {1, 0, 1, 0, 1},
    {1, 1, 0, 0, 1},
    {1, 0, 0, 0, 1},
    {1, 1, 1, 1, 0}};
char record[5];     //用于记录走过的顶点，已走过列表
int record_num;     //记录已走过列表的长度
int path_num;       //保存找到的路径个数
int minStep = 9999; //保存最短路径的步数

void dfs(int now, int step)
{
  int i;
  if (vertex[now] == 'E')
  { //到终点
    printf("Path %d: ", ++path_num);
    for (i = 0; i < record_num; i++)
    {
      printf("%c ", record[i]);
    }
    printf(", in this case, the step is %d", step);
    printf("\n");
    if (minStep > step)
      minStep = step; //更新最少步数
    return;
  }
  for (i = 0; i < 5; i++)
  {
    if (edge[now][i] == 1 && book[i] != 1)
    {                               //存在直连的顶点，且这个顶点还没走过
      book[i] = 1;                  //标记这个顶点，因为下一步就要去这个顶点
      record[step + 1] = vertex[i]; //把这个顶点记录到已走过列表
      record_num++;                 //对已走过列表长度+1
      dfs(i, step + 1);             //对这个顶点继续DFS
      book[i] = 0;                  //取消标记
      record_num--;                 //已走过顶点被取消标记，说明这个顶点现在没走过了，那么已走过列表长度也要-1
    }
  }
}

int main()
{
  book[0] = 1;     //起点是A，所以A已经走过，将它标记
  record[0] = 'A'; //起点其走过，把它加入已走过列表
  record_num = 1;  //已走过列表+1
  dfs(0, 0);       //从起点开始遍历
  printf("The min step is %d\n", minStep);

  return 0;
}
```

输出：
Path 1: A B C E , in this case, the step is 3
Path 2: A B E , in this case, the step is 2
Path 3: A C B E , in this case, the step is 3
Path 4: A C E , in this case, the step is 2
Path 5: A D E , in this case, the step is 2
Path 6: A E , in this case, the step is 1
The min step is 1

Process returned 0 (0x0) execution time : 0.356 s
Press any key to continue.

5.由于故障，顶点 C 不能被访问，但不能从邻接矩阵中删除该点，打印出所有从起点到终点的路径，并给出最短路径：
只需在(4)的基础上修改 dfs 函数中的 for 循环内的 if 语句，多加个"vertex[i]!=='C'"条件即可，如下，

```c
if (edge[now][i] == 1 && book[i] != 1 && vertex[i] != 'C')
{ //存在直连的顶点，且这个顶点还没走过，且不是C点，因为C点坏了，不能被访问到
  // ...
}
```

输出：
Path 1: A B E , in this case, the step is 2
Path 2: A D E , in this case, the step is 2
Path 3: A E , in this case, the step is 1
The min step is 1

Process returned 0 (0x0) execution time : 0.574 s
Press any key to continue.

==主题结束==

> 2020-02-12
