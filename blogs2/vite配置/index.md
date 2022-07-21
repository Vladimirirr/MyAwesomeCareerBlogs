# Vite 配置踩坑总结

## 环境变量与模式

内置命令的模式：
命令：vite \ vite dev \ vite serve 三个命令都相同，运行在 development 模式下
命令：vite \ vite dev \ vite serve --mode=staging 运行在自定义的 staging 模式下，不过内部的编译策略还是 development
命令：vite build 运行在 production 模式下
命令：vite build --mode=staging 运行在自定义的 staging 模式下，不过内部的编译策略还是 production
命令：vite preview 开启一个静态服务器以托管 dist 目录

vite 使用特殊的对象`import.meta.env: Object`导出环境变量，默认导出下列的环境变量（暴露到客户端源代码里）：

1. `import.meta.env.MODE`: {string} 运行的模式

2. `import.meta.env.BASE_URL`: {string} 根 URL

3. `import.meta.env.PROD`: {boolean} 是否为生产环境

4. `import.meta.env.DEV`: {boolean} 是否为开发环境 (永远与`import.meta.env.PROD`相反)

对应的模式`xxxx`将加载对应的环境变量文件`.env, .env.xxxx, .env.xxxx.local`，其中`.env`是全局环境变量，在任何模式下都会被加载，`.local`结尾的环境变量是本地使用，应该把它加入到`.gitignore`，默认只有以`VITE_*`开头的变量才会被 vite 暴露到客户端源代码里面。

环境变量暴露的方式

1. 明确指定`import.meta.env.xxxx`且存在，直接以双引号的字符串常量暴露出来
2. 明确指定`import.meta.env.xxxx`但不存在，直接`{}.xxxx`暴露出来
3. 使用变量指定`import.meat.env[xxxx]`，使用`{...allExposed}.xxxx`暴露出来

假设有如下`.env`文件：

```env
NODE_ENV=production # 在自定义模式下，需要指定内部编译的策略，默认是production（对webpack生效），vite的内部策略只取决于command的值（serve for development 或 build for production）
DB_PASSWORD=1234
VITE_APP_TITLE=a nice title here
```

只有`VITE_APP_TITLE`将暴露给客户端源代码。

注意，在`vite.config.js`里面不能访问到任何环境变量暴露出来的值，这与 webpack 能使用`process.env`访问到不同，如果需要访问它们，要使用 vite 暴露的 loadEnv 方法手动访问：

```js
import path from 'path'
import { defineConfig, loadEnv } from 'vite'

// #A
// console.log(import.meta.env.DB_PASSWORD) // import.meta.env returns undefined
// console.log(import.meta.env.VITE_APP_TITLE) // import.meta.env returns undefined
// console.log(process.env.DB_PASSWORD) // DB_PASSWORD does not exist in process.env
// console.log(process.env.VITE_APP_TITLE) // VITE_APP_TITLE does not exist in process.env

export default defineConfig(({ mode, command }) => {
  // 还可以向defineConfig传入一个返回promise的函数，从而实现配置的异步生成
  // vite / vite dev / vite serve 输出 { mode: 'development', command: 'serve' }
  // vite build 输出 { mode: 'production', command: 'build' }
  // vite preview 输出 { mode: 'production', command: 'preview' }
  console.log(mode, command)
  // 在此方法里同样访问不到环境变量文件里写的值（参见引用#A）
  // 需要使用Vite提供的loadEnv函数手动加载（还可以使用更底层的node.js原生fs文件操作或其他读写env的工具方法）
  switch (mode) {
    case 'production': // 或者自定义的mode
      // loadEnv(modeName: string, envFilesDir: string, prefix?: string | string[])
      // prefix：取出指定前缀的环境变量名，默认是'VITE_'，传入空字符串将取出全部的环境变量（还包括了process.env）
      const envForProduction = loadEnv(mode, path.resolve('./'), '')
      console.log(envForProduction)
      // do something
      break
  }
  return {
    // mode: 'development',
    // webpack根据对应的mode使用不同的编译策略：
    // 1. development 把process.env.NODE_ENV设置成development，使用webpack的development内部编译策略（本质上，各种插件读取NODE_ENV的值，来决定如何处理代码）
    // 2. production 把process.env.NODE_ENV设置成production，使用webpack的production内部编译策略
    // 如果没用手动指定NODE_ENV的值，默认赋值production，mode的值存在与否无关紧要，因为mode就是为了派生出对应的NODE_ENV
    // 所以，自定义模式，必须要指定webpack可识别的NODE_ENV（目前是development、production和test），如果使用其他值，webpack的插件可能不认识，将使用插件的默认行为，就可能导致编译发生未定义的行为
    // 但是vite的mode不会派生出对应的NODE_ENV，vite的NODE_ENV只取决于执行vite时的command
    // 所以vite无法打包一个未优化的bundle出来，而webpack可以（虽然这用处不大）
    build: {
      lib: {
        entry: path.resolve(__dirname, './src/index.js'),
        formats: ['cjs'],
      },
    },
  }
})
```
