import Taro, { useDidShow } from '@tarojs/taro'
import { useState } from 'react'
import { View, Text, Switch } from '@tarojs/components'
import { showToast, showConfirm } from '../../../utils'
import './index.scss'

interface PrivacySettings {
  publicFavorites: boolean
  publicBookings: boolean
  allowSearch: boolean
  showOnlineStatus: boolean
  allowComment: boolean
  allowDownload: boolean
}

export default function Privacy() {
  const [settings, setSettings] = useState<PrivacySettings>({
    publicFavorites: false,
    publicBookings: true,
    allowSearch: true,
    showOnlineStatus: true,
    allowComment: true,
    allowDownload: false
  })

  // 页面显示时加载设置
  useDidShow(() => {
    const savedSettings = Taro.getStorageSync('privacy_settings')
    if (savedSettings) {
      setSettings(savedSettings)
    }
  })

  // 切换设置
  const toggleSetting = (key: keyof PrivacySettings) => {
    const newSettings = { ...settings, [key]: !settings[key] }
    setSettings(newSettings)
    Taro.setStorageSync('privacy_settings', newSettings)
    showToast(newSettings[key] ? '已开启' : '已关闭', 'success')
  }

  // 清除所有数据
  const clearAllData = async () => {
    const confirmed = await showConfirm('清除数据', '确定要清除所有本地数据吗？此操作不可恢复。')
    if (confirmed) {
      // 清除所有存储
      Taro.clearStorage()
      showToast('数据已清除', 'success')
      // 重置设置
      setSettings({
        publicFavorites: false,
        publicBookings: true,
        allowSearch: true,
        showOnlineStatus: true,
        allowComment: true,
        allowDownload: false
      })
    }
  }

  // 返回
  const goBack = () => {
    Taro.navigateBack()
  }

  return (
    <View className='privacy-page'>
      {/* 导航栏 */}
      <View className='nav-bar'>
        <View className='back-btn' onClick={goBack}>
          <Text className='back-icon'>←</Text>
        </View>
        <Text className='nav-title'>隐私设置</Text>
        <View className='nav-placeholder' />
      </View>

      {/* 个人主页 */}
      <View className='settings-section'>
        <Text className='section-title'>个人主页</Text>
        
        <View className='setting-item'>
          <View className='setting-info'>
            <Text className='setting-name'>公开收藏</Text>
            <Text className='setting-desc'>其他用户可以看到你的心动画集</Text>
          </View>
          <Switch 
            checked={settings.publicFavorites} 
            onChange={() => toggleSetting('publicFavorites')}
            color='#ff6b6b'
          />
        </View>

        <View className='setting-item'>
          <View className='setting-info'>
            <Text className='setting-name'>公开预约</Text>
            <Text className='setting-desc'>其他用户可以看到你的预约记录</Text>
          </View>
          <Switch 
            checked={settings.publicBookings} 
            onChange={() => toggleSetting('publicBookings')}
            color='#ff6b6b'
          />
        </View>

        <View className='setting-item'>
          <View className='setting-info'>
            <Text className='setting-name'>允许搜索</Text>
            <Text className='setting-desc'>其他用户可以通过搜索找到你</Text>
          </View>
          <Switch 
            checked={settings.allowSearch} 
            onChange={() => toggleSetting('allowSearch')}
            color='#ff6b6b'
          />
        </View>

        <View className='setting-item'>
          <View className='setting-info'>
            <Text className='setting-name'>显示在线状态</Text>
            <Text className='setting-desc'>其他用户可以看到你是否在线</Text>
          </View>
          <Switch 
            checked={settings.showOnlineStatus} 
            onChange={() => toggleSetting('showOnlineStatus')}
            color='#ff6b6b'
          />
        </View>
      </View>

      {/* 作品相关 */}
      <View className='settings-section'>
        <Text className='section-title'>作品相关</Text>
        
        <View className='setting-item'>
          <View className='setting-info'>
            <Text className='setting-name'>允许评论</Text>
            <Text className='setting-desc'>允许其他用户评论你的作品</Text>
          </View>
          <Switch 
            checked={settings.allowComment} 
            onChange={() => toggleSetting('allowComment')}
            color='#ff6b6b'
          />
        </View>

        <View className='setting-item'>
          <View className='setting-info'>
            <Text className='setting-name'>允许下载</Text>
            <Text className='setting-desc'>允许其他用户下载你的作品</Text>
          </View>
          <Switch 
            checked={settings.allowDownload} 
            onChange={() => toggleSetting('allowDownload')}
            color='#ff6b6b'
          />
        </View>
      </View>

      {/* 数据管理 */}
      <View className='settings-section danger'>
        <Text className='section-title'>数据管理</Text>
        
        <View className='setting-item danger-item' onClick={clearAllData}>
          <View className='setting-info'>
            <Text className='setting-name danger-text'>清除所有数据</Text>
            <Text className='setting-desc'>清除所有本地存储的数据</Text>
          </View>
          <Text className='setting-arrow'>›</Text>
        </View>
      </View>

      {/* 隐私政策 */}
      <View className='privacy-policy'>
        <Text className='policy-text' onClick={() => showToast('隐私政策页面开发中', 'none')}>
          查看隐私政策 ›
        </Text>
      </View>
    </View>
  )
}
