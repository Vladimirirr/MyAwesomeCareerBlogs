// 根据docs目录生成目录列表到index.md
const fs = require('fs/promises')
const path = require('path')

const getAllDocsNames = async (targetPath) => {
  const files = await fs.readdir(targetPath, { withFileTypes: true })
  const dirs = files.filter((i) => i.isDirectory()).map((i) => i.name)
  return dirs
}

const createMarkdownContent = (list, title) => {
  const lineList = list.map(
    (name, i) => `${i + 1}. [查看：${name}](./${name}/index.md)`
  )
  const space = '\u0020'
  const gapLine = '\r\n'.repeat(2)
  const result = `#${space}${title}${gapLine}${lineList.join(gapLine)}${gapLine}`
  return result
}

const beginCreate = async () => {
  const list = await getAllDocsNames(__dirname)
  const title = '文档列表'
  const result = createMarkdownContent(list, title)
  await fs.writeFile(path.resolve(__dirname, 'index.md'), result)
  console.log('updated.')
}

beginCreate()
