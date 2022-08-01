# 其他杂项

## 路由与 URL

在 URL 上，你可以位于【一个文件】或【一个目录】，以【\】做区分，而在命令行模式下，你不能位于【一个文件】，永远只能位于【一个目录】，这是 URL 与命令行在路径处理上的最大区别，ReachRouter 使用命令行风格的路径在做路由导航，它忽视末尾的【\】，"\some\where\"被视作"\some\where"。

## 什么是 FaaS 和 Serverless

FaaS 是一种云计算理念，即无服务端计算(Serverless Computing)，用户只关注编写业务代码，而不需要去关心云服务器的配置（任务都交给云提供商），而 FaaS 则是 Serverless 的关键，通常 Serverless 提供商还会提供 BaaS(Backend as a Service)，诸如对象存储、传统数据库、消息机制等等。
最著名的 FaaS 即 AWS 的 Lambda(Run code without thinking about servers. Pay only for the compute time you consume.)，用户只需上传代码即可，服务端会自动帮你运行。
