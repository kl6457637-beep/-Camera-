import Taro, { useDidShow } from '@tarojs/taro'
import { useState, useCallback, useEffect } from 'react'
import { View, Image, Text, ScrollView } from '@tarojs/components'
import { showToast, showConfirm } from '../../utils'
import './index.scss'

// 完整的作品数据
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

interface FavoriteWork {
  id: string
  title: string
  image: string
  style: string
  likes: number
}

export default function Favorites() {
  const [favorites, setFavorites] = useState<FavoriteWork[]>([])
  const [loading, setLoading] = useState(true)

  // 页面显示时刷新
  useDidShow(() => {
    loadFavorites()
  })

  const loadFavorites = useCallback(() => {
    try {
      // 从存储中获取收藏ID列表
      const favoriteIds: string[] = Taro.getStorageSync('user_favorites') || []
      
      // 获取作品数据
      const allWorks = getDefaultWorks()
      
      // 匹配收藏的作品
      const favoriteWorks = favoriteIds
        .map(id => {
          const work = allWorks.find(w => w.id === id)
          if (work) {
            return {
              id: work.id,
              title: work.title,
              image: work.images[0],
              style: work.style,
              likes: work.likes
            }
          }
          return null
        })
        .filter((w): w is FavoriteWork => w !== null)
      
      setFavorites(favoriteWorks)
    } catch (e) {
      console.error('加载收藏失败', e)
    }
    setLoading(false)
  }, [])

  const handleRemove = async (workId: string) => {
    const confirmed = await showConfirm('取消心动', '确定要取消这张图片的心动吗？')
    if (confirmed) {
      try {
        const favoriteIds: string[] = Taro.getStorageSync('user_favorites') || []
        const newFavorites = favoriteIds.filter(id => id !== workId)
        Taro.setStorageSync('user_favorites', newFavorites)
        loadFavorites()
        showToast('已取消心动')
      } catch (e) {
        console.error('取消收藏失败', e)
      }
    }
  }

  // 点击作品查看详情
  const handleViewWork = (workId: string) => {
    Taro.navigateTo({
      url: `/pages/detail/index?id=${workId}`
    })
  }

  // 返回上一页
  const goBack = () => {
    Taro.navigateBack()
  }

  // 返回首页浏览更多
  const goToHome = () => {
    Taro.switchTab({
      url: '/pages/index/index'
    })
  }

  const clearAll = async () => {
    const confirmed = await showConfirm('清空心动', '确定要清空所有心动作品吗？')
    if (confirmed) {
      try {
        Taro.setStorageSync('user_favorites', [])
        loadFavorites()
        showToast('已清空')
      } catch (e) {
        console.error('清空收藏失败', e)
      }
    }
  }

  // 按风格分组
  const groupedFavorites = favorites.reduce((acc, item) => {
    if (!acc[item.style]) {
      acc[item.style] = []
    }
    acc[item.style].push(item)
    return acc
  }, {} as Record<string, FavoriteWork[]>)

  if (loading) {
    return (
      <View className='favorites-loading'>
        <View className='spinner' />
      </View>
    )
  }

  return (
    <View className='favorites-page'>
      {/* 导航栏 */}
      <View className='nav-bar'>
        <View className='back-btn' onClick={goBack}>
          <Text className='back-icon'>←</Text>
        </View>
        <Text className='nav-title'>我的心动清单</Text>
        <View className='nav-placeholder' />
      </View>

      {/* 头部信息 */}
      <View className='header'>
        <Text className='subtitle'>已收藏 {favorites.length} 个作品</Text>
        {favorites.length > 0 && (
          <Text className='clear-btn' onClick={clearAll}>清空</Text>
        )}
      </View>

      {/* 收藏列表 */}
      {favorites.length === 0 ? (
        <View className='empty-state'>
          <Text className='empty-icon'>💝</Text>
          <Text className='empty-title'>还没有心动作品</Text>
          <Text className='empty-desc'>浏览作品时点击爱心图标，收藏你喜欢的风格</Text>
          <View className='browse-btn' onClick={goToHome}>
            <Text className='btn-text'>去浏览作品</Text>
          </View>
        </View>
      ) : (
        <ScrollView className='favorites-list' scrollY>
          {Object.entries(groupedFavorites).map(([styleName, items]) => (
            <View key={styleName} className='style-group'>
              <View className='style-header'>
                <Text className='style-name'>{styleName}</Text>
                <Text className='style-count'>{items.length} 个作品</Text>
              </View>
              <View className='style-photos'>
                {items.map((item) => (
                  <View 
                    key={item.id} 
                    className='favorite-item'
                    onClick={() => handleViewWork(item.id)}
                  >
                    <Image
                      className='favorite-image'
                      src={item.image}
                      mode='aspectFill'
                      lazyLoad
                    />
                    <View className='favorite-overlay'>
                      <Text className='favorite-title'>{item.title}</Text>
                    </View>
                    <View 
                      className='remove-btn'
                      onClick={(e) => {
                        e.stopPropagation()
                        handleRemove(item.id)
                      }}
                    >
                      <Text className='remove-icon'>✕</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          ))}
          <View className='list-footer' />
        </ScrollView>
      )}

      {/* 底部统计 */}
      {favorites.length > 0 && (
        <View className='bottom-summary'>
          <Text className='summary-text'>
            你心动了 {favorites.length} 个作品，涵盖 {Object.keys(groupedFavorites).length} 种风格
          </Text>
        </View>
      )}
    </View>
  )
}
