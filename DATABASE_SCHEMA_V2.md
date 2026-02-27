# 📊 数据模型 V2.0

## 概述

V2.0版本针对完整的工作流进行了数据模型优化，支持摄影师自定义风格、添加拍摄备注，以及更细致的预约状态管理。

---

## 📸 作品 (Photos)

### 集合名称: `photos`

```typescript
interface Photo {
  _id: string;                    // 系统生成唯一ID
  
  // 基础信息
  title: string;                  // 作品标题
  description: string;            // 作品描述/文案
  imageUrl: string;               // 图片URL（云存储）
  thumbnailUrl: string;           // 缩略图URL（可选）
  
  // 风格与分类（关键更新：支持自定义）
  style: string;                  // 主要风格（如"复古"、"情绪"等，可自定义）
  tags: string[];                 // 标签数组（如["日系", "胶片", "室内"]）
  collectionId: string;           // 所属系列ID（可选）
  
  // 摄影师备注（新增）
  photographerNote: string;       // 摄影师想法、拍摄心得
  shootingNote: string;           // 拍摄备注（场景、光线等）
  postProcessing: string;         // 后期处理说明
  
  // 拍摄参数（可选，专业展示）
  cameraSettings: {
    camera?: string;              // 相机型号
    lens?: string;                // 镜头
    aperture?: string;            // 光圈
    shutter?: string;             // 快门
    iso?: string;                 // ISO
    film?: string;                // 胶片型号（胶片摄影）
  };
  
  // 位置信息（可选）
  location: {
    name: string;                 // 地点名称
    address?: string;             // 详细地址
    latitude?: number;            // 纬度
    longitude?: number;           // 经度
  };
  
  // 管理与展示
  photographerId: string;         // 摄影师ID
  isPublic: boolean;              // 是否公开
  order: number;                  // 排序权重
  
  // 统计数据
  views: number;                  // 浏览次数
  likes: number;                  // 收藏次数
  bookings: number;               // 被预约次数（统计用）
  
  // 时间戳
  createdAt: Date;                // 创建时间
  updatedAt: Date;                // 更新时间
  shotAt: Date;                   // 拍摄时间（可选）
}
```

### 索引建议
```javascript
// 按风格查询
db.collection('photos').createIndex({ style: 1 })

// 按摄影师查询
db.collection('photos').createIndex({ photographerId: 1 })

// 按公开状态查询
db.collection('photos').createIndex({ isPublic: 1, order: -1 })

// 全文搜索（标签、标题）
db.collection('photos').createIndex({ 
  title: 'text', 
  description: 'text',
  tags: 'text'
})
```

### 示例数据
```json
{
  "_id": "photo_001",
  "title": "秋日午后",
  "description": "在秋天的下午，捕获一束逃跑的光。",
  "imageUrl": "cloud://xxx.jpg",
  "thumbnailUrl": "cloud://xxx_thumb.jpg",
  "style": "复古胶片",
  "tags": ["复古", "胶片", "自然光", "人像"],
  "photographerNote": "这组作品使用柯达Portra 400拍摄，利用下午3点的侧逆光，营造温暖的氛围。模特的表情非常自然，是一次愉快的创作。",
  "shootingNote": "拍摄地点：法租界某小巷，光线从左侧45度角射入",
  "postProcessing": "轻度调色，保持胶片原色，微微增加暖色调",
  "cameraSettings": {
    "camera": "Canon EOS R5",
    "lens": "RF 85mm f/1.2L",
    "aperture": "f/1.4",
    "shutter": "1/500s",
    "iso": "100"
  },
  "location": {
    "name": "上海法租界",
    "address": "徐汇区武康路"
  },
  "photographerId": "photographer_001",
  "isPublic": true,
  "order": 1,
  "views": 1248,
  "likes": 86,
  "bookings": 12,
  "createdAt": "ISODate('2024-02-01T10:00:00Z')",
  "updatedAt": "ISODate('2024-02-09T08:30:00Z')",
  "shotAt": "ISODate('2024-01-15T14:00:00Z')"
}
```

---

## 📅 预约 (Bookings)

### 集合名称: `bookings`

```typescript
interface Booking {
  _id: string;                    // 系统生成唯一ID（格式：BYYYYMMDDXXXX）
  
  // 客户信息
  userId: string;                 // 用户ID（openid）
  userName: string;               // 客户姓名
  userPhone: string;              // 联系电话
  userWechat: string;             // 微信号（可选）
  
  // 预约内容
  selectedPhotos: string[];       // 选中的作品ID数组
  preferredStyles: string[];      // 偏好的风格标签
  shootingType: string;           // 拍摄类型（个人写真/情侣照/毕业照等）
  
  // 时间安排
  preferredDates: string[];       // 期望日期（最多3个选项）
  confirmedDate: string;          // 确认的拍摄日期
  confirmedTime: string;          // 确认的时段（上午/下午/晚上）
  duration: number;               // 预计拍摄时长（小时）
  
  // 状态流转（关键更新：更细致的状态）
  status: 'pending' |            // 待确认：摄影师未查看
          'viewed' |              // 已查看：摄影师已查看但未处理
          'negotiating' |         // 协商中：双方沟通中
          'confirmed' |           // 已确认：摄影师接受预约
          'scheduled' |           // 已排期：确定具体时间
          'shooting' |            // 拍摄中：当天拍摄
          'editing' |             // 后期中：照片修图中
          'delivering' |          // 交付中：照片发送中
          'completed' |           // 已完成：交付完成
          'cancelled' |           // 已取消：预约取消
          'refunded';             // 已退款：已退款
  
  // 沟通记录
  messages: {
    from: 'user' | 'photographer';
    content: string;
    timestamp: Date;
  }[];
  
  // 需求备注
  userNotes: string;              // 客户需求备注
  photographerNotes: string;      // 摄影师备注（内部使用）
  
  // 价格与支付（可选）
  price: number;                  // 报价
  deposit: number;                // 定金
  isDepositPaid: boolean;         // 是否已付定金
  
  // 关联信息
  photographerId: string;         // 摄影师ID
  
  // 时间戳
  createdAt: Date;                // 创建时间
  updatedAt: Date;                // 更新时间
  viewedAt: Date;                 // 查看时间
  confirmedAt: Date;              // 确认时间
  completedAt: Date;              // 完成时间
  cancelledAt: Date;              // 取消时间
}
```

### 状态流转图
```
提交预约
    ↓
┌──────────┐     ┌──────────┐
│  待确认   │────→│  已查看   │
│ Pending  │     │ Viewed   │
└────┬─────┘     └────┬─────┘
     │                │
     │         ┌──────┴──────┐
     │         │   协商中     │
     │         │Negotiating │
     │         └──────┬──────┘
     │                │
     └────────┬───────┘
              ↓
        ┌──────────┐
        │  已确认   │
        │Confirmed │
        └────┬─────┘
             ↓
        ┌──────────┐
        │  已排期   │
        │Scheduled │
        └────┬─────┘
             ↓
        ┌──────────┐
        │  拍摄中   │
        │ Shooting │
        └────┬─────┘
             ↓
        ┌──────────┐
        │  后期中   │
        │ Editing  │
        └────┬─────┘
             ↓
        ┌──────────┐
        │  交付中   │
        │Delivering│
        └────┬─────┘
             ↓
        ┌──────────┐
        │  已完成   │
        │Completed │
        └──────────┘

取消路径:
任意状态 → 已取消(Cancelled) → 已退款(Refunded)
```

### 索引建议
```javascript
// 按摄影师和状态查询
db.collection('bookings').createIndex({ photographerId: 1, status: 1 })

// 按用户查询
db.collection('bookings').createIndex({ userId: 1, createdAt: -1 })

// 按状态和时间查询
db.collection('bookings').createIndex({ status: 1, createdAt: -1 })
```

### 示例数据
```json
{
  "_id": "B20240209001",
  "userId": "openid_xxx",
  "userName": "小雨",
  "userPhone": "13888888888",
  "userWechat": "xiaoyu123",
  "selectedPhotos": ["photo_001", "photo_002"],
  "preferredStyles": ["复古", "胶片"],
  "shootingType": "个人写真",
  "preferredDates": ["2024-02-15", "2024-02-16", "2024-02-17"],
  "confirmedDate": "2024-02-15",
  "confirmedTime": "下午",
  "duration": 2,
  "status": "confirmed",
  "messages": [
    {
      "from": "user",
      "content": "希望可以拍出复古的感觉，妆容需要自己准备吗？",
      "timestamp": "ISODate('2024-02-09T10:30:00Z')"
    },
    {
      "from": "photographer",
      "content": "妆容建议复古红唇，服装我可以提供一些参考。",
      "timestamp": "ISODate('2024-02-09T11:00:00Z')"
    }
  ],
  "userNotes": "喜欢复古风格，希望自然不做作",
  "photographerNotes": "客户偏好胶片质感，已发送服装建议",
  "price": 2000,
  "deposit": 500,
  "isDepositPaid": true,
  "photographerId": "photographer_001",
  "createdAt": "ISODate('2024-02-09T08:00:00Z')",
  "updatedAt": "ISODate('2024-02-09T14:00:00Z')",
  "viewedAt": "ISODate('2024-02-09T08:30:00Z')",
  "confirmedAt": "ISODate('2024-02-09T14:00:00Z')",
  "completedAt": null,
  "cancelledAt": null
}
```

---

## 🎨 系列 (Collections)

### 集合名称: `collections`

```typescript
interface Collection {
  _id: string;                    // 系统生成唯一ID
  
  // 基本信息
  name: string;                   // 系列名称
  description: string;            // 系列描述
  coverPhoto: string;             // 封面照片ID
  
  // 关联
  photoIds: string[];             // 照片ID数组（有序）
  photographerId: string;         // 摄影师ID
  
  // 风格（继承自照片，用于筛选）
  styles: string[];               // 包含的风格
  
  // 展示
  isPublic: boolean;              // 是否公开
  order: number;                  // 排序权重
  
  // 统计
  views: number;                  // 浏览次数
  likes: number;                  // 收藏次数
  
  // 时间戳
  createdAt: Date;
  updatedAt: Date;
}
```

---

## 👤 用户 (Users)

### 集合名称: `users`

```typescript
interface User {
  _id: string;                    // openid
  
  // 基本信息
  nickName: string;               // 昵称
  avatarUrl: string;              // 头像
  gender: number;                 // 性别 0-未知 1-男 2-女
  city: string;                   // 城市
  province: string;               // 省份
  
  // 角色
  role: 'model' | 'photographer' | 'both';  // 用户角色
  
  // 模特端数据
  favorites: string[];            // 收藏的照片ID
  bookingCount: number;           // 预约次数
  
  // 摄影师端数据（如果是摄影师）
  photographerProfile?: {
    name: string;
    bio: string;
    specialties: string[];        // 擅长风格
    equipment: string[];          // 设备
    priceRange: {
      min: number;
      max: number;
    };
    contactWechat: string;
    qrCode: string;               // 微信二维码
  };
  
  // 统计数据
  lastLoginAt: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

---

## 🏷️ 风格标签 (Styles)

### 集合名称: `styles`

```typescript
interface Style {
  _id: string;                    // 系统生成或自定义
  
  // 基本信息
  name: string;                   // 风格名称（如"复古胶片"）
  icon: string;                   // 图标（emoji或URL）
  description: string;            // 描述
  
  // 分类
  category: string;               // 大类（如"胶片", "数码", "风格"）
  
  // 关联
  photographerId: string;         // 创建者ID（系统预设为空）
  
  // 展示
  isSystem: boolean;              // 是否系统预设
  isActive: boolean;              // 是否启用
  order: number;                  // 排序
  
  // 统计
  photoCount: number;             // 使用该风格的照片数
  bookingCount: number;           // 预约次数
  
  // 时间戳
  createdAt: Date;
  updatedAt: Date;
}
```

### 预设风格示例
```json
[
  { "name": "复古胶片", "icon": "🎞️", "category": "胶片" },
  { "name": "日系清新", "icon": "🌸", "category": "风格" },
  { "name": "情绪人像", "icon": "🎭", "category": "风格" },
  { "name": "时尚大片", "icon": "👠", "category": "风格" },
  { "name": "街拍纪实", "icon": "📷", "category": "风格" },
  { "name": "私房写真", "icon": "🌙", "category": "风格" },
  { "name": "黑白影像", "icon": "⚫", "category": "风格" },
  { "name": "森系自然", "icon": "🌿", "category": "风格" }
]
```

---

## 📈 统计数据 (Statistics)

### 集合名称: `statistics`

```typescript
interface DailyStats {
  _id: string;                    // 日期（YYYYMMDD）
  photographerId: string;         // 摄影师ID
  
  // 浏览数据
  pageViews: number;              // 页面浏览量
  uniqueVisitors: number;         // 独立访客
  avgSessionDuration: number;     // 平均停留时长（秒）
  
  // 互动数据
  photoViews: number;             // 照片浏览量
  likes: number;                  // 新增收藏
  shares: number;                 // 分享次数
  
  // 转化数据
  bookingInquiries: number;       // 预约咨询数
  confirmedBookings: number;      // 确认预约数
  conversionRate: number;         // 转化率
  
  // 热门内容
  topPhotos: string[];            // 热门照片ID（Top 5）
  topStyles: string[];            // 热门风格（Top 3）
  
  date: string;                   // 日期字符串
  createdAt: Date;
  updatedAt: Date;
}
```

---

## 🔐 权限配置

### 数据库权限规则

```javascript
// photos 集合
{
  "read": "true",  // 所有用户可读
  "write": "doc.photographerId == auth.openid"  // 仅创建者可写
}

// bookings 集合
{
  "read": "doc.userId == auth.openid || doc.photographerId == auth.openid",
  "write": "doc.userId == auth.openid || doc.photographerId == auth.openid"
}

// collections 集合
{
  "read": "true",
  "write": "doc.photographerId == auth.openid"
}

// users 集合
{
  "read": "doc._id == auth.openid",
  "write": "doc._id == auth.openid"
}

// styles 集合
{
  "read": "true",
  "write": "auth.openid != null"  // 登录用户可创建自定义风格
}

// statistics 集合
{
  "read": "doc.photographerId == auth.openid",
  "write": false  // 仅云函数写入
}
```

---

## 🔄 数据关系图

```
┌─────────────────────────────────────────────────────────────┐
│                         数据关系图                           │
└─────────────────────────────────────────────────────────────┘

Photographer (1) ────────────── (*) Photos
       │                              │
       │                              │
       │                         (*) Collections
       │
       └───────────── (*) Bookings (*) ────────── Users (1)
                              │
                              │
                         (*) Styles


详细关系：

1. Photographer - Photos (1:N)
   一个摄影师有多张照片

2. Photos - Collections (N:1)
   多张照片可以属于一个系列

3. Photos - Styles (N:M)
   一张照片可以有多个风格标签
   一个风格可以对应多张照片

4. Users - Bookings (1:N)
   一个用户可以有多条预约

5. Photographer - Bookings (1:N)
   一个摄影师可以有多条预约

6. Bookings - Photos (N:M)
   一条预约可以包含多张照片
   一张照片可以被多个预约引用
```

---

## 📝 版本变更记录

### V1.0 → V2.0 主要变更

1. **Photos 集合**
   - ✅ 新增 `photographerNote`: 摄影师备注
   - ✅ 新增 `shootingNote`: 拍摄备注
   - ✅ 新增 `postProcessing`: 后期说明
   - ✅ 新增 `cameraSettings`: 拍摄参数
   - ✅ 新增 `location`: 位置信息
   - ✅ `style` 字段支持自定义风格（不再限定预设值）
   - ✅ 新增 `tags` 数组，支持多标签

2. **Bookings 集合（重大更新）**
   - ✅ 状态从 4 个扩展到 11 个
   - ✅ 新增 `messages`: 沟通记录
   - ✅ 新增 `photographerNotes`: 摄影师内部备注
   - ✅ 新增价格相关字段
   - ✅ 更详细的时间记录

3. **新增 Collections 集合**
   - ✅ 支持作品系列管理

4. **新增 Styles 集合**
   - ✅ 支持自定义风格标签
   - ✅ 系统预设 + 摄影师自定义

5. **新增 Statistics 集合**
   - ✅ 支持数据统计分析

---

## 💡 使用建议

### 1. 风格管理策略
```javascript
// 系统预设 + 摄影师自定义
const allStyles = await db.collection('styles')
  .where({
    $or: [
      { isSystem: true },
      { photographerId: currentPhotographerId }
    ]
  })
  .get()
```

### 2. 预约状态查询
```javascript
// 待处理预约
const pending = await db.collection('bookings')
  .where({
    photographerId: currentPhotographerId,
    status: _.in(['pending', 'viewed', 'negotiating'])
  })
  .get()

// 即将拍摄
const upcoming = await db.collection('bookings')
  .where({
    photographerId: currentPhotographerId,
    status: 'confirmed',
    confirmedDate: _.gte(today)
  })
  .get()
```

### 3. 热门作品统计
```javascript
// 按收藏数排序
const popular = await db.collection('photos')
  .where({ photographerId: currentPhotographerId })
  .orderBy('likes', 'desc')
  .limit(10)
  .get()
```
