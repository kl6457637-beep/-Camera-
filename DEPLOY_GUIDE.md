# 📸 摄影师作品集小程序 - 部署指南

## 🎯 部署概览

本指南将帮助你从零开始部署摄影师作品集小程序，包括微信云开发配置、代码构建和发布上线。

**预计时间**: 30-60分钟  
**难度**: ⭐⭐⭐ 中等

---

## 📋 前置条件

在开始之前，请确保你已完成以下准备：

- [ ] 注册微信小程序账号（个人或企业）
- [ ] 完成微信认证（个人小程序可免费认证）
- [ ] 安装微信开发者工具
- [ ] 具备基本的命令行操作能力

---

## 🚀 第一步：开通微信云开发

### 1.1 登录微信公众平台

1. 访问 [微信公众平台](https://mp.weixin.qq.com/)
2. 使用小程序账号扫码登录
3. 进入「开发」→「开发管理」→「开发设置」

### 1.2 开通云开发

1. 点击左侧菜单「云开发」
2. 点击「开通」按钮
3. 选择「按量付费」或「包年包月」（建议按量付费，有免费额度）
4. 记录你的**环境ID**（格式：`photo-portfolio-xxx`）

### 1.3 获取环境ID

```
环境ID示例：photo-portfolio-5g5k2k8k
```

---

## 💻 第二步：配置项目

### 2.1 修改云开发环境ID

打开项目文件 `src/app.tsx`，找到以下代码：

```typescript
Taro.cloud.init({
  env: 'your-cloud-env-id' // ← 替换为你的环境ID
})
```

替换为：

```typescript
Taro.cloud.init({
  env: 'photo-portfolio-xxx' // 你的实际环境ID
})
```

### 2.2 修改小程序信息（可选）

打开 `src/app.config.ts`，可以修改：

```typescript
{
  "window": {
    "navigationBarTitleText": "你的摄影师名称" // 修改标题
  }
}
```

---

## 🗄️ 第三步：创建数据库

### 3.1 进入云开发控制台

1. 在微信公众平台，点击「云开发」
2. 点击「数据库」选项卡
3. 点击「添加集合」

### 3.2 创建4个数据集合

依次创建以下集合（点击「添加集合」→ 输入名称 → 确定）：

#### 集合 1: `photos`（作品）
```json
{
  "_id": "系统自动生成",
  "title": "作品标题",
  "description": "作品描述",
  "imageUrl": "图片URL",
  "style": "风格标签",
  "styleId": "风格ID",
  "photographerId": "摄影师ID",
  "createTime": "创建时间",
  "order": 0
}
```

#### 集合 2: `styles`（风格分类）
```json
{
  "_id": "系统自动生成",
  "name": "风格名称",
  "icon": "图标emoji",
  "coverImage": "封面图片",
  "order": 0,
  "isActive": true
}
```

#### 集合 3: `intents`（用户意向）
```json
{
  "_id": "系统自动生成",
  "userId": "用户ID（openid）",
  "photoIds": ["收藏的photoId数组"],
  "styleIds": ["偏好的风格ID数组"],
  "status": "pending/contacted/completed",
  "createTime": "创建时间",
  "contactTime": "联系时间",
  "notes": "备注"
}
```

#### 集合 4: `photographer`（摄影师信息）
```json
{
  "_id": "系统自动生成",
  "name": "摄影师名称",
  "avatar": "头像URL",
  "motto": "座右铭",
  "wechatId": "微信号",
  "qrCode": "微信二维码图片",
  "about": "关于我"
}
```

### 3.3 设置数据库权限

对每个集合，点击「权限设置」→ 选择「所有用户可读，仅创建者可写」

---

## ⚡ 第四步：部署云函数

### 4.1 创建云函数目录

在项目根目录下创建 `cloud/functions/` 文件夹：

```bash
mkdir -p cloud/functions
```

### 4.2 创建4个云函数

在 `cloud/functions/` 下创建以下文件夹和文件：

#### 云函数 1: `submitIntent`

**文件路径**: `cloud/functions/submitIntent/index.js`

```javascript
// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

// 云函数入口函数
exports.main = async (event, context) => {
  const { photoIds, styleIds } = event
  const wxContext = cloud.getWXContext()
  
  try {
    const db = cloud.database()
    
    // 检查是否已存在意向
    const existIntent = await db.collection('intents')
      .where({
        userId: wxContext.OPENID,
        status: 'pending'
      })
      .get()
    
    if (existIntent.data.length > 0) {
      // 更新已有意向
      await db.collection('intents').doc(existIntent.data[0]._id).update({
        data: {
          photoIds: photoIds,
          styleIds: styleIds,
          updateTime: db.serverDate()
        }
      })
      return {
        success: true,
        message: '意向更新成功',
        intentId: existIntent.data[0]._id
      }
    }
    
    // 创建新意向
    const result = await db.collection('intents').add({
      data: {
        userId: wxContext.OPENID,
        photoIds: photoIds,
        styleIds: styleIds,
        status: 'pending',
        createTime: db.serverDate(),
        contactTime: null,
        notes: ''
      }
    })
    
    return {
      success: true,
      message: '意向提交成功',
      intentId: result._id
    }
  } catch (error) {
    return {
      success: false,
      message: error.message
    }
  }
}
```

**文件路径**: `cloud/functions/submitIntent/package.json`

```json
{
  "name": "submitIntent",
  "version": "1.0.0",
  "description": "提交用户意向",
  "main": "index.js",
  "dependencies": {
    "wx-server-sdk": "~3.0.0"
  }
}
```

#### 云函数 2: `getIntents`

**文件路径**: `cloud/functions/getIntents/index.js`

```javascript
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

exports.main = async (event, context) => {
  const { status, page = 1, pageSize = 20 } = event
  
  try {
    const db = cloud.database()
    const _ = db.command
    
    let whereCondition = {}
    if (status) {
      whereCondition.status = status
    }
    
    const result = await db.collection('intents')
      .where(whereCondition)
      .orderBy('createTime', 'desc')
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .get()
    
    // 获取关联的作品信息
    const photoIds = [...new Set(result.data.flatMap(item => item.photoIds))]
    const photos = await db.collection('photos')
      .where({
        _id: _.in(photoIds)
      })
      .get()
    
    const photoMap = {}
    photos.data.forEach(photo => {
      photoMap[photo._id] = photo
    })
    
    // 组装数据
    const intents = result.data.map(intent => ({
      ...intent,
      photoDetails: intent.photoIds.map(id => photoMap[id]).filter(Boolean)
    }))
    
    return {
      success: true,
      data: intents,
      total: result.data.length
    }
  } catch (error) {
    return {
      success: false,
      message: error.message
    }
  }
}
```

**文件路径**: `cloud/functions/getIntents/package.json`

```json
{
  "name": "getIntents",
  "version": "1.0.0",
  "description": "获取意向列表",
  "main": "index.js",
  "dependencies": {
    "wx-server-sdk": "~3.0.0"
  }
}
```

#### 云函数 3: `updateIntentStatus`

**文件路径**: `cloud/functions/updateIntentStatus/index.js`

```javascript
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

exports.main = async (event, context) => {
  const { intentId, status, notes } = event
  
  try {
    const db = cloud.database()
    
    const updateData = {
      status: status
    }
    
    if (status === 'contacted') {
      updateData.contactTime = db.serverDate()
    }
    
    if (notes) {
      updateData.notes = notes
    }
    
    await db.collection('intents').doc(intentId).update({
      data: updateData
    })
    
    return {
      success: true,
      message: '状态更新成功'
    }
  } catch (error) {
    return {
      success: false,
      message: error.message
    }
  }
}
```

**文件路径**: `cloud/functions/updateIntentStatus/package.json`

```json
{
  "name": "updateIntentStatus",
  "version": "1.0.0",
  "description": "更新意向状态",
  "main": "index.js",
  "dependencies": {
    "wx-server-sdk": "~3.0.0"
  }
}
```

#### 云函数 4: `uploadPhoto`

**文件路径**: `cloud/functions/uploadPhoto/index.js`

```javascript
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

exports.main = async (event, context) => {
  const { title, description, style, styleId, imageUrl, order } = event
  
  try {
    const db = cloud.database()
    
    const result = await db.collection('photos').add({
      data: {
        title: title,
        description: description,
        style: style,
        styleId: styleId,
        imageUrl: imageUrl,
        order: order || 0,
        photographerId: 'default',
        createTime: db.serverDate()
      }
    })
    
    return {
      success: true,
      message: '作品上传成功',
      photoId: result._id
    }
  } catch (error) {
    return {
      success: false,
      message: error.message
    }
  }
}
```

**文件路径**: `cloud/functions/uploadPhoto/package.json`

```json
{
  "name": "uploadPhoto",
  "version": "1.0.0",
  "description": "上传作品",
  "main": "index.js",
  "dependencies": {
    "wx-server-sdk": "~3.0.0"
  }
}
```

### 4.3 部署云函数

1. 打开「微信开发者工具」
2. 导入项目（选择 `photo-portfolio` 目录）
3. 在「云开发」→「云函数」中右键点击每个函数
4. 选择「创建并部署：云端安装依赖」

---

## 🔨 第五步：构建并预览

### 5.1 安装依赖

在项目根目录运行：

```bash
npm install --legacy-peer-deps
```

### 5.2 开发模式运行

```bash
npm run dev:weapp
```

### 5.3 在微信开发者工具中预览

1. 打开微信开发者工具
2. 选择「导入项目」
3. 选择项目目录 `photo-portfolio`
4. 填写你的小程序 AppID
5. 点击「导入」
6. 在模拟器中预览效果

---

## 📝 第六步：添加初始数据

### 6.1 添加摄影师信息

在云开发控制台 → 数据库 → `photographer` 集合中，添加一条记录：

```json
{
  "name": "你的摄影师名称",
  "avatar": "头像图片URL",
  "motto": "用镜头记录每一个动人瞬间",
  "wechatId": "your_wechat_id",
  "qrCode": "微信二维码图片URL",
  "about": "关于你的介绍..."
}
```

### 6.2 添加风格分类

在 `styles` 集合中添加几条记录：

```json
{
  "name": "复古",
  "icon": "📷",
  "coverImage": "封面图片URL",
  "order": 1,
  "isActive": true
}
```

### 6.3 添加作品

在 `photos` 集合中添加作品记录：

```json
{
  "title": "作品标题",
  "description": "作品描述",
  "imageUrl": "图片URL",
  "style": "复古",
  "styleId": "风格ID",
  "photographerId": "default",
  "order": 1
}
```

---

## 🚀 第七步：提交审核

### 7.1 上传代码

在微信开发者工具中：
1. 点击右上角「上传」按钮
2. 填写版本号（如：1.0.0）
3. 填写项目备注
4. 点击「上传」

### 7.2 提交审核

1. 登录微信公众平台
2. 进入「管理」→「版本管理」
3. 找到「开发版本」
4. 点击「提交审核」
5. 填写审核信息：
   - 功能页面：pages/index/index
   - 标题：摄影师作品集
   - 标签：摄影、作品集、约拍
   - 服务类目：工具-图片/音频/视频

### 7.3 等待审核

审核通常需要 1-3 个工作日，通过后小程序即可上线。

---

## 🎉 恭喜！部署完成

你的摄影师作品集小程序已经部署完成！

### 📱 使用方式

1. **模特端**：扫码进入小程序 → 浏览作品 → 点击心动 → 查看收藏 → 联系摄影师
2. **摄影师端**：进入管理页 → 上传作品 → 查看意向反馈

### 💡 后续优化建议

- [ ] 使用真实的摄影作品替换示例图片
- [ ] 添加更多风格分类
- [ ] 优化加载速度（图片压缩、CDN）
- [ ] 添加分享功能
- [ ] 增加用户评论功能

---

## 🆘 常见问题

### Q1: 云开发环境ID在哪里找？
A: 微信公众平台 → 云开发 → 控制台右上角显示环境ID

### Q2: 上传图片失败怎么办？
A: 检查云存储权限，确保已开启「所有用户可读」

### Q3: 如何修改摄影师信息？
A: 在云开发控制台 → 数据库 → photographer 集合中修改

### Q4: 如何查看用户意向？
A: 在小程序管理页查看，或在云开发控制台 → 数据库 → intents 集合中查看

---

如有其他问题，请随时联系开发者！
