import Taro, { useDidShow } from '@tarojs/taro'
import { useState, useEffect } from 'react'
import { View, Image, Text, ScrollView } from '@tarojs/components'
import { useAppContext } from '../../hooks/useAppContext'
import { DEFAULT_PHOTOGRAPHER, THEMES } from '../../constants'
import BottomNav from '../../components/BottomNav'
import UploadModal from '../../components/UploadModal'
import { UploadData } from '../../components/UploadModal'
import './index.scss'

export default function Admin() {
  const { works, addWork, isPhotographerMode } = useAppContext()
  const [showUploadModal, setShowUploadModal] = useState(false)

  // 主题状态
  const [currentTheme, setCurrentTheme] = useState('default')

  // 加载保存的主题
  useEffect(() => {
    const savedTheme = Taro.getStorageSync('app_theme') || 'default'
    setCurrentTheme(savedTheme)
  }, [])

  const currentThemeConfig = THEMES.find(t => t.id === currentTheme) || THEMES[0]

  // 页面显示时刷新数据
  useDidShow(() => {
    // 摄影师模式检查
    if (!isPhotographerMode) {
      Taro.showToast({ title: '请先开启摄影师模式', icon: 'none' })
      Taro.switchTab({ url: '/pages/index/index' })
    }
  })

  // 提交上传
  const handleUploadSubmit = (data: UploadData) => {
    const newWork = {
      id: 'work_' + Date.now(),
      title: data.title,
      description: data.description,
      images: data.images,
      style: data.style,
      camera: data.camera,
      lens: data.lens,
      likes: 0,
      createdAt: new Date().toISOString().split('T')[0]
    }
    addWork(newWork)
    setShowUploadModal(false)
  }

  const goToDetail = (workId: string) => {
    Taro.navigateTo({ url: `/pages/detail/index?id=${workId}` })
  }

  return (
    <View className='admin-page'>
      {/* 顶部标题 */}
      <View className='page-header' style={{ background: currentThemeConfig.bg }}>
        <Text className='page-title'>我的作品</Text>
        <Text className='page-subtitle'>管理你的作品集</Text>
      </View>

      {/* 个人名片头部 */}
      <View className='portfolio-header'>
        <Image 
          className='portfolio-avatar' 
          src={DEFAULT_PHOTOGRAPHER.avatar} 
          mode='aspectFill' 
        />
        <Text className='portfolio-name'>{DEFAULT_PHOTOGRAPHER.name}</Text>
        <Text className='portfolio-bio'>{DEFAULT_PHOTOGRAPHER.bio}</Text>
      </View>

      {/* 统计信息 */}
      <View className='portfolio-stats'>
        <View className='stat-item'>
          <Text className='stat-value'>{works.length}</Text>
          <Text className='stat-label'>作品</Text>
        </View>
        <View className='stat-item'>
          <Text className='stat-value'>2.3k</Text>
          <Text className='stat-label'>收藏</Text>
        </View>
        <View className='stat-item'>
          <Text className='stat-value'>56</Text>
          <Text className='stat-label'>预约</Text>
        </View>
      </View>

      {/* 上传区域 - 打开上传弹窗 */}
      <View
        className='upload-area'
        onClick={() => setShowUploadModal(true)}
        style={{ borderColor: currentThemeConfig.color }}
      >
        <Text className='upload-icon' style={{ color: currentThemeConfig.color }}>+</Text>
        <Text className='upload-title' style={{ color: currentThemeConfig.color }}>上传新作品</Text>
        <Text className='upload-desc'>点击添加照片、风格标签和创作想法</Text>
      </View>

      {/* 作品管理 */}
      <ScrollView className='works-panel' scrollY>
        {works.length === 0 ? (
          <View className='empty-state'>
            <View className='empty-icon-wrapper'>
              <Text className='empty-icon'>🖼️</Text>
            </View>
            <Text className='empty-title'>还没有作品</Text>
            <Text className='empty-desc'>上传你的第一组作品，开始展示你的摄影作品集</Text>
            <View
              className='empty-btn'
              onClick={() => setShowUploadModal(true)}
              style={{ background: currentThemeConfig.bg }}
            >
              <Text className='empty-btn-text'>去上传</Text>
            </View>
            <View className='empty-tips'>
              <Text className='tip-text'>💡 提示：支持批量上传，最多9张</Text>
            </View>
          </View>
        ) : (
          <View className='portfolio-grid'>
            {works.map(work => (
              <View key={work.id} className='portfolio-grid-item' onClick={() => goToDetail(work.id)}>
                <Image 
                  className='grid-image' 
                  src={work.images[0]} 
                  mode='aspectFill' 
                />
                <View className='portfolio-grid-overlay'>
                  <View className='portfolio-grid-stats'>
                    <View className='portfolio-grid-stat'>
                      <Text className='stat-icon'>❤️</Text>
                      <Text className='stat-num'>{work.likes}</Text>
                    </View>
                  </View>
                </View>
                {work.images.length > 1 && (
                  <View className='multi-badge'>
                    <Text className='badge-text'>多图</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* 底部导航 */}
      <BottomNav currentPage='works' />

      {/* 上传作品弹窗 */}
      <UploadModal
        visible={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onSubmit={handleUploadSubmit}
      />
    </View>
  )
}