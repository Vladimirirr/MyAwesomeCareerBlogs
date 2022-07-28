// 根据docs目录生成目录列表到index.md
const fs = require('fs/promises')
const path = require('path')

const getAllDocsNames = async (targetPath) => {
  const files = await fs.readdir(targetPath, { withFileTypes: true })
  const dirs = files
    .filter((i) => i.isDirectory() && !isNaN(+i.name))
    .map((i) => i.name)
    .sort((a, b) => +a - +b)
  return dirs
}

const createMarkdownContent = async (list, title) => {
  let lineList = list.map(async (name, i) => {
    const filePath = `./${name}/index.md`
    const fileContent = await fs.readFile(
      path.resolve(__dirname, filePath),
      'utf8'
    )
    const contentSplited = fileContent.split('\r\n')
    const title = contentSplited[0].substring(2)
    const date = contentSplited[contentSplited.length - 2].substring(2)
    return `${i + 1}. [查看：${title}](${filePath}) -- ${date}`
  })
  lineList = await Promise.all(lineList)
  const space = '\u0020'
  const gapLine = '\r\n'.repeat(2)
  const result = `#${space}${title}${gapLine}${lineList.join(gapLine)}${gapLine}`
  return result
}

const beginCreate = async () => {
  const list = await getAllDocsNames(__dirname)
  const title = '文档列表'
  const result = await createMarkdownContent(list, title)
  await fs.writeFile(path.resolve(__dirname, 'index.md'), result)
  console.log('updated.')
}

beginCreate()
