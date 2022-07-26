# 计算机操作系统发展历史简述

1947，发明了晶体管，使得计算机不再是机械设备，而是电子设备，为操作系统奠定了基础。

1960，很多计算机制造商做出了各自的可以进行批处理操作的系统，但是只能限定于限定的硬件环境。

1964，IBM 推出了 IBM System/360 系统，能够在一系列的硬件环境中运行。

1965，AT&T 贝尔实验室、麻省理工和其他一些团队打算搞一个多用户多任务的复杂操作系统，取名为 Multics（Multiplexed Information and Computing System），但是 1969 年，该项目发展过于缓慢，导致破产。

1969，参与项目的 Ken Thompson（汤姆森）和 Dennis Ritchie（瑞奇）因为项目的破产回到贝尔实验室，利用 PDP-7 机器写了一个简易的系统（1970 年完成），但是因为调侃这个系统无法和 Multics 媲美（其实是调侃 Multics），就取名为 Unics（Uniplexed Information and Computing System）,汤姆森把名字稍微改了一下变成了 Unix，所以 1970 便是 Unix 的元年。
其他：早期的 Unix 是完全使用汇编写的，在开发 Unix 时候汤姆森在 BCPL（由 CPL（Combined Programming Language）改进而来，两者都由剑桥大学发明）基础上发明了 B 语言，然后对 Unix 使用 B 语言进行了部分改进，1973 年，瑞奇与汤姆森一起改进了 B 语言从而发明了 C 语言，1974 年，Unix 用 C 语言完全重写并且向外界发布。

1974，贝尔实验室把 Unix 的源代码拷贝给了各个实验室、学校、公司，其中加州大学伯里克分校对 Unix 源代码进行了深度研究不断改进 Unix，极大地推进了 Unix 的发展，其中著名的 TCP/IP 协议就是他们在 Unix 实现的，然后他们把他们搞的这一套 Unix 称作 BSD（Berkeley Software Distribution）。

1980，西雅图一名程序员研发出 86-DOS 系统，被微软比尔盖茨买下版权。

1981，MS-DOS 上市，与 IBM 合作，在 IBM 机器上捆绑销售 MS-DOS。

1983，AT&T 被反垄断法拆成了几个子公司，这时，AT&T 看到 Unix 分光无限好决定对其进行商业用途，不再对外开放源代码，然而伯里克分校的 BSD 团队并不需要钱，所以他们把受 Unix 商业版影响的代码部分全部自己改写。最后 BSD 项目团队最后研究出了完全自己的 Unix，因为版权问题只能叫做类 Unix 系统（Unix-like）（例如 Free-BSD, MAC OS 前身等等）。

1983，Richard Stallman 发起革奴计划（GNU，GNU is Not Unix，意指是一个免费的，开源的，自由的，和 Unix 一样强大的，但不是 Unix 的系统），目标是创建一个完全自由开放的操作系统。

1984，苹果公司发布基于 BSD 项目的操作系统 System 1.0（MAC OS 8 之前都是以 System x.x 命名的），并搭载在麦金塔电脑上，含有桌面、窗口?、图标、光标、菜单和卷动栏等项目。
其他：这是第一款真正的图形界面桌面系统，微软的 Windows 当时还只是嵌入在 MSDOS 下的一个程序而已。

1990，此时，GNU 计划已经完成了 Unix 中大部分工具的编写工作，就是 GNU 操作系统内核（当时称为 HURD）迟迟没能完成。

1991，System 7 发布，这时的 MAC OS 已经具备了 256 色的简易图形界面，当时的微软还停留在 DOS 时代。

1991，芬兰赫尔辛基大学的 Linus Torvalds 学生，在校期间自己搞了一个操作系统玩玩，当时在自己的系统中使用了 GNU 的 GCC, Bash 等软件，受到 GNU 计划的影响，他把自己的系统内核源代码发布到了网上，内核取名 Linux（Linus's Unix）。

1992，当时不太成熟的 Linux 内核和 GNU 工具结合产生了一个完整的自由的操作系统，称为 GNU/Linux。
其他：在 GNU/Linux 诞生的年代，已经有很多优秀的开源项目，他们和 GNU 计划无关，都是个人或是组织开发，例如 Vim, Apache, Perl, Python 等等。也正是 GNU/Linux 的开源影响，世界掀起了一股开源热，兴起了开源文化的运动，大量开源项目出现，例如 PHP, MYSQL, Ruby, NodeJS, KDE 等等。
其他：GNU/Linux 现在都被简称为 Linux，其实是不规范的，也是对 GNU 不尊敬的表现。

1993，MS-DOS 6.X ~ MS-DOS 7.X（1996 年），其中添加了一款名叫 Windows 的 GUI 程序。（Windows 1.x/2.x/3.x 一直到 Windows 9X/ME 都是 MS-DOS 下的一个 GUI（图形用户界面）程序！）

1993，微软发布 Windows10 NT 3.1 系统，这时 Windows NT 的第一代产品，包括 Workstation 和 Server 两个版本。

1994，当时 1991 年 Linux 发布到网上，世界各地广大程序员对其产生兴趣，对其研究改进，94 年 3 月 Linux 1.0 发布，Linux 成为了一个基本可用的系统内核，从此 Linux 开始了迅猛的发展。（至于为什么 Linux 图标是个企鹅，因为 Linus 小时候被企鹅攻击过，其实也没什么逻辑关系，就像你问鲁迅窗帘为什么是蓝色的，他会回答你就是我当时随便选了一个颜色而已）
其他：当时的 BSD 衍生的系统还在和 AT&T 的 Unix 系统打官司，也促使了 Linux 的发展，并且 Linus 本人承认当时他不知道还有 FreeBSD 这样的系统存在，如果知道的话，可能就不会有 Linux 了。

1995，GNU/Linux 系统越做越成熟，各个发行版推进了 GNU/Linux 在全世界的推广。

1996，KDE 团队创建了 K 桌面环境项目（K Desktop Environment），为 GNU/Linux 系统设计图形化桌面环境，桌面要有浏览器，所以他们就分了一个组来设计浏览器内核，这便是大名鼎鼎的 KHTML 和 KJavaScript，便有了之后的 Webkit 和 Blink。

1996，微软发布 Windows NT 4.0 操作系统，是 NT 系列的一个里程碑，为接下来 2000 年之后 Windows 迅猛发展打下了基础。

1997，MAC OS 8 问世，这时历史上第一款 32 位色彩，用户界面相当友好的桌面系统，甚至被称为艺术作品，以至于在 Windows 2000 之后的系统中模拟出惟妙惟肖的 Mac OS X 操作环境为荣。

1997，GNU 发起 GNOME(The GNU Network Object Model Environment)计划，意指为 UNIX-like 系统提供统一的桌面环境，1999 年第一个版本发布。

2000，MS-DOS 8.0 发布，这时最后一个 MSDOS 版本，因为微软看到了 Windows 的曙光，于是放弃了 DOS，发布 Windows NT 操作系统。
其他：Windows NT 在 2000 之前并不流行，直到 Windows2000（NT5.0），XP（NT5.1），Vista（NT6.0），Win7（NT6.1）的诞生，Windows 才真正的开始迎来自己的巅峰。另外：Windows 10 预览版内核 NT6.4，正式版内核 NT10.0。

2002，南非商人 Mark shuttleworth 推出了 Ubuntu 发行版。

> 2018-08-13
