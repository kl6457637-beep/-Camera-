# 📸 摄影师作品集小程序 V2.0 - 产品流程设计

## 🎯 产品设计思路

### 参考设计
- **Instagram**: 网格布局、极简风格、Stories、国际化
- **Airbnb**: 预约流程、状态管理
- **小红书**: 国内用户习惯

### 核心理念
- **模特端**: 发现美 → 表达意愿 → 预约确认 → 拍摄体验 → 作品交付
- **摄影师端**: 作品展示 → 意向收集 → 预约管理 → 拍摄执行 → 客户维护

---

## 👤 模特端完整流程

### 1. 发现 (Discover)
```
首页 → 瀑布流浏览 → 风格筛选 → 查看详情
```
- **网格布局**: Instagram 风格的正方形网格
- **Stories**: 顶部横向滚动的风格/活动入口
- **搜索**: 按风格、主题搜索
- **推荐算法**: 根据浏览历史推荐

### 2. 表达意愿 (Express Interest)
```
详情页 → 心动收藏 → 添加备注 → 继续浏览
```
- 点击❤️收藏作品
- 可以为每组作品添加备注（如："喜欢这个光线"）
- 收藏夹按风格自动分组

### 3. 预约 (Booking)
```
收藏页 → 点击预约 → 填写信息 → 选择时间 → 提交意向
```
**预约表单**:
- 姓名、联系方式
- 期望拍摄时间（3个备选）
- 拍摄类型（个人、情侣、毕业等）
- 特殊需求备注
- 已选作品展示

### 4. 查看状态 (Track Status)
```
我的 → 预约记录 → 查看进度
```
**状态流程**:
- ⏳ 待确认 (Pending) - 摄影师未查看
- ✅ 已确认 (Confirmed) - 摄影师接受预约
- 📅 已排期 (Scheduled) - 确定拍摄时间
- 📸 拍摄中 (Shooting) - 当天拍摄
- 🎨 后期中 (Editing) - 照片修图中
- ✨ 已完成 (Completed) - 交付完成
- ❌ 已取消 (Cancelled) - 预约取消

---

## 📷 摄影师端完整流程

### 1. 工作台概览 (Dashboard)
```
首页 → 数据卡片 → 快捷操作 → 待办事项
```

**数据卡片**:
- 今日浏览量
- 新增收藏数
- 新预约数
- 待确认预约

**快捷操作**:
- 上传新作品
- 查看预约
- 回复咨询

**待办事项**:
- 新预约提醒
- 即将拍摄提醒
- 后期交付提醒

### 2. 预约管理 (Booking Management)
```
预约Tab → 筛选状态 → 查看详情 → 确认/拒绝
```

**状态筛选Tab**:
- 全部 (All)
- 待确认 (Pending) - 需要处理
- 已确认 (Confirmed) - 待拍摄
- 拍摄中 (Shooting) - 今天
- 后期中 (Editing) - 修图中
- 已完成 (Completed) - 历史
- 已取消 (Cancelled) - 归档

**预约详情页**:
- 客户信息
- 期望时间
- 已选作品列表
- 客户备注
- 操作按钮（确认、改期、取消）
- 沟通记录

### 3. 作品管理 (Portfolio Management)
```
作品Tab → 网格视图 → 编辑/删除 → 创建系列
```

**功能**:
- 网格视图（Instagram风格）
- 批量编辑
- 创建作品系列（Set/Collection）
- 自定义标签
- 可见性控制（公开/隐藏）

**编辑功能**:
- 修改照片
- 编辑风格标签（自定义）
- 添加拍摄想法/备注
- 调整顺序
- 设置封面

### 4. 数据分析 (Analytics)
```
数据Tab → 统计图表 → 趋势分析
```

**统计数据**:
- 浏览量趋势
- 收藏转化率
- 预约转化率
- 热门作品排行
- 热门风格排行

---

## 🎨 UI设计规范（Instagram风格）

### 色彩系统
```
主色: #000000 (纯黑) - 高端感
辅色: #FFFFFF (纯白) - 纯净感
强调: #3897F0 (Ins蓝) - 互动元素
危险: #ED4956 (Ins红) - 删除/取消
文字: #262626 (深灰) - 主文字
次要: #8E8E8E (中灰) - 次要文字
背景: #FAFAFA (浅灰) - 页面背景
分割线: #DBDBDB (边框灰)
```

### 布局原则
- **网格系统**: 3列网格，间距1px
- **留白**: 大量留白，呼吸感
- **圆角**: 小圆角（4-8px），更现代
- **阴影**: 极少使用，保持扁平
- **导航**: 底部Tab + 顶部标题

### 字体规范
- **标题**: 16-18px, Semibold
- **正文**: 14px, Regular
- **辅助**: 12px, Regular
- **数字**: San Francisco / Roboto

### 图标风格
- 线性图标，2px描边
- 简约几何形状
- 统一24px大小

---

## 📊 数据模型更新

### 预约 (Bookings)
```typescript
interface Booking {
  _id: string;
  userId: string;           // 模特ID
  userName: string;         // 模特姓名
  userPhone: string;        // 联系方式
  status: 'pending' | 'confirmed' | 'scheduled' | 'shooting' | 'editing' | 'completed' | 'cancelled';
  selectedPhotos: string[]; // 选中的作品ID
  selectedStyles: string[]; // 选中的风格
  preferredDates: string[]; // 期望时间（3个备选）
  shootingType: string;     // 拍摄类型
  notes: string;           // 备注
  photographerNotes: string; // 摄影师备注
  createdAt: Date;
  updatedAt: Date;
  confirmedAt: Date;        // 确认时间
  scheduledAt: Date;        // 排期时间
  completedAt: Date;        // 完成时间
}
```

### 作品 (Photos)
```typescript
interface Photo {
  _id: string;
  url: string;             // 图片URL
  title: string;           // 标题
  description: string;     // 描述
  style: string;           // 风格（可自定义）
  tags: string[];          // 标签
  collectionId: string;    // 所属系列
  photographerNote: string; // 摄影师想法/备注
  cameraSettings: {        // 拍摄参数（可选）
    camera: string;
    lens: string;
    aperture: string;
    shutter: string;
    iso: string;
  };
  isPublic: boolean;       // 是否公开
  order: number;          // 排序
  views: number;          // 浏览数
  likes: number;          // 收藏数
  createdAt: Date;
}
```

### 系列 (Collections)
```typescript
interface Collection {
  _id: string;
  name: string;           // 系列名称
  description: string;    // 描述
  coverPhoto: string;     // 封面
  photos: string[];       // 照片ID列表
  isPublic: boolean;      // 是否公开
  createdAt: Date;
}
```

---

## 🔄 状态流转图

### 预约状态流转
```
[提交预约]
    ↓
[待确认] ← 摄影师收到通知
    ↓ 摄影师确认
[已确认]
    ↓ 确定具体时间
[已排期]
    ↓ 拍摄当天
[拍摄中]
    ↓ 拍摄完成
[后期中]
    ↓ 交付完成
[已完成]

取消路径:
[待确认] → [已取消]
[已确认] → [已取消]
```

---

## 📱 页面结构

### 模特端（5页）
1. **Discover** (发现) - 网格+Stories
2. **Photo Detail** (详情) - 全屏+信息
3. **Favorites** (收藏) - 网格视图
4. **Booking** (预约) - 表单流程
5. **My Bookings** (我的预约) - 状态追踪

### 摄影师端（工作台，5页）
1. **Dashboard** (概览) - 数据+待办
2. **Bookings** (预约管理) - 筛选+列表
3. **Portfolio** (作品管理) - 网格+编辑
4. **Collections** (系列管理) - 分组管理
5. **Analytics** (数据分析) - 统计图表

---

## ⚡ 交互细节

### 动画效果
- 页面切换: 滑动过渡 300ms
- 图片加载: 淡入效果
- 按钮点击: 缩放 0.95
- 收藏: 心跳动画 + 粒子效果
- 下拉刷新: 旋转loading

### 手势操作
- 左右滑动: 切换Tab
- 长按图片: 快速收藏
- 双击: 点赞/收藏
- 下拉: 刷新数据
- 上拉: 加载更多

### 反馈机制
- Toast: 操作成功/失败提示
- Badge: 未读数量红点
- Haptic: 轻微震动反馈
- Sound: 收藏成功音效（可选）

---

## 🎯 MVP功能优先级

### P0 - 核心功能（必须）
- [x] 作品网格展示
- [x] 收藏功能
- [x] 预约提交
- [x] 预约状态管理
- [x] 摄影师工作台

### P1 - 重要功能（尽快）
- [ ] 自定义风格标签
- [ ] 摄影师备注
- [ ] 预约时间选择
- [ ] 消息通知
- [ ] 数据统计

### P2 - 增强功能（后续）
- [ ] Stories功能
- [ ] 搜索功能
- [ ] 评价系统
- [ ] 在线支付
- [ ] 聊天功能

---

## 📝 开发计划

### Phase 1: 基础架构
- [ ] 更新数据模型
- [ ] 创建新的页面结构
- [ ] 更新云函数

### Phase 2: 模特端
- [ ] 重新设计首页（Ins风格）
- [ ] 详情页优化
- [ ] 预约流程完善

### Phase 3: 摄影师端
- [ ] 工作台Dashboard
- [ ] 预约管理系统
- [ ] 作品管理系统

### Phase 4: 完善
- [ ] 动画效果
- [ ] 响应式优化
- [ ] 测试调试
