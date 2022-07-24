WASM(WebAssembly) 类似于 Java 的字节码技术，由浏览器的运行时环境执行，发挥硬件资源（GPU、多线程、等等）从而将近或达到原生程序的执行效率，最终解决 JavaScript 语言效率不高的问题，与 JavaScript 能完全的互通。

可以编译为本地原生程序的语言（C\C++、Rust、等等）都可以编译为 WASM（交叉编译），以及官方的 WebAssemblyScript 脚本语言。当然，其他需要运行时环境的语言（Java、Python、等等）也可以编译为 WASM，只是效率低于原生语言。

支持编译为 WASM 语言的清单列表：https://github.com/appcypher/awesome-wasm-langs

WebAssembly 的长久目标：

- 定义一个可移植的、体积小的、加载快的二进制格式作为编译结果，充分发挥客户端的硬件资源（PC、移动设备、互联网设备、等等），使其在多数平台上能达到相应原生程序的执行效率

- 优先对 C\C++ 和 Rust 语言提供交叉编译的支持

- 代替 asm.js 技术
