# 微信云开发配置指南

## 1. 开通云开发

1. 登录[微信公众平台](https://mp.weixin.qq.com/)
2. 进入你的小程序后台
3. 点击左侧菜单「云开发」
4. 点击「开通」按钮
5. 创建环境（建议命名：photo-portfolio）
6. 记录环境ID（格式类似：photo-portfolio-xxx）

## 2. 配置项目

打开 `src/app.tsx`，将 `your-cloud-env-id` 替换为你的云开发环境ID：

```typescript
Taro.cloud.init({
  env: 'photo-portfolio-xxx' // 替换为你的环境ID
})
```

## 3. 创建数据库集合

在云开发控制台的数据库中，创建以下集合：

### 3.1 photos（作品集合）

```json
{
  "_id": "系统自动生成",
  "url": "图片URL",
  "thumbUrl": "缩略图URL",
  "title": "作品标题",
  "description": "作品描述",
  "style": "风格名称",
  "styleId": "风格ID",
  "order": 1,
  "width": 800,
  "height": 1200,
  "createdAt": "创建时间"
}
```

**索引建议：**
- styleId（用于按风格筛选）
- order（用于排序）
- createdAt（用于按时间排序）

### 3.2 styles（风格分类集合）

```json
{
  "_id": "系统自动生成",
  "name": "风格名称",
  "icon": "图标emoji",
  "coverUrl": "封面图片URL",
  "order": 1,
  "count": 10,
  "createdAt": "创建时间"
}
```

### 3.3 intents（意向集合）

```json
{
  "_id": "系统自动生成",
  "userId": "用户openid",
  "photos": [
    {
      "photoId": "图片ID",
      "photoUrl": "图片URL",
      "styleName": "风格名称",
      "addedAt": "添加时间"
    }
  ],
  "styles": ["风格1", "风格2"],
  "contactStatus": "pending/contacted",
  "note": "备注",
  "createdAt": "创建时间",
  "updatedAt": "更新时间"
}
```

**索引建议：**
- userId（用于查询用户的意向）
- contactStatus（用于筛选待联系意向）
- createdAt（用于按时间排序）

### 3.4 photographer（摄影师信息集合）

```json
{
  "_id": "系统自动生成",
  "name": "摄影师名称",
  "avatar": "头像URL",
  "motto": "座右铭",
  "wechatId": "微信号",
  "qrCodeUrl": "微信二维码图片URL",
  "createdAt": "创建时间"
}
```

## 4. 创建云函数

在云开发控制台的「云函数」中，创建以下函数：

### 4.1 submitIntent（提交意向）

```javascript
// cloud/functions/submitIntent/index.js
const cloud = require('wx-server-sdk')
cloud.init()
const db = cloud.database()

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { photos, styles } = event
  
  try {
    // 检查是否已有意向
    const existing = await db.collection('intents')
      .where({ userId: wxContext.OPENID })
      .get()
    
    if (existing.data.length > 0) {
      // 更新现有意向
      await db.collection('intents').doc(existing.data[0]._id).update({
        data: {
          photos,
          styles,
          updatedAt: db.serverDate()
        }
      })
    } else {
      // 创建新意向
      await db.collection('intents').add({
        data: {
          userId: wxContext.OPENID,
          photos,
          styles,
          contactStatus: 'pending',
          createdAt: db.serverDate(),
          updatedAt: db.serverDate()
        }
      })
    }
    
    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
}
```

### 4.2 getIntents（获取意向列表 - 管理端用）

```javascript
// cloud/functions/getIntents/index.js
const cloud = require('wx-server-sdk')
cloud.init()
const db = cloud.database()

exports.main = async (event, context) => {
  const { page = 1, pageSize = 20, status } = event
  
  try {
    let query = db.collection('intents')
    
    if (status) {
      query = query.where({ contactStatus: status })
    }
    
    const countResult = await query.count()
    const total = countResult.total
    
    const intents = await query
      .orderBy('createdAt', 'desc')
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .get()
    
    return {
      success: true,
      data: intents.data,
      total,
      hasMore: page * pageSize < total
    }
  } catch (error) {
    return { success: false, error: error.message }
  }
}
```

### 4.3 updateIntentStatus（更新意向状态）

```javascript
// cloud/functions/updateIntentStatus/index.js
const cloud = require('wx-server-sdk')
cloud.init()
const db = cloud.database()

exports.main = async (event, context) => {
  const { intentId, status } = event
  
  try {
    await db.collection('intents').doc(intentId).update({
      data: {
        contactStatus: status,
        updatedAt: db.serverDate()
      }
    })
    
    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
}
```

### 4.4 uploadPhoto（上传作品）

```javascript
// cloud/functions/uploadPhoto/index.js
const cloud = require('wx-server-sdk')
cloud.init()
const db = cloud.database()

exports.main = async (event, context) => {
  const { photos, style, styleId } = event
  
  try {
    const uploadPromises = photos.map(async (photo) => {
      // 上传图片到云存储
      const cloudPath = `photos/${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`
      const uploadResult = await cloud.uploadFile({
        cloudPath,
        fileContent: Buffer.from(photo.base64, 'base64')
      })
      
      // 写入数据库
      return db.collection('photos').add({
        data: {
          url: uploadResult.fileID,
          thumbUrl: uploadResult.fileID, // 可以生成缩略图
          style,
          styleId,
          order: Date.now(),
          createdAt: db.serverDate()
        }
      })
    })
    
    await Promise.all(uploadPromises)
    
    // 更新风格计数
    await db.collection('styles').where({ name: style }).update({
      data: {
        count: db.command.inc(photos.length)
      }
    })
    
    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
}
```

## 5. 部署云函数

1. 在微信开发者工具中，右键点击 `cloud/functions/submitIntent` 文件夹
2. 选择「创建并部署：云端安装依赖」
3. 对每个云函数重复上述步骤

## 6. 初始化数据

在「数据库」中手动添加一些初始风格数据：

```json
[
  { "name": "复古", "icon": "🎞️", "order": 1, "count": 0 },
  { "name": "私房", "icon": "💫", "order": 2, "count": 0 },
  { "name": "情绪", "icon": "🎭", "order": 3, "count": 0 },
  { "name": "街头", "icon": "🚶", "order": 4, "count": 0 },
  { "name": "胶片", "icon": "🎬", "order": 5, "count": 0 },
  { "name": "自然", "icon": "🌿", "order": 6, "count": 0 },
  { "name": "时尚", "icon": "👗", "order": 7, "count": 0 }
]
```

## 7. 配置权限

在数据库集合的「权限设置」中，设置为：

- **photos**：所有用户可读，仅创建者可写
- **styles**：所有用户可读，仅创建者可写  
- **intents**：仅创建者可读写（摄影师需要特殊权限查看）
- **photographer**：所有用户可读，仅创建者可写

## 8. 安全建议

1. 在云函数中验证用户身份（wxContext.OPENID）
2. 限制单次上传图片数量（建议不超过9张）
3. 对图片进行压缩处理，控制文件大小
4. 定期清理未使用的云存储文件

## 9. 费用预估

云开发免费额度：
- 数据库读写：50万次/月
- 云函数调用：50万次/月
- 云存储：5GB/月
- CDN流量：5GB/月

对于个人摄影作品集，免费额度通常足够使用。