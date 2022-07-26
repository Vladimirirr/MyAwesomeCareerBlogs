# 编码简述

常见编码有 UCS-2, UCS-4, UTF-8, UTF-16, UTF-32, ASCII, ANSI 等等。

我们都知道 ASCII，这是最早也是最简单的一种编码，美国人用 1 个字节（准确的来说是后 7 位，即 0x00 到 0x7F）来编码英文字母、标点、数字等等，后来西方国家（法国、德国等）把最高位也利用上，来编码自己的语言字符（前 128 个字符与美国的一样，后面 128 个根据每个国家语言的不同而不同，比如法国的第 200 位是'é'，而德国的第 200 位是'ä'），这样 ASCII 字符集就被扩展了。

可是，到了亚洲，编码一下子就复杂了？单单一门汉语，字符个数就是万级别的（常用的汉字大约 3000 个），更不用说还有韩文、日文等。我们国家也有自己的几套编码方案，如 GB2312，GBK，GB18030 等，同样的，日本有 Shift-JIS 等，韩国有 EUC-KR 等。

ISO（国际标准化组织）决定要制订一个包含地球所有语种在内的通用字符集，这项项目叫做 Unicode（Universal Multiple-Octet Coded Character Set，简称 UCS），它从序号 0 开始对全球所有语种的字符进行编号，为了保证兼容，前 128 个字符就是最早的 ASCII 编码。其中 UCS-2, UCS-4, UTF-8, UTF-16, UTF-32, GBK, BIG5, EUC-KR 等等都是对 Unicode 的一种实现方式，前 5 种是全球通用的实现方式，后面 3 种是具体地区对 Unicode 的实现方式。

UCS-2：对每个字符都采用 2 个字节的编码方式，比如字母'a'的编码就是 0x0061，可以表示 2^16 个字符，但是对纯英文文档，使用这种编码的文件是使用 ASCII 编码大小的 2 倍。（有些文本编辑器中的 Unicode 编码就是指此编码，一般而言，广义的 Unicode 表示上述提到的 ISO 制定的项目，侠义的 Unicode 表示以 2 个字节来编码字符的一种编码方式，等同于 UCS-2）

UCS-4：和 UCS-2 一样，始终用 4 个字节表示一个字符，其实真正使用时只用了 31 位，最高位规定为 0，而 2^31=0x80000000，所以 UCS-4 的范围是[0x00000000, 0x7FFFFFFF]，现在的 Unicode 编号只编到了 0x10FFFF，这个范围已经包含了目前地球已知的所有语种字符，我们把每 65536 个字符称作一个平面，其中[0,65535]称为基本多文种平面(Basic Multilingual Plane,简称 BMP)，[65536,0x10FFFF]还有 16 个平面，所以[0,0x10FFFF]一共有 17 个平面。（平面是如何划分的？以及每个平面包含哪些内容？见附 1）

UTF-8：全球最通用的编码方式，具体编码规则见附 2。（Unicode 转 UTF-8 的规则可以参阅百度百科：UTF-8）

UTF-16：是对 UCS-2 的扩展，位于基本平面的字符和 UCS-2 编码相同，后面的从第 65536 开始一直到 0x10FFFF 编号的字符是 UTF-16 新增的字符集，用 4 个字节编码。在一个 UTF-16 编码的文件，当遇到 2 个字节时，如何判断是代表 1 个字符还是和后面的 2 个字节组合在一起用 4 个字节表示的一个字符呢？所以 UTF-16 中引出了代理对的概念，在 UTF-16 中为了要表示剩下的 16 个平面的字符时（UTF-16 范围是 0 到 0x10FFFF 为止的，共 17 个平面），在基本平面的 0xD800~0xDFFF 这些码点设为代理，一共可以代理 1024 的平方个字符（0xD800~0xDBFF 共 1024 个，0xDC00~0xDFFF 共 1024 个），正好是剩下的 16 个平面的范围，可以自行验算。

UTF-32：同 UCS-4，始终用 4 字节编码一个字符。

GBK：前 128 个字符同 ASCII，后面汉字编号的具体规则可以参阅相关的资料。

ANSI：该编码表示，当前的编码是基于 ASCII 扩展过来的（若一种编码的第 0~127 位与 ANSII 一样，就称此编码为 ANSI），在 Windows 简体中文版中，默认的 ANSI 就是 GBK，在 Windows 繁体中文版就是 BIG5。

附 1：

<table>
<tbody>
<tr>
<td>平面：</td>
<td>编码范围：</td>
<td>英文名：</td>
<td>中文名：</td>
</tr>
<tr>
<td>0号平面</td>
<td>U+0000~FFFF</td>
<td>Basic Multilingual Plane</td>
<td>基本多文种平面，简称BMP</td>
</tr>
<tr>
<td>1号平面</td>
<td>U+10000~1FFFF</td>
<td>Supplementary Multilingual Plane</td>
<td>多文种补充平面，简称SMP</td>
</tr>
<tr>
<td>2号平面</td>
<td>U+20000~2FFFF</td>
<td>Supplementary Idographic Plane</td>
<td>表意文字补充平面，简称SIP</td>
</tr>
<tr>
<td>3号平面</td>
<td>U+30000~3FFFF</td>
<td>Tertiary Ideographic Plane</td>
<td>表意文字第三平面，简称TIP</td>
</tr>
<tr>
<td>4~13号平面</td>
<td>U+40000~DFFFF</td>
<td>None</td>
<td>保留，尚未使用</td>
</tr>
<tr>
<td>14号平面</td>
<td>U+E0000~EFFFF</td>
<td>Supplementary Special-purpose Plane</td>
<td>特殊用途补充平面，简称SSP</td>
</tr>
<tr>
<td>15号平面</td>
<td>U+F0000~FFFFF</td>
<td>Private Use Area A</td>
<td>私人使用平面A，简称PUA-A</td>
</tr>
<tr>
<td>16号平面</td>
<td>U+100000~10FFFF</td>
<td>Private Use Area B</td>
<td>私人使用平面B，简称PUA-B</td>
</tr>
</tbody>
</table>

附 2：

<table>
<tbody>
<tr>
<td>Unicode范围：（十六进制）</td>
<td>UTF-8表示格式：</td>
<td>字节数：</td>
<td>说明：</td>
</tr>
<tr>
<td>0000~007F</td>
<td>0XXX XXXX</td>
<td>1</td>
<td>标准ASCII范围</td>
</tr>
<tr>
<td>0080~07FF</td>
<td>110X XXXX 10XX XXXX{1}</td>
<td>2</td>
<td>除东亚的基本世界字符（东亚字符占世界全部字符的70%）</td>
</tr>
<tr>
<td>0800~FFFF</td>
<td>1110 XXXX 10XX XXXX{2}</td>
<td>3</td>
<td>基本平面</td>
</tr>
<tr>
<td>1 0000~1F FFFF</td>
<td>1111 XXXX 10XX XXXX{3}</td>
<td>4</td>
<td>Unicode6.1定义的范围是[0,10FFFF]</td>
</tr>
<tr>
<td>20 0000~3FF FFFF</td>
<td>1111 10XX 10XX XXXX{4}</td>
<td>5</td>
<td>无</td>
</tr>
<tr>
<td>400 0000~7FFF FFFF</td>
<td>1111 110X 10XX XXXX{5}</td>
<td>6</td>
<td>通用字符集的极限</td>
</tr>
</tbody>
</table>

附 3：（常见的以数字标识的编码）

<table>
<tbody>
<tr>
<td>数字代码：</td>
<td>编码名称：</td>
<td>说明：</td>
</tr>
<tr>
<td>37</td>
<td>IBM037</td>
<td>IBM EBCDIC （美国 - 加拿大）</td>
</tr>
<tr>
<td>437</td>
<td>IBM437</td>
<td>OEM 美国</td>
</tr>
<tr>
<td>500</td>
<td>IBM500</td>
<td>IBM EBCDIC （国际）</td>
</tr>
<tr>
<td>850</td>
<td>IBM850</td>
<td>西欧字符</td>
</tr>
<tr>
<td>852</td>
<td>IBM852</td>
<td>中欧字符</td>
</tr>
<tr>
<td>932</td>
<td>Shift-JIS</td>
<td>日语</td>
</tr>
<tr>
<td>936</td>
<td>GBK</td>
<td>简体中文</td>
</tr>
<tr>
<td>949</td>
<td>KS_C_5601-1987</td>
<td>朝鲜语</td>
</tr>
<tr>
<td>950</td>
<td>BIG5</td>
<td>繁体中文</td>
</tr>
</tbody>
</table>

字符串"a 我易"在不同编码下的实现：

UTF-8：（61）（ E6 88 91）（ E6 98 93）

UTF-8 BOM：（EF BB BF）（ 61）（ E6 88 91）（ E6 98 93）

GBK：（61）（ CE D2）（ D2 D7）

UCS-2：（FF FE）（ 61 00）（ 11 62）（ 13 66）

UCS-2 BE：（FE FF）（ 00 61）（ 62 11）（ 66 13）

UTF-16：（FF FE）（ 61 00）（ 11 62）（ 13 66）

UTF-16 BE：（FE FF）（ 00 61）（ 62 11）（ 66 13）

UTF-32：（FF FE 00 00）（ 61 00 00 00 ）（11 62 00 00 ）（13 66 00 00）

UTF-32 BE：（00 00 FE FF）（ 00 00 00 61 ）（00 00 62 11）（ 00 00 66 13）

字符串"a 我\u{1D306}"在不同编码下的实现，其中\u{1D306}是一个非基本平面的字符，该字符为：𝌆（有些浏览器可能不支持显示该字符，正常显示的话，该字符类似汉字“三”多一横）

UTF-8：（61）（ E6 88 91）（ F0 9D 8C 86）

UTF-16：（FF FE ）（61 00 ）（11 62 ）（34 D8 06 DF）

UTF-32：（FF FE 00 00）（ 61 00 00 00）（ 11 62 00 00）（ 06 D3 01 00）

文献参考：

1.百度百科

2.博客（CSDN、博客园、简书等），由于参考较多，也过于细碎，无法一一列举

3.千千秀字网站的一些资料(www.qqxiuzi.cn)

> 2019-03-15
