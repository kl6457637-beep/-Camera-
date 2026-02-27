import Taro, { useLoad } from '@tarojs/taro'
import { useState, useCallback, useEffect } from 'react'
import { View, Image, Text, Swiper, SwiperItem } from '@tarojs/components'
import { useAppContext } from '../../hooks/useAppContext'
import BookingModal from '../../components/BookingModal'
import './index.scss'

// 默认作品数据（与首页保持一致）
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
    camera: 'Canon EOS R5',
    lens: 'RF 85mm f/1.2L',
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
    camera: 'Sony A7M4',
    lens: 'FE 50mm f/1.2',
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
    camera: 'Fujifilm XT-4',
    lens: 'XF 56mm f/1.2',
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
    camera: 'Canon EOS R6',
    lens: 'RF 50mm f/1.8',
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
    camera: 'Nikon Z6 II',
    lens: 'Z 85mm f/1.8',
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
    camera: 'Leica Q2',
    lens: 'Summilux 28mm',
    location: '上海新天地',
    likes: 145,
    createdAt: '2024-01-10'
  }
]

export default function Detail() {
  const { works: contextWorks, toggleFavorite } = useAppContext()
  const [work, setWork] = useState<any>(null)
  const [liked, setLiked] = useState(false)
  const [idx, setIdx] = useState(0)
  const [loading, setLoading] = useState(true)
  const [workId, setWorkId] = useState<string>('')
  const [showBookingModal, setShowBookingModal] = useState(false)

  // 页面加载时获取作品数据
  useLoad((options: any) => {
    const id = options?.id
    if (id) {
      setWorkId(id)
      loadWorkData(id)
    } else {
      setLoading(false)
    }
  })

  const loadWorkData = useCallback((id: string) => {
    try {
      // 优先从上下文中获取作品数据
      let works = contextWorks
      if (!works || works.length === 0) {
        works = getDefaultWorks()
      }
      
      const found = works.find((w: any) => w.id === id)
      if (found) {
        const favs = Taro.getStorageSync('user_favorites') || []
        setWork(found)
        setLiked(favs.indexOf(id) > -1)
      }
      setLoading(false)
    } catch(e) {
      console.error('加载作品失败', e)
      setLoading(false)
    }
  }, [contextWorks])

  const toggleLike = useCallback(() => {
    if (!work) return
    
    try {
      const favs = Taro.getStorageSync('user_favorites') || []
      let newFavs
      if (liked) {
        newFavs = favs.filter((fid: string) => fid !== work.id)
      } else {
        newFavs = [...favs, work.id]
      }
      Taro.setStorageSync('user_favorites', newFavs)
      setLiked(!liked)
      
      // 同时更新全局状态
      toggleFavorite(work.id)
    } catch(e) {
      console.error('切换收藏失败', e)
    }
  }, [work, liked, toggleFavorite])

  const onSwiperChange = useCallback((e: any) => {
    setIdx(e.detail.current)
  }, [])

  const goBack = useCallback(() => {
    Taro.navigateBack()
  }, [])

  const goHome = useCallback(() => {
    Taro.switchTab({ url: '/pages/index/index' })
  }, [])

  const goBooking = useCallback(() => {
    setShowBookingModal(true)
  }, [])

  const handleBookingSubmit = (data: any) => {
    console.log('预约数据:', data)
    Taro.showToast({ title: '预约成功', icon: 'success' })
    setShowBookingModal(false)
  }

  if (loading) {
    return (
      <View className='loading'>
        <Text>加载中...</Text>
      </View>
    )
  }

  if (!work) {
    return (
      <View className='loading'>
        <Text>作品不存在</Text>
        <Text className='back' onClick={goHome}>返回首页</Text>
      </View>
    )
  }

  return (
    <View className='page'>
      <View className='img-box'>
        <Swiper
          className='swiper'
          style={{ height: '100%' }}
          indicatorDots={work.images.length > 1}
          indicatorColor='rgba(255,255,255,0.5)'
          indicatorActiveColor='#fff'
          onChange={onSwiperChange}
          circular={work.images.length > 1}
        >
          {work.images.map((img: string, i: number) => (
            <SwiperItem key={i} style={{ width: '100%', height: '100%' }}>
              <Image 
                className='img' 
                src={img} 
                mode='aspectFill'
                style={{ width: '100%', height: '100%' }}
                lazyLoad
              />
            </SwiperItem>
          ))}
        </Swiper>
        {work.images.length > 1 && (
          <View className='page-num'>
            <Text>{idx + 1}/{work.images.length}</Text>
          </View>
        )}
      </View>

      <View className='close' onClick={goBack}>
        <Text>✕</Text>
      </View>

      <View className='panel'>
        <View className='user'>
          <Image 
            className='avatar' 
            src='https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100' 
            mode='aspectFill' 
          />
          <View className='info'>
            <Text className='name'>光影诗人</Text>
            <Text className='loc'>上海</Text>
          </View>
        </View>

        <View className='content'>
          <Text className='title'>{work.title}</Text>
          <Text className='desc'>{work.description}</Text>
          <View className='info-row'>
            <Text className='style-tag'>#{work.style}</Text>
            {work.location && (
              <View className='location-tag'>
                <Text className='location-icon'>📍</Text>
                <Text className='location-text'>{work.location}</Text>
              </View>
            )}
          </View>
          {(work.camera || work.lens) && (
            <Text className='cam'>📷 {work.camera} {work.lens}</Text>
          )}
          <Text className='date'>发布于 {work.createdAt}</Text>
        </View>

        <View className='actions'>
          <View 
            className={'btn like ' + (liked ? 'active' : '')} 
            onClick={toggleLike}
          >
            <Text>{liked ? '❤️' : '🤍'}</Text>
            <Text>{liked ? '已心动' : '心动'}</Text>
          </View>
          <View className='btn book' onClick={goBooking}>
            <Text>📸 预约拍摄</Text>
          </View>
        </View>
      </View>

      {/* 预约弹窗 */}
      <BookingModal
        visible={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        onSubmit={handleBookingSubmit}
        initialWorkId={workId}
      />
    </View>
  )
}
