# 遍历以邻接矩阵存储的有向图

==主题：遍历以邻接矩阵存储的有向图==

给出如下的图：

```txt
A
/ \
B---C
\ /
D （这个图的边集={<A,B>,<A,C>,<B,C>,<B,D>,<C,B>,<C,D>,<D,C>}，可以看出这是一张稠密图）
```

将这张有向图转为邻接矩阵（出边）如下：

A B C D
A 0 9 2 X
B X 0 6 3
C X 7 0 1
D X X 1 0（表中的 X 表示正无穷）

有向图的邻接矩阵每行存储的是该行所代表的顶点直连的顶点有哪些，其中 0 表示顶点自身，X 表示没有直连，其他数字表示这条直连边的权重，
假设起点是 A 点，终点是 D 点，回答下列问题：

1.从起点出发，遍历所有的顶点，得到所有的路径，并按遍历顺序打印出这些路径以及对应的开销（路径中每条边权重的和）：

```c
#include <stdio.h>
#define X 9999 //假设X表示无穷

int book[4];
char vertex[4] = {'A', 'B', 'C', 'D'};
int edge[4][4] = {
    {0, 9, 2, X},
    {X, 0, 6, 3},
    {X, 7, 0, 1},
    {X, X, 1, 0}};
char record[4];  //用于记录走过的顶点，已走过列表
int record_num;  //记录已走过列表的长度
int firstGoback; //记录继上次递归后是否发生了第一次回溯，0表示没有，1表示发生
//某次递归发生了第一次回溯，说明DFS找到了一条路径
int path_num;    //保存找到的路径个数
int totalWeight; //保存每条路经的总开销

void dfs(int now, int step)
{
  int i, j;
  for (i = 0; i < 4; i++)
  {
    if (edge[now][i] != X && edge[now][i] != 0 && book[i] != 1)
    { //存在直连的顶点，且这个顶点不是自身，且这个顶点还没走过
      //即将从当前顶点vertex[now]访问下一个顶点vertex[i]
      book[i] = 1;                  //标记这个顶点，因为下一步就要去这个顶点
      record[step + 1] = vertex[i]; //把这个顶点记录到已走过列表
      record_num++;                 //对已走过列表长度+1
      totalWeight += edge[now][i];  //这条路径的总开销增加，增加的大小是当前顶点到下个顶点的边的权重
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
        printf(", and the total cost is %d", totalWeight);
        printf("\n");
        firstGoback = 1; //置1是为了当发生连续回溯时，使第二次及之后的回溯认为自己不是第一次回溯
      }
      book[i] = 0;                 //取消标记
      record_num--;                //已走过顶点被取消标记，说明这个顶点现在没走过了，那么已走过列表长度也要-1
      totalWeight -= edge[now][i]; //已走过顶点被取消标记，说明这个点已经被移出路径，那么路径的总开销也要减去被移除的边的权重
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
Path 1: A B C D , and the total cost is 16
Path 2: A B D C , and the total cost is 13
Path 3: A C B D , and the total cost is 12
Path 4: A C D , and the total cost is 3

Process returned 0 (0x0) execution time : 0.590 s
Press any key to continue.

PS：如果单纯是为了遍历，则不需要输出每次遍历得到的路径，删去那些用于打印路径相关的代码，核心代码是很精简的。

2.从起点出发，要求下一步达到的顶点是 C，然后遍历剩下的顶点，打印出所有的路径：
只需修改 main 函数如下：

```c
book[0] = 1;     //起点是A，所以A已经走过，将它标记
record[0] = 'A'; //起点其走过，把它加入已走过列表
book[2] = 1;     //相同
record[1] = 'C'; //相同
record_num = 2;  //已走过列表+2
totalWeight = 2; //边<A,C>的权重是2
dfs(2, 1);       //从起点开始遍历，step等于1是因为A点到C点，规定，每次从一个顶点到另一个顶点，step增1，位于起点时，step等于0
```

输出：
Path 1: A C B D , and the total cost is 12
Path 2: A C D , and the total cost is 3

Process returned 0 (0x0) execution time : 0.359 s
Press any key to continue.

3.从起点出发，要求下一步达到的顶点是 C，然后遍历剩下的顶点（只遍历一次），打印出遍历的路径：
要实现只遍历一次，只需要当回溯一旦发生，就让它一直回溯到开始，然后结束函数，如下，

```c
#include <stdio.h>
#define X 9999 //假设X表示无穷

int book[4];
char vertex[4] = {'A', 'B', 'C', 'D'};
int edge[4][4] = {
    {0, 9, 2, X},
    {X, 0, 6, 3},
    {X, 7, 0, 1},
    {X, X, 1, 0}};
char record[4];  //用于记录走过的顶点，已走过列表
int record_num;  //记录已走过列表的长度
int goback;      //标识是否已经发生了回溯，0表示没有，1表示发生
int path_num;    //保存找到的路径个数
int totalWeight; //保存每条路经的总开销

void dfs(int now, int step)
{
  int i, j;
  for (i = 0; i < 4; i++)
  {
    if (edge[now][i] != X && edge[now][i] != 0 && book[i] != 1 && goback != 1)
    { //存在直连的顶点，且这个顶点不是自身，且这个顶点还没走过，且还没发生过回溯
      //即将从当前顶点vertex[now]访问下一个顶点vertex[i]
      book[i] = 1;                  //标记这个顶点，因为下一步就要去这个顶点
      record[step + 1] = vertex[i]; //把这个顶点记录到已走过列表
      record_num++;                 //对已走过列表长度+1
      totalWeight += edge[now][i];  //这条路径的总开销增加，增加的大小是当前顶点到下个顶点的边的权重
      goback = 0;                   //要进入递归，置0
      dfs(i, step + 1);             //对这个顶点继续DFS
      if (goback == 0)
      {             //发生了回溯，要判断是不是首次回溯，如果goback等于0，说明这次是首次回溯
        goback = 1; //发生了首次回溯，就让这个回溯一直进行下去，直到回到递归的首次调用
        printf("Path %d: ", ++path_num);
        for (j = 0; j < record_num; j++)
        {
          printf("%c ", record[j]);
        }
        printf(", and the total cost is %d", totalWeight);
        printf("\n");
      }
    }
  }
}

int main()
{
  book[0] = 1;     //起点是A，所以A已经走过，将它标记
  record[0] = 'A'; //起点其走过，把它加入已走过列表
  book[2] = 1;     //相同
  record[1] = 'C'; //相同
  record_num = 2;  //已走过列表+2
  totalWeight = 2; //边<A,C>的权重是2
  dfs(2, 1);       //从起点开始遍历

  return 0;
}
```

输出：
Path 1: A C B D , and the total cost is 12

Process returned 0 (0x0) execution time : 2.262 s
Press any key to continue.

4.打印从起点到终点的所有路径，并找出最短路径：
这道题比(1)要简单很多，虽然都是打印出所有路径，但是这道题的“什么时候该打印已遍历的路径”这个条件很显而易见的，就是当递归处于终点时（vertext[now]等于'D'时），就代表一次寻路完成，把这个路径打印出来即可，而(1)打印一条路径的条件是“发生了继上次递归后的首次回溯”，这需要一个变量来记录是否发生了首次回溯，本题的代码如下：

```c
#include <stdio.h>
#define X 9999 //假设X表示无穷

int book[4];
char vertex[4] = {'A', 'B', 'C', 'D'};
int edge[4][4] = {
    {0, 9, 2, X},
    {X, 0, 6, 3},
    {X, 7, 0, 1},
    {X, X, 1, 0}};
char record[4];         //用于记录走过的顶点，已走过列表
int record_num;         //记录已走过列表的长度
int path_num;           //保存找到的路径个数
int totalWeight;        //保存每条路经的总开销
int minTotalWeight = X; //保存路径的最小开销

void dfs(int now, int step)
{
  int i;
  if (vertex[now] == 'D')
  { //到了终点
    printf("Path %d: ", ++path_num);
    for (i = 0; i < record_num; i++)
    {
      printf("%c ", record[i]);
    }
    printf(", in this case, the total cost is %d", totalWeight);
    printf("\n");
    if (minTotalWeight > totalWeight)
      minTotalWeight = totalWeight; //更新路径的最少开销
    return;
  }
  for (i = 0; i < 4; i++)
  {
    if (edge[now][i] != X && edge[now][i] != 0 && book[i] != 1)
    { //存在直连的顶点，且这个顶点不是自身，且这个顶点还没走过
      //即将从当前顶点vertex[now]访问下一个顶点vertex[i]
      book[i] = 1;                  //标记这个顶点，因为下一步就要去这个顶点
      record[step + 1] = vertex[i]; //把这个顶点记录到已走过列表
      record_num++;                 //对已走过列表长度+1
      totalWeight += edge[now][i];  //这条路径的总开销增加，增加的大小是当前顶点到下个顶点的边的权重
      dfs(i, step + 1);             //对这个顶点继续DFS
      book[i] = 0;                  //取消标记
      record_num--;                 //从已走过列表删除这个顶点
      totalWeight -= edge[now][i];  //从总开销中减去这条边的权重
    }
  }
}

int main()
{
  book[0] = 1;     //起点是A，所以A已经走过，将它标记
  record[0] = 'A'; //起点其走过，把它加入已走过列表
  record_num = 1;  //已走过列表+1
  dfs(0, 0);       //从起点开始遍历
  printf("So, the min cost path is %d\n", minTotalWeight);

  return 0;
}
```

输出：
Path 1: A B C D , in this case, the total cost is 16
Path 2: A B D , in this case, the total cost is 12
Path 3: A C B D , in this case, the total cost is 12
Path 4: A C D , in this case, the total cost is 3
So, the min cost path is 3

Process returned 0 (0x0) execution time : 0.256 s
Press any key to continue.

PS：如果单纯的只是想知道起点到终点的最小开销是多少，而不用知道具体的路径，那么代码可以这样写：

```c
#include <stdio.h>
#define X 9999 //假设X表示无穷

int book[4];
char vertex[4] = {'A', 'B', 'C', 'D'};
int edge[4][4] = {
    {0, 9, 2, X},
    {X, 0, 6, 3},
    {X, 7, 0, 1},
    {X, X, 1, 0}};
int minTotalWeight = X; //保存路径的最小开销

void dfs(int now, int step)
{
  int i;
  if (step > minTotalWeight)
    return; //如果当前走过的路径的开销已经大于上次记录的到终点的最小路径开销，那么就没必要继续在这个点递归了
  if (vertex[now] == 'D')
  { //到了终点
    if (minTotalWeight > step)
      minTotalWeight = step; //更新路径的最少开销
    return;
  }
  for (i = 0; i < 4; i++)
  {
    if (edge[now][i] != X && edge[now][i] != 0 && book[i] != 1)
    { //存在直连的顶点，且这个顶点不是自身，且这个顶点还没走过
      //即将从当前顶点vertex[now]访问下一个顶点vertex[i]
      book[i] = 1;                 //标记这个顶点，因为下一步就要去这个顶点
      dfs(i, step + edge[now][i]); //对这个顶点继续DFS
      /*
      在以往的代码实现中，dfs函数的step代表的含义是已经走过的顶点个数，
      之所以step的含义是这样，
      其一是让每次递归知道自己目前处于途中的第几个顶点，规定起点的step是0，
      其二是给记录已走过顶点的数组(record)做索引，
      而在这里，不再需要打印出起点到终点的路径，每次递归也不需要知道自己处于途中的第几个顶点，
      这样，step就可以修改它的含义，赋予新的含义：当前已走过顶点的总开销，
      相当于代替了原先的totalWeight变量，
      这时，建议将step换个名字，比如换成distance或totalCost或totalWeight等等
      */
      book[i] = 0; //取消标记
    }
  }
}

int main()
{
  book[0] = 1; //起点是A，所以A已经走过，将它标记
  dfs(0, 0);   //从起点开始遍历
  printf("Finally the min cost of point A to D is %d\n", minTotalWeight);

  return 0;
}
```

输出：
Finally the min cost of point A to D is 3

Process returned 0 (0x0) execution time : 0.690 s
Press any key to continue.

5.由于故障，顶点 C 不能被访问，但不能从邻接矩阵中删除该点，打印出所有从起点到终点的路径，并给出最短路径：
只需在(4)的基础上修改 dfs 函数中的 for 循环内的 if 语句，多加个"vertex[i]!=='C'"条件即可，如下，

```c
if (edge[now][i] != X && edge[now][i] != 0 && book[i] != 1 && vertex[i] != 'C')
{ //如果当前顶点是C，则不进入条件体
  // ...
}
```

输出：
Path 1: A B D , in this case, the total cost is 12
So, the min cost path is 12

Process returned 0 (0x0) execution time : 0.315 s
Press any key to continue.

==主题结束==
