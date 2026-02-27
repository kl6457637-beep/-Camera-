import Taro, { useDidShow } from '@tarojs/taro'
import { useState, useCallback, useEffect } from 'react'
import { View, Image, Text, Swiper, SwiperItem, ScrollView } from '@tarojs/components'
import { useAppContext } from '../../hooks/useAppContext'
import BottomNav from '../../components/BottomNav'
import ContactModal from '../../components/ContactModal'
import BookingModal from '../../components/BookingModal'
import './index.scss'

const STYLES = [
  { id: 'all', name: '全部', icon: '📷' },
  { id: '清新', name: '清新', icon: '🌿' },
  { id: '复古', name: '复古', icon: '🎞️' },
  { id: '人像', name: '人像', icon: '💫' },
  { id: '情绪', name: '情绪', icon: '🎭' },
  { id: '街拍', name: '街拍', icon: '🚶' },
  { id: '时尚', name: '时尚', icon: '👗' },
  { id: '胶片', name: '胶片', icon: '🎬' },
  { id: '日系', name: '日系', icon: '🌸' },
  { id: '情侣', name: '情侣', icon: '💕' },
  { id: '汉服', name: '汉服', icon: '🏮' },
]

const getPhotographerInfo = () => {
  const savedProfile = Taro.getStorageSync('user_profile')
  return {
    name: savedProfile?.nickname || '光影诗人',
    avatar: savedProfile?.avatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400',
    wechat: 'guangying_shi',
    title: savedProfile?.bio || '独立摄影师',
    location: savedProfile?.location || '上海'
  }
}

// 默认作品数据 - 包含多图作品
const getDefaultWorks = () => [
  {
    id: '1',
    title: '晨光少女',
    description: '自然光下的温柔时刻',
    images: [
      'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=600&h=800&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&h=800&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&h=800&fit=crop&crop=face'
    ],
    style: '清新',
    location: '上海法租界',
    likes: 234,
    createdAt: '2024-01-15'
  },
  {
    id: '2',
    title: '复古时光',
    description: '老上海风情人像',
    images: ['https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&h=900&fit=crop&crop=face'],
    style: '复古',
    location: '上海外滩',
    likes: 189,
    createdAt: '2024-01-14'
  },
  {
    id: '3',
    title: '窗边思绪',
    description: '午后窗边的静谧时刻',
    images: [
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&h=700&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=600&h=700&fit=crop&crop=face'
    ],
    style: '情绪',
    location: '上海田子坊',
    likes: 156,
    createdAt: '2024-01-13'
  },
  {
    id: '4',
    title: '温柔午后',
    description: '阳光洒落的温柔瞬间',
    images: ['https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&h=800&fit=crop&crop=face'],
    style: '清新',
    location: '上海植物园',
    likes: 312,
    createdAt: '2024-01-12'
  },
  {
    id: '5',
    title: '都市丽影',
    description: '都市街头时尚人像',
    images: [
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600&h=750&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=600&h=750&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&h=750&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=600&h=750&fit=crop&crop=face'
    ],
    style: '时尚',
    location: '上海陆家嘴',
    likes: 278,
    createdAt: '2024-01-11'
  },
  {
    id: '6',
    title: '街头漫步',
    description: '城市街头的自然瞬间',
    images: ['https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=600&h=850&fit=crop&crop=face'],
    style: '街拍',
    location: '上海新天地',
    likes: 145,
    createdAt: '2024-01-10'
  }
]

export default function Index() {
  const { works: contextWorks, toggleFavorite, bookings } = useAppContext()
  const [style, setStyle] = useState('all')
  const [favs, setFavs] = useState<string[]>([])
  const [works, setWorks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showContactModal, setShowContactModal] = useState(false)
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [statusBarHeight, setStatusBarHeight] = useState(44)
  const [photographer, setPhotographer] = useState(getPhotographerInfo())

  // 获取状态栏高度
  useEffect(() => {
    const systemInfo = Taro.getSystemInfoSync()
    setStatusBarHeight(systemInfo.statusBarHeight || 44)
  }, [])

  // 加载数据
  useEffect(() => {
    loadData()
  }, [contextWorks])

  // 页面显示时刷新
  useDidShow(() => {
    loadFavorites()
    // 刷新摄影师信息（头像等）
    setPhotographer(getPhotographerInfo())
  })

  const loadFavorites = () => {
    try {
      const favorites = Taro.getStorageSync('user_favorites') || []
      setFavs(favorites)
    } catch(e) {
      console.error('加载收藏失败', e)
    }
  }

  const loadData = () => {
    loadFavorites()
    
    // 使用上下文中的作品数据，如果没有则使用默认数据
    if (contextWorks && contextWorks.length > 0) {
      setWorks(contextWorks)
    } else {
      setWorks(getDefaultWorks())
    }
    setLoading(false)
  }

  // 风格筛选逻辑 - 根据作品style字段匹配
  const getWorks = useCallback(() => {
    if (style === 'all') return works
    return works.filter(w => w.style === style)
  }, [style, works])

  const toggleLike = useCallback((id: string, e?: any) => {
    if (e) e.stopPropagation()
    
    try {
      const idx = favs.indexOf(id)
      let newFavs
      if (idx > -1) {
        newFavs = favs.filter(fid => fid !== id)
      } else {
        newFavs = [...favs, id]
      }
      Taro.setStorageSync('user_favorites', newFavs)
      setFavs(newFavs)
      
      // 同时更新全局状态
      toggleFavorite(id)
    } catch(err) {
      console.error('切换收藏失败', err)
    }
  }, [favs, toggleFavorite])

  const gotoDetail = useCallback((id: string) => {
    Taro.navigateTo({ url: '/pages/detail/index?id=' + id })
  }, [])

  const copyWechat = useCallback(() => {
    setShowContactModal(true)
  }, [])

  const goBooking = useCallback(() => {
    setShowBookingModal(true)
  }, [])

  // 跳转到收藏页面
  const goToFavorites = useCallback(() => {
    Taro.navigateTo({ url: '/pages/favorites/index' })
  }, [])

  // 跳转到预约页面
  const goToBookings = useCallback(() => {
    Taro.navigateTo({ url: '/pages/booking/index' })
  }, [])

  const handleBookingSubmit = (data: any) => {
    console.log('预约数据:', data)
    Taro.showToast({ title: '预约成功', icon: 'success' })
    setShowBookingModal(false)
  }

  const changeStyle = useCallback((id: string) => {
    setStyle(id)
  }, [])

  const worksList = getWorks()
  
  // 统计数据
  const worksCount = works.length
  const favsCount = favs.length
  const bookingCount = bookings?.length || 0

  if (loading) {
    return (
      <View className='loading'>
        <Text>加载中...</Text>
      </View>
    )
  }

  return (
    <View className='page'>
      {/* 顶部背景区域 */}
      <View className='header-bg' style={{ paddingTop: `${statusBarHeight}px` }}>
        <View className='header-pattern' />
      </View>
      
      {/* 头部内容 */}
      <View className='header' style={{ marginTop: `-${statusBarHeight * 0.5}px` }}>
        <View className='avatar-wrapper'>
          <Image className='avatar' src={photographer.avatar} mode='aspectFill' />
          <View className='verified-badge'>✓</View>
        </View>
        <Text className='name'>{photographer.name}</Text>
        <Text className='title'>{photographer.title} · {photographer.location}</Text>
        
        {/* 统计数据 */}
        <View className='stats'>
          <View className='stat-item'>
            <Text className='stat-num'>{worksCount}</Text>
            <Text className='stat-label'>作品</Text>
          </View>
          <View className='stat-divider' />
          <View className='stat-item' onTap={goToFavorites}>
            <Text className='stat-num'>{favsCount}</Text>
            <Text className='stat-label'>收藏</Text>
          </View>
          <View className='stat-divider' />
          <View className='stat-item' onTap={goToBookings}>
            <Text className='stat-num'>{bookingCount}</Text>
            <Text className='stat-label'>预约</Text>
          </View>
        </View>
        
        {/* 操作按钮 */}
        <View className='action-btns'>
          <View className='action-btn contact-btn' onTap={copyWechat}>
            <View className='btn-icon-wrapper'>
              <Text className='btn-icon contact-icon'>💬</Text>
            </View>
            <Text className='btn-text'>联系我</Text>
          </View>
          <View className='action-btn book-btn' onTap={goBooking}>
            <View className='btn-icon-wrapper'>
              <Text className='btn-icon book-icon'>📸</Text>
            </View>
            <Text className='btn-text'>预约摄影</Text>
          </View>
        </View>
      </View>

      {/* 风格标签 */}
      <View className='tabs-section'>
        <ScrollView scrollX className='tabs-scroll' showScrollbar={false}>
          <View className='tabs'>
            {STYLES.map(s => (
              <View 
                key={s.id} 
                className={`tab ${style === s.id ? 'active' : ''}`}
                onTap={() => changeStyle(s.id)}
              >
                <Text className='tab-icon'>{s.icon}</Text>
                <Text className='tab-name'>{s.name}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* 作品列表 */}
      <View className='works-list'>
        {worksList.map(work => {
          const liked = favs.indexOf(work.id) > -1
          const hasMultipleImages = work.images.length > 1
          
          return (
            <View key={work.id} className='work-card' onTap={() => gotoDetail(work.id)}>
              {/* 图片区域 - 多图并排显示 */}
              <View className='image-wrapper'>
                {hasMultipleImages ? (
                  <View className='multi-image-container'>
                    {/* 主图 - 占大部分 */}
                    <View className='main-image-wrap'>
                      <Image 
                        className='work-image' 
                        src={work.images[0]} 
                        mode='aspectFill'
                        lazyLoad
                      />
                    </View>
                    {/* 副图区域 - 显示第二张图的一部分 */}
                    <View className='sub-images-wrap'>
                      {work.images.slice(1, 3).map((img: string, idx: number) => (
                        <View key={idx} className='sub-image-item'>
                          <Image 
                            className='work-image' 
                            src={img} 
                            mode='aspectFill'
                            lazyLoad
                          />
                        </View>
                      ))}
                      {/* 更多图片提示 */}
                      {work.images.length > 3 && (
                        <View className='more-images-hint'>
                          <Text className='more-text'>+{work.images.length - 3}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                ) : (
                  <View className='single-image-container'>
                    <Image 
                      className='work-image' 
                      src={work.images[0]} 
                      mode='aspectFill'
                      lazyLoad
                    />
                  </View>
                )}
                
                {/* 图片数量标识 */}
                {hasMultipleImages && (
                  <View className='image-count-badge'>
                    <Text className='count-icon'>◫</Text>
                    <Text className='count-text'>{work.images.length}</Text>
                  </View>
                )}
                
                {/* 收藏标识 */}
                {liked && (
                  <View className='fav-badge'>
                    <Text>❤️</Text>
                  </View>
                )}
              </View>
              
              {/* 信息区域 */}
              <View className='work-info'>
                <View className='work-header'>
                  <Text className='work-title'>{work.title}</Text>
                  <View 
                    className={`like-btn ${liked ? 'liked' : ''}`} 
                    onTap={(e) => toggleLike(work.id, e)}
                  >
                    <Text className='like-icon'>{liked ? '❤️' : '🤍'}</Text>
                  </View>
                </View>
                <Text className='work-desc'>{work.description}</Text>
                <View className='work-footer'>
                  <Text className='work-style-tag'>#{work.style}</Text>
                  <Text className='work-likes'>❤️ {work.likes}</Text>
                </View>
              </View>
            </View>
          )
        })}
      </View>

      {/* 底部导航 */}
      <BottomNav currentPage='index' />

      {/* 联系弹窗 */}
      <ContactModal
        visible={showContactModal}
        onClose={() => setShowContactModal(false)}
      />

      {/* 预约弹窗 */}
      <BookingModal
        visible={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        onSubmit={handleBookingSubmit}
      />
    </View>
  )
}
