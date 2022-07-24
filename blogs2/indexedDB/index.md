IndexedDB 是一个事务型数据库系统，类似于基于 SQL 的 RDBMS。 然而，不像 RDBMS 使用固定的表结构，IndexedDB 是一个基于 JavaScript 的面向对象的数据库。IndexedDB 读写以键索引的对象；可以存储【结构化克隆算法】支持的任何对象（包括函数、Symbol、Blob 和 File 等等的特殊类型）。只需要指定数据库模式，建立数据库的连接，然后检索和更新一系列事务。

使用 IndexedDB（离线存储数据） 和 ServiceWorker（离线存储资源） 可以构建健壮的离线 PWA。
