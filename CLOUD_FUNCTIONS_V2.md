# ☁️ 云函数 V2.0

## 概述

V2.0版本云函数针对新的数据模型和完整工作流进行了重构，新增支持自定义风格、详细的预约状态管理、摄影师备注等功能。

---

## 📁 云函数列表

| 云函数 | 功能 | 调用端 |
|--------|------|--------|
| `getPhotos` | 获取作品列表（支持筛选、分页） | 模特端 |
| `getPhotoDetail` | 获取作品详情 | 模特端 |
| `toggleFavorite` | 收藏/取消收藏 | 模特端 |
| `submitBooking` | 提交预约 | 模特端 |
| `getMyBookings` | 获取我的预约列表 | 模特端 |
| `cancelBooking` | 取消预约 | 模特端 |
| `getDashboard` | 获取工作台数据 | 摄影师端 |
| `getBookingList` | 获取预约列表（支持筛选） | 摄影师端 |
| `updateBookingStatus` | 更新预约状态 | 摄影师端 |
| `addBookingMessage` | 添加沟通消息 | 双方 |
| `createPhoto` | 创建作品 | 摄影师端 |
| `updatePhoto` | 更新作品（含自定义风格、备注） | 摄影师端 |
| `deletePhoto` | 删除作品 | 摄影师端 |
| `createStyle` | 创建自定义风格 | 摄影师端 |
| `getStatistics` | 获取统计数据 | 摄影师端 |
| `trackView` | 记录浏览（防刷） | 双方 |

---

## 📸 模特端云函数

### 1. getPhotos - 获取作品列表

**文件**: `cloud/functions/getPhotos/index.js`

```javascript
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

exports.main = async (event, context) => {
  const { 
    photographerId, 
    style, 
    tag,
    page = 1, 
    pageSize = 20,
    sortBy = 'order'  // 'order' | 'likes' | 'newest'
  } = event
  
  const db = cloud.database()
  const _ = db.command
  
  try {
    let whereCondition = {
      photographerId: photographerId,
      isPublic: true
    }
    
    // 风格筛选
    if (style && style !== 'all') {
      whereCondition.style = style
    }
    
    // 标签筛选
    if (tag) {
      whereCondition.tags = _.all([tag])
    }
    
    // 构建排序
    let orderBy = {}
    switch(sortBy) {
      case 'likes':
        orderBy = { likes: 'desc' }
        break
      case 'newest':
        orderBy = { createdAt: 'desc' }
        break
      default:
        orderBy = { order: 'asc', createdAt: 'desc' }
    }
    
    const result = await db.collection('photos')
      .where(whereCondition)
      .orderBy(Object.keys(orderBy)[0], Object.values(orderBy)[0])
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .get()
    
    // 获取总数量
    const countResult = await db.collection('photos')
      .where(whereCondition)
      .count()
    
    return {
      success: true,
      data: result.data,
      pagination: {
        page,
        pageSize,
        total: countResult.total,
        hasMore: page * pageSize < countResult.total
      }
    }
  } catch (error) {
    return {
      success: false,
      message: error.message
    }
  }
}
```

**package.json**:
```json
{
  "name": "getPhotos",
  "version": "1.0.0",
  "description": "获取作品列表",
  "main": "index.js",
  "dependencies": {
    "wx-server-sdk": "~3.0.0"
  }
}
```

---

### 2. getPhotoDetail - 获取作品详情

```javascript
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

exports.main = async (event, context) => {
  const { photoId } = event
  const wxContext = cloud.getWXContext()
  
  const db = cloud.database()
  
  try {
    // 获取作品详情
    const photoResult = await db.collection('photos').doc(photoId).get()
    
    if (!photoResult.data) {
      return { success: false, message: '作品不存在' }
    }
    
    const photo = photoResult.data
    
    // 增加浏览量
    await db.collection('photos').doc(photoId).update({
      data: {
        views: db.command.inc(1)
      }
    })
    
    // 检查是否已收藏
    const userResult = await db.collection('users').doc(wxContext.OPENID).get()
    const isFavorited = userResult.data?.favorites?.includes(photoId) || false
    
    // 获取同系列其他作品
    let relatedPhotos = []
    if (photo.collectionId) {
      const relatedResult = await db.collection('photos')
        .where({
          collectionId: photo.collectionId,
          _id: db.command.neq(photoId),
          isPublic: true
        })
        .limit(4)
        .get()
      relatedPhotos = relatedResult.data
    }
    
    return {
      success: true,
      data: {
        ...photo,
        isFavorited,
        relatedPhotos
      }
    }
  } catch (error) {
    return {
      success: false,
      message: error.message
    }
  }
}
```

---

### 3. toggleFavorite - 收藏/取消收藏

```javascript
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

exports.main = async (event, context) => {
  const { photoId, action } = event  // action: 'add' | 'remove'
  const wxContext = cloud.getWXContext()
  
  const db = cloud.database()
  
  try {
    const userId = wxContext.OPENID
    
    if (action === 'add') {
      // 添加到收藏
      await db.collection('users').doc(userId).update({
        data: {
          favorites: db.command.addToSet(photoId)
        }
      })
      
      // 增加作品收藏数
      await db.collection('photos').doc(photoId).update({
        data: {
          likes: db.command.inc(1)
        }
      })
      
      return { success: true, message: '收藏成功' }
    } else {
      // 取消收藏
      await db.collection('users').doc(userId).update({
        data: {
          favorites: db.command.pull(photoId)
        }
      })
      
      // 减少作品收藏数
      await db.collection('photos').doc(photoId).update({
        data: {
          likes: db.command.inc(-1)
        }
      })
      
      return { success: true, message: '已取消收藏' }
    }
  } catch (error) {
    return {
      success: false,
      message: error.message
    }
  }
}
```

---

### 4. submitBooking - 提交预约

```javascript
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

// 生成预约号
function generateBookingId() {
  const now = new Date()
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '')
  const random = Math.floor(1000 + Math.random() * 9000)
  return `B${dateStr}${random}`
}

exports.main = async (event, context) => {
  const {
    photographerId,
    selectedPhotos,
    preferredStyles,
    shootingType,
    preferredDates,
    userName,
    userPhone,
    userWechat,
    notes
  } = event
  
  const wxContext = cloud.getWXContext()
  const db = cloud.database()
  
  try {
    // 检查是否有进行中的预约
    const existingBooking = await db.collection('bookings')
      .where({
        userId: wxContext.OPENID,
        photographerId: photographerId,
        status: db.command.in(['pending', 'viewed', 'negotiating', 'confirmed', 'scheduled'])
      })
      .get()
    
    if (existingBooking.data.length > 0) {
      return {
        success: false,
        message: '您已有进行中的预约，请先完成或取消后再提交'
      }
    }
    
    // 创建预约
    const bookingId = generateBookingId()
    const result = await db.collection('bookings').add({
      data: {
        _id: bookingId,
        userId: wxContext.OPENID,
        userName,
        userPhone,
        userWechat: userWechat || '',
        photographerId,
        selectedPhotos,
        preferredStyles,
        shootingType,
        preferredDates,
        confirmedDate: null,
        confirmedTime: null,
        duration: 2,  // 默认2小时
        status: 'pending',
        messages: [],
        userNotes: notes,
        photographerNotes: '',
        price: null,
        deposit: null,
        isDepositPaid: false,
        createdAt: db.serverDate(),
        updatedAt: db.serverDate()
      }
    })
    
    // 更新作品的预约计数
    for (const photoId of selectedPhotos) {
      await db.collection('photos').doc(photoId).update({
        data: {
          bookings: db.command.inc(1)
        }
      })
    }
    
    // 发送通知给摄影师（可选）
    // await sendNotification(photographerId, 'new_booking', { bookingId })
    
    return {
      success: true,
      message: '预约提交成功',
      bookingId: bookingId
    }
  } catch (error) {
    return {
      success: false,
      message: error.message
    }
  }
}
```

---

### 5. getMyBookings - 获取我的预约

```javascript
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

exports.main = async (event, context) => {
  const { status, page = 1, pageSize = 10 } = event
  const wxContext = cloud.getWXContext()
  
  const db = cloud.database()
  const _ = db.command
  
  try {
    let whereCondition = {
      userId: wxContext.OPENID
    }
    
    // 状态筛选
    if (status && status !== 'all') {
      whereCondition.status = status
    }
    
    const result = await db.collection('bookings')
      .where(whereCondition)
      .orderBy('createdAt', 'desc')
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .get()
    
    // 获取关联的照片信息
    const bookingList = await Promise.all(
      result.data.map(async (booking) => {
        const photos = await db.collection('photos')
          .where({
            _id: _.in(booking.selectedPhotos)
          })
          .limit(3)
          .get()
        
        // 获取摄影师信息
        const photographer = await db.collection('users')
          .doc(booking.photographerId)
          .get()
        
        return {
          ...booking,
          photoList: photos.data,
          photographerName: photographer.data?.photographerProfile?.name || '摄影师'
        }
      })
    )
    
    return {
      success: true,
      data: bookingList
    }
  } catch (error) {
    return {
      success: false,
      message: error.message
    }
  }
}
```

---

### 6. cancelBooking - 取消预约

```javascript
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

exports.main = async (event, context) => {
  const { bookingId, reason } = event
  const wxContext = cloud.getWXContext()
  
  const db = cloud.database()
  
  try {
    // 检查预约归属
    const booking = await db.collection('bookings').doc(bookingId).get()
    
    if (!booking.data) {
      return { success: false, message: '预约不存在' }
    }
    
    if (booking.data.userId !== wxContext.OPENID) {
      return { success: false, message: '无权操作此预约' }
    }
    
    // 检查状态
    if (!['pending', 'viewed', 'negotiating', 'confirmed'].includes(booking.data.status)) {
      return { success: false, message: '当前状态无法取消' }
    }
    
    // 更新状态
    await db.collection('bookings').doc(bookingId).update({
      data: {
        status: 'cancelled',
        userNotes: db.command.set(
          booking.data.userNotes + '\n[取消原因]: ' + reason
        ),
        cancelledAt: db.serverDate(),
        updatedAt: db.serverDate()
      }
    })
    
    return { success: true, message: '预约已取消' }
  } catch (error) {
    return {
      success: false,
      message: error.message
    }
  }
}
```

---

## 📷 摄影师端云函数

### 7. getDashboard - 获取工作台数据

```javascript
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const db = cloud.database()
  const _ = db.command
  
  try {
    const photographerId = wxContext.OPENID
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    // 今日统计
    const todayStats = await db.collection('statistics')
      .where({
        photographerId,
        date: today.toISOString().slice(0, 10).replace(/-/g, '')
      })
      .get()
    
    // 待处理预约数
    const pendingCount = await db.collection('bookings')
      .where({
        photographerId,
        status: _.in(['pending', 'viewed', 'negotiating'])
      })
      .count()
    
    // 本周待拍摄
    const weekEnd = new Date(today)
    weekEnd.setDate(weekEnd.getDate() + 7)
    
    const upcomingCount = await db.collection('bookings')
      .where({
        photographerId,
        status: 'confirmed',
        confirmedDate: _.gte(today.toISOString().slice(0, 10))
      })
      .count()
    
    // 最新的待处理预约
    const recentBookings = await db.collection('bookings')
      .where({
        photographerId,
        status: 'pending'
      })
      .orderBy('createdAt', 'desc')
      .limit(3)
      .get()
    
    // 获取预约的照片信息
    const bookingsWithPhotos = await Promise.all(
      recentBookings.data.map(async (booking) => {
        const photos = await db.collection('photos')
          .where({
            _id: _.in(booking.selectedPhotos.slice(0, 3))
          })
          .get()
        
        return {
          ...booking,
          photoList: photos.data
        }
      })
    )
    
    return {
      success: true,
      data: {
        todayStats: todayStats.data[0] || {
          pageViews: 0,
          likes: 0,
          bookingInquiries: 0
        },
        pendingCount: pendingCount.total,
        upcomingCount: upcomingCount.total,
        recentBookings: bookingsWithPhotos
      }
    }
  } catch (error) {
    return {
      success: false,
      message: error.message
    }
  }
}
```

---

### 8. getBookingList - 获取预约列表（支持筛选）

```javascript
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

exports.main = async (event, context) => {
  const { 
    status = 'all', 
    page = 1, 
    pageSize = 20,
    sortBy = 'newest'  // 'newest' | 'date'
  } = event
  
  const wxContext = cloud.getWXContext()
  const db = cloud.database()
  const _ = db.command
  
  try {
    let whereCondition = {
      photographerId: wxContext.OPENID
    }
    
    // 状态筛选
    if (status !== 'all') {
      whereCondition.status = status
    }
    
    // 排序
    let orderField = 'createdAt'
    let orderDirection = 'desc'
    
    if (sortBy === 'date' && status === 'confirmed') {
      orderField = 'confirmedDate'
      orderDirection = 'asc'
    }
    
    const result = await db.collection('bookings')
      .where(whereCondition)
      .orderBy(orderField, orderDirection)
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .get()
    
    // 获取关联照片
    const bookingsWithPhotos = await Promise.all(
      result.data.map(async (booking) => {
        const photos = await db.collection('photos')
          .where({
            _id: _.in(booking.selectedPhotos)
          })
          .get()
        
        return {
          ...booking,
          photoList: photos.data
        }
      })
    )
    
    return {
      success: true,
      data: bookingsWithPhotos
    }
  } catch (error) {
    return {
      success: false,
      message: error.message
    }
  }
}
```

---

### 9. updateBookingStatus - 更新预约状态

```javascript
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

exports.main = async (event, context) => {
  const { 
    bookingId, 
    status, 
    confirmedDate,
    confirmedTime,
    price,
    photographerNotes,
    message
  } = event
  
  const wxContext = cloud.getWXContext()
  const db = cloud.database()
  
  try {
    // 验证权限
    const booking = await db.collection('bookings').doc(bookingId).get()
    
    if (!booking.data) {
      return { success: false, message: '预约不存在' }
    }
    
    if (booking.data.photographerId !== wxContext.OPENID) {
      return { success: false, message: '无权操作' }
    }
    
    // 构建更新数据
    const updateData = {
      status,
      updatedAt: db.serverDate()
    }
    
    // 根据状态添加特定字段
    if (status === 'confirmed') {
      updateData.confirmedAt = db.serverDate()
      if (confirmedDate) updateData.confirmedDate = confirmedDate
      if (confirmedTime) updateData.confirmedTime = confirmedTime
      if (price) updateData.price = price
    }
    
    if (status === 'completed') {
      updateData.completedAt = db.serverDate()
    }
    
    if (photographerNotes) {
      updateData.photographerNotes = photographerNotes
    }
    
    // 如果有消息，添加到沟通记录
    if (message) {
      updateData.messages = db.command.push({
        from: 'photographer',
        content: message,
        timestamp: db.serverDate()
      })
    }
    
    await db.collection('bookings').doc(bookingId).update({
      data: updateData
    })
    
    // 发送通知给客户（可选）
    // await notifyUser(booking.data.userId, 'booking_status_changed', { bookingId, status })
    
    return { 
      success: true, 
      message: '状态更新成功',
      newStatus: status
    }
  } catch (error) {
    return {
      success: false,
      message: error.message
    }
  }
}
```

---

### 10. createPhoto - 创建作品

```javascript
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

exports.main = async (event, context) => {
  const {
    title,
    description,
    imageUrl,
    thumbnailUrl,
    style,
    tags,
    collectionId,
    photographerNote,
    shootingNote,
    postProcessing,
    cameraSettings,
    location,
    order
  } = event
  
  const wxContext = cloud.getWXContext()
  const db = cloud.database()
  
  try {
    const result = await db.collection('photos').add({
      data: {
        title,
        description,
        imageUrl,
        thumbnailUrl: thumbnailUrl || imageUrl,
        style,
        tags: tags || [],
        collectionId: collectionId || null,
        photographerNote: photographerNote || '',
        shootingNote: shootingNote || '',
        postProcessing: postProcessing || '',
        cameraSettings: cameraSettings || {},
        location: location || null,
        photographerId: wxContext.OPENID,
        isPublic: true,
        order: order || 0,
        views: 0,
        likes: 0,
        bookings: 0,
        createdAt: db.serverDate(),
        updatedAt: db.serverDate()
      }
    })
    
    // 如果使用了新风格，记录到styles集合
    if (style) {
      const existingStyle = await db.collection('styles')
        .where({
          name: style,
          photographerId: wxContext.OPENID
        })
        .get()
      
      if (existingStyle.data.length === 0) {
        // 检查是否是系统预设
        const systemStyle = await db.collection('styles')
          .where({
            name: style,
            isSystem: true
          })
          .get()
        
        if (systemStyle.data.length === 0) {
          // 创建自定义风格
          await db.collection('styles').add({
            data: {
              name: style,
              icon: '🎨',
              description: '',
              category: '自定义',
              photographerId: wxContext.OPENID,
              isSystem: false,
              isActive: true,
              order: 0,
              photoCount: 1,
              bookingCount: 0,
              createdAt: db.serverDate(),
              updatedAt: db.serverDate()
            }
          })
        }
      } else {
        // 更新风格的照片计数
        await db.collection('styles').doc(existingStyle.data[0]._id).update({
          data: {
            photoCount: db.command.inc(1),
            updatedAt: db.serverDate()
          }
        })
      }
    }
    
    return {
      success: true,
      message: '作品创建成功',
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

---

### 11. updatePhoto - 更新作品

```javascript
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

exports.main = async (event, context) => {
  const {
    photoId,
    title,
    description,
    style,
    tags,
    photographerNote,
    shootingNote,
    postProcessing,
    cameraSettings,
    isPublic,
    order
  } = event
  
  const wxContext = cloud.getWXContext()
  const db = cloud.database()
  
  try {
    // 验证权限
    const photo = await db.collection('photos').doc(photoId).get()
    
    if (!photo.data) {
      return { success: false, message: '作品不存在' }
    }
    
    if (photo.data.photographerId !== wxContext.OPENID) {
      return { success: false, message: '无权操作' }
    }
    
    // 构建更新数据
    const updateData = {
      updatedAt: db.serverDate()
    }
    
    if (title !== undefined) updateData.title = title
    if (description !== undefined) updateData.description = description
    if (style !== undefined) updateData.style = style
    if (tags !== undefined) updateData.tags = tags
    if (photographerNote !== undefined) updateData.photographerNote = photographerNote
    if (shootingNote !== undefined) updateData.shootingNote = shootingNote
    if (postProcessing !== undefined) updateData.postProcessing = postProcessing
    if (cameraSettings !== undefined) updateData.cameraSettings = cameraSettings
    if (isPublic !== undefined) updateData.isPublic = isPublic
    if (order !== undefined) updateData.order = order
    
    await db.collection('photos').doc(photoId).update({
      data: updateData
    })
    
    return {
      success: true,
      message: '作品更新成功'
    }
  } catch (error) {
    return {
      success: false,
      message: error.message
    }
  }
}
```

---

### 12. deletePhoto - 删除作品

```javascript
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

exports.main = async (event, context) => {
  const { photoId } = event
  const wxContext = cloud.getWXContext()
  const db = cloud.database()
  
  try {
    // 验证权限
    const photo = await db.collection('photos').doc(photoId).get()
    
    if (!photo.data) {
      return { success: false, message: '作品不存在' }
    }
    
    if (photo.data.photographerId !== wxContext.OPENID) {
      return { success: false, message: '无权操作' }
    }
    
    // 删除云存储文件
    if (photo.data.imageUrl && photo.data.imageUrl.includes('cloud://')) {
      const fileID = photo.data.imageUrl
      await cloud.deleteFile({
        fileList: [fileID]
      })
    }
    
    // 删除数据库记录
    await db.collection('photos').doc(photoId).remove()
    
    return {
      success: true,
      message: '作品已删除'
    }
  } catch (error) {
    return {
      success: false,
      message: error.message
    }
  }
}
```

---

### 13. createStyle - 创建自定义风格

```javascript
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

exports.main = async (event, context) => {
  const { name, icon, description, category } = event
  const wxContext = cloud.getWXContext()
  const db = cloud.database()
  
  try {
    // 检查是否已存在
    const existing = await db.collection('styles')
      .where({
        name,
        photographerId: wxContext.OPENID
      })
      .get()
    
    if (existing.data.length > 0) {
      return {
        success: false,
        message: '该风格已存在'
      }
    }
    
    const result = await db.collection('styles').add({
      data: {
        name,
        icon: icon || '🎨',
        description: description || '',
        category: category || '自定义',
        photographerId: wxContext.OPENID,
        isSystem: false,
        isActive: true,
        order: 0,
        photoCount: 0,
        bookingCount: 0,
        createdAt: db.serverDate(),
        updatedAt: db.serverDate()
      }
    })
    
    return {
      success: true,
      message: '风格创建成功',
      styleId: result._id
    }
  } catch (error) {
    return {
      success: false,
      message: error.message
    }
  }
}
```

---

## 🔧 工具云函数

### 14. trackView - 记录浏览

```javascript
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

exports.main = async (event, context) => {
  const { type, targetId } = event  // type: 'photo' | 'page'
  const wxContext = cloud.getWXContext()
  
  const db = cloud.database()
  
  try {
    // 简单的防刷：同一用户1分钟内不重复计数
    const cacheKey = `view_${type}_${targetId}_${wxContext.OPENID}`
    
    if (type === 'photo') {
      await db.collection('photos').doc(targetId).update({
        data: {
          views: db.command.inc(1)
        }
      })
    }
    
    // 更新统计表
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '')
    
    // 这里简化处理，实际应该查询并更新或创建统计记录
    
    return { success: true }
  } catch (error) {
    return {
      success: false,
      message: error.message
    }
  }
}
```

---

## 📋 部署步骤

### 1. 创建云函数目录结构

```
cloud/
└── functions/
    ├── getPhotos/
    │   ├── index.js
    │   └── package.json
    ├── getPhotoDetail/
    │   ├── index.js
    │   └── package.json
    ├── toggleFavorite/
    │   ├── index.js
    │   └── package.json
    ├── submitBooking/
    │   ├── index.js
    │   └── package.json
    ├── getMyBookings/
    │   ├── index.js
    │   └── package.json
    ├── cancelBooking/
    │   ├── index.js
    │   └── package.json
    ├── getDashboard/
    │   ├── index.js
    │   └── package.json
    ├── getBookingList/
    │   ├── index.js
    │   └── package.json
    ├── updateBookingStatus/
    │   ├── index.js
    │   └── package.json
    ├── createPhoto/
    │   ├── index.js
    │   └── package.json
    ├── updatePhoto/
    │   ├── index.js
    │   └── package.json
    ├── deletePhoto/
    │   ├── index.js
    │   └── package.json
    └── createStyle/
        ├── index.js
        └── package.json
```

### 2. 部署命令

在微信开发者工具中：

1. 右键点击 `cloud/functions/getPhotos` → 「创建并部署：云端安装依赖」
2. 右键点击 `cloud/functions/getPhotoDetail` → 「创建并部署：云端安装依赖」
3. 右键点击 `cloud/functions/toggleFavorite` → 「创建并部署：云端安装依赖」
4. 右键点击 `cloud/functions/submitBooking` → 「创建并部署：云端安装依赖」
5. ...（依次部署所有云函数）

或者使用命令行：

```bash
# 安装依赖并部署
cd cloud/functions/getPhotos && npm install && wxcloud deploy
cd ../getPhotoDetail && npm install && wxcloud deploy
# ...
```

### 3. 配置权限

在云开发控制台 → 云函数 → 权限设置中，确保所有云函数都有正确的调用权限。

---

## 🔐 权限配置

### 云函数调用权限

| 云函数 | 调用角色 |
|--------|----------|
| getPhotos | 所有用户 |
| getPhotoDetail | 所有用户 |
| toggleFavorite | 已登录用户 |
| submitBooking | 已登录用户 |
| getMyBookings | 已登录用户 |
| cancelBooking | 已登录用户 |
| getDashboard | 摄影师 |
| getBookingList | 摄影师 |
| updateBookingStatus | 摄影师 |
| createPhoto | 摄影师 |
| updatePhoto | 摄影师 |
| deletePhoto | 摄影师 |
| createStyle | 摄影师 |

---

## 💡 最佳实践

### 1. 错误处理
所有云函数都应该有try-catch块，并返回统一格式的错误信息。

### 2. 权限验证
在每个需要权限的云函数中，都要验证调用者身份。

### 3. 数据校验
对输入参数进行校验，防止脏数据。

### 4. 性能优化
- 使用分页查询
- 限制返回字段
- 避免N+1查询

### 5. 安全性
- 不要在前端暴露敏感操作
- 关键逻辑放在云函数中
- 使用数据库权限控制
