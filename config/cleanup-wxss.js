/**
 * 编译后处理脚本
 * 移除 app-origin.wxss 中的 webpack 编译注释
 */
const fs = require('fs')
const path = require('path')

const filePath = path.resolve(__dirname, 'dist/app-origin.wxss')

if (fs.existsSync(filePath)) {
  let content = fs.readFileSync(filePath, 'utf-8')
  
  // 移除 css-loader 生成的特殊注释
  content = content.replace(
    /\/\*![\s\S]*?css[\s\S]*?\*\//,
    ''
  )
  
  fs.writeFileSync(filePath, content)
  console.log('✅ 已清理 app-origin.wxss 中的编译注释')
}
