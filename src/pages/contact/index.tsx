import Taro from '@tarojs/taro'
import { useState, useEffect } from 'react'
import { View, Image, Text, ScrollView } from '@tarojs/components'
import { getLocalFavorites, getFavoriteStats, copyToClipboard, showToast } from '@/utils'
import { SHOOTING_GUIDE, DEFAULT_PHOTOGRAPHER } from '@/constants'
import './index.scss'

export default function Contact() {
  const [favorites, setFavorites] = useState<LocalFavorite[]>([])
  const [stats, setStats] = useState({ total: 0, byStyle: {} as Record<string, number> })
  const [showGuide, setShowGuide] = useState(false)
  const [photographer, setPhotographer] = useState(DEFAULT_PHOTOGRAPHER)
  const [showQrModal, setShowQrModal] = useState(false)

  useEffect(() => {
    const favs = getLocalFavorites()
    setFavorites(favs)
    setStats(getFavoriteStats())
  }, [])

  const handleCopyWechat = async () => {
    await copyToClipboard(photographer.wechatId)
    showToast('微信号已复制', 'success')
  }

  const handleSubmitIntent = async () => {
    // 提交意向到云开发
    try {
      // 这里会调用云函数提交意向
      showToast('意向已同步给摄影师', 'success')
      
      // 显示加微信弹窗
      setShowQrModal(true)
    } catch (error) {
      showToast('提交失败，请重试', 'error')
    }
  }

  const closeQrModal = () => {
    setShowQrModal(false)
  }

  const getTopStyles = () => {
    return Object.entries(stats.byStyle)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([name, count]) => name)
  }

  return (
    <View className='contact-page'>
      {/* 顶部意图卡片 */}
      <View className='intent-card'>
        <View className='card-header'>
          <Text className='card-title'>你的拍摄意向</Text>
          <Text className='card-subtitle'>已同步至摄影师</Text>
        </View>
        
        {favorites.length > 0 ? (
          <View className='intent-content'>
            <View className='intent-stats'>
              <View className='stat-item'>
                <Text className='stat-number'>{stats.total}</Text>
                <Text className='stat-label'>心动作品</Text>
              </View>
              <View className='stat-item'>
                <Text className='stat-number'>{Object.keys(stats.byStyle).length}</Text>
                <Text className='stat-label'>风格类型</Text>
              </View>
            </View>
            
            <View className='top-styles'>
              <Text className='styles-label'>偏好的风格：</Text>
              <View className='styles-tags'>
                {getTopStyles().map(style => (
                  <View key={style} className='style-tag'>
                    <Text className='tag-text'>{style}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        ) : (
          <View className='empty-intent'>
            <Text className='empty-text'>还没有收藏作品，去浏览一下吧</Text>
          </View>
        )}
      </View>

      {/* 约拍流程说明 */}
      <View className='guide-section'>
        <View className='section-header' onClick={() => setShowGuide(!showGuide)}>
          <Text className='section-title'>📋 约拍流程说明</Text>
          <Text className={`arrow ${showGuide ? 'up' : 'down'}`}>▼</Text>
        </View>
        
        {showGuide && (
          <ScrollView className='guide-content' scrollY>
            {Object.entries(SHOOTING_GUIDE).map(([key, section]) => (
              <View key={key} className='guide-block'>
                <Text className='block-title'>{section.title}</Text>
                {section.items.map((item, index) => (
                  <View key={index} className='guide-item'>
                    <Text className='item-label'>{item.label}</Text>
                    <Text className='item-content'>{item.content}</Text>
                  </View>
                ))}
              </View>
            ))}
          </ScrollView>
        )}
      </View>

      {/* 联系操作区 */}
      <View className='contact-section'>
        <View className='wechat-card'>
          <Text className='card-label'>摄影师微信</Text>
          <View className='wechat-info'>
            <Text className='wechat-id'>{photographer.wechatId}</Text>
            <View className='copy-btn' onClick={handleCopyWechat}>
              <Text className='btn-text'>复制</Text>
            </View>
          </View>
        </View>

        <View className='action-tips'>
          <Text className='tips-text'>
            💡 建议发送："已在小程序选好风格，心动了{stats.total}个作品，期待合作～"
          </Text>
        </View>

        <View className='submit-btn' onClick={handleSubmitIntent}>
          <Text className='btn-text'>确认意向并联系摄影师</Text>
        </View>
      </View>

      {/* 二维码弹窗 */}
      {showQrModal && (
        <View className='qr-modal' onClick={closeQrModal}>
          <View className='modal-content' onClick={e => e.stopPropagation()}>
            <Text className='modal-title'>很高兴遇见你</Text>
            <Text className='modal-subtitle'>一起创作吧 ✨</Text>
            <View className='qr-placeholder'>
              <Text className='qr-text'>二维码区域</Text>
              <Text className='qr-hint'>请上传微信二维码图片</Text>
            </View>
            <View className='modal-action'>
              <View className='copy-btn-large' onClick={handleCopyWechat}>
                <Text className='btn-text'>复制微信号</Text>
              </View>
            </View>
            <View className='close-modal' onClick={closeQrModal}>
              <Text className='close-text'>关闭</Text>
            </View>
          </View>
        </View>
      )}
    </View>
  )
}