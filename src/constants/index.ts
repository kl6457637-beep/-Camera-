// 拍摄风格标签
export const PHOTO_STYLES = [
  { id: 'all', name: '全部', icon: '📷' },
  { id: 'vintage', name: '复古', icon: '🎞️' },
  { id: 'portrait', name: '人像', icon: '💫' },
  { id: 'mood', name: '情绪', icon: '🎭' },
  { id: 'street', name: '街头', icon: '🚶' },
  { id: 'film', name: '胶片', icon: '🎬' },
  { id: 'nature', name: '日系', icon: '🌿' },
  { id: 'fashion', name: '时尚', icon: '👗' },
  { id: 'couple', name: '情侣', icon: '💕' },
  { id: 'hanfu', name: '汉服', icon: '🏮' },
]

// 预约状态
export const BOOKING_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  SHOOTING: 'shooting',
  REVIEW: 'review',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
} as const

// 预约状态标签
export const BOOKING_STATUS_LABELS: Record<string, { text: string; color: string; bgColor: string }> = {
  [BOOKING_STATUS.PENDING]: { text: '待确认', color: '#FF9500', bgColor: '#FFF3E0' },
  [BOOKING_STATUS.CONFIRMED]: { text: '已确认', color: '#007AFF', bgColor: '#E3F2FD' },
  [BOOKING_STATUS.SHOOTING]: { text: '拍摄中', color: '#9C27B0', bgColor: '#F3E5F5' },
  [BOOKING_STATUS.REVIEW]: { text: '待评价', color: '#3F51B5', bgColor: '#E8EAF6' },
  [BOOKING_STATUS.COMPLETED]: { text: '已完成', color: '#4CAF50', bgColor: '#E8F5E9' },
  [BOOKING_STATUS.CANCELLED]: { text: '已取消', color: '#9E9E9E', bgColor: '#F5F5F5' }
}

// 拍摄类型
export const SHOOTING_TYPES = [
  { id: 'portrait', name: '个人写真' },
  { id: 'couple', name: '情侣照' },
  { id: 'graduation', name: '毕业照' },
  { id: 'bestie', name: '闺蜜照' },
  { id: 'commercial', name: '商业拍摄' },
  { id: 'other', name: '其他' }
]

export const SHOOTING_GUIDE = {
  preparation: {
    title: '拍摄前准备',
    items: [
      { label: '妆造建议', content: '建议模特根据拍摄风格准备相应妆容，可提前与摄影师沟通妆面要求' },
      { label: '服装准备', content: '通常准备2-3套服装，具体根据拍摄时长和场景数量确定' },
      { label: '道具准备', content: '如有特殊道具需求，请提前与摄影师确认由谁提供' },
    ]
  },
  during: {
    title: '拍摄中沟通',
    items: [
      { label: '动作引导', content: '摄影师会全程指导动作和表情，无需担心姿势问题' },
      { label: '陪同政策', content: '可带1位朋友陪同，但请不要干扰拍摄进程' },
      { label: '实时查看', content: '拍摄过程中可随时查看原片，不满意可及时调整' },
    ]
  },
  post: {
    title: '后期交付',
    items: [
      { label: '初修时间', content: '拍摄完成后3-5个工作日内提供初修预览' },
      { label: '精修张数', content: '根据套餐不同，精修9-20张不等' },
      { label: '原图交付', content: '所有原图经过基础调色后全送' },
    ]
  },
  notice: {
    title: '特别说明',
    items: [
      { label: '肖像权', content: '默认授予摄影师作品展示权，如需保密请提前说明' },
      { label: '定金规范', content: '预约需支付定金锁定档期，拍摄完成后支付尾款' },
      { label: '改期政策', content: '提前48小时可免费改期，临时取消定金不退' },
    ]
  }
}

// 默认摄影师信息
export const DEFAULT_PHOTOGRAPHER = {
  id: 'default',
  name: '光影诗人',
  title: '独立摄影师',
  location: '上海',
  bio: '专注人像摄影5年，用镜头记录每一个动人瞬间。擅长清新自然、复古胶片、古风汉服风格。',
  avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face',
  wechatId: 'guangying_shi',
  phone: '13800000000',
  stats: {
    works: 128,
    favorites: 2300,
    bookings: 56
  }
}

// 主题配置
export const THEMES = [
  { id: 'default', name: '默认粉', color: '#ff6b6b', bg: 'linear-gradient(135deg, #ff6b6b 0%, #ff8e8e 100%)' },
  { id: 'dark', name: '暗夜黑', color: '#1a1a2e', bg: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)' },
  { id: 'fresh', name: '清新绿', color: '#11998e', bg: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)' },
  { id: 'ocean', name: '海洋蓝', color: '#2193b0', bg: 'linear-gradient(135deg, #2193b0 0%, #6dd5ed 100%)' },
  { id: 'purple', name: '梦幻紫', color: '#667eea', bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }
]