import Taro, { useDidShow } from '@tarojs/taro'
import { useState, useEffect } from 'react'
import { View, Text, Image, ScrollView, Switch } from '@tarojs/components'
import { useAppContext } from '../../hooks/useAppContext'
import { showToast, showConfirm } from '../../utils'
import { THEMES } from '../../constants'
import BottomNav from '../../components/BottomNav'
import './index.scss'

// 用户资料类型
interface UserProfile {
  avatar: string
  nickname: string
  username: string
  bio: string
  phone: string
  gender: 'male' | 'female' | 'unknown'
  birthday: string
  location: string
}

// 消息通知设置
interface NotificationSettings {
  bookingRemind: boolean
  systemNotify: boolean
  newWorkNotify: boolean
  messageNotify: boolean
  emailNotify: boolean
}

// 隐私设置
interface PrivacySettings {
  publicFavorites: boolean
  publicBookings: boolean
  allowSearch: boolean
  showOnlineStatus: boolean
}

export default function Profile() {
  const { isPhotographerMode, togglePhotographerMode } = useAppContext()
  
  // 主题
  const [currentTheme, setCurrentTheme] = useState('default')
  
  // 用户资料
  const [profile, setProfile] = useState<UserProfile>({
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop&crop=face',
    nickname: '光影诗人',
    username: '@light_chaser',
    bio: '用镜头记录每一个动人瞬间',
    phone: '138****8888',
    gender: 'unknown',
    birthday: '1995-06-15',
    location: '上海'
  })
  
  // 消息通知
  const [notifications, setNotifications] = useState<NotificationSettings>({
    bookingRemind: true,
    systemNotify: true,
    newWorkNotify: false,
    messageNotify: true,
    emailNotify: false
  })
  
  // 隐私设置
  const [privacy, setPrivacy] = useState<PrivacySettings>({
    publicFavorites: false,
    publicBookings: true,
    allowSearch: true,
    showOnlineStatus: true
  })
  
  // 加载保存的设置
  useEffect(() => {
    loadSettings()
  }, [])
  
  const loadSettings = () => {
    try {
      const savedTheme = Taro.getStorageSync('app_theme') || 'default'
      setCurrentTheme(savedTheme)
      
      const savedProfile = Taro.getStorageSync('user_profile')
      if (savedProfile) {
        setProfile(prev => ({ ...prev, ...savedProfile }))
      }
      
      const savedNotifications = Taro.getStorageSync('notification_settings')
      if (savedNotifications) {
        setNotifications(savedNotifications)
      }
      
      const savedPrivacy = Taro.getStorageSync('privacy_settings')
      if (savedPrivacy) {
        setPrivacy(savedPrivacy)
      }
    } catch (e) {
      console.error('加载设置失败', e)
    }
  }
  
  // 更换头像
  const changeAvatar = () => {
    Taro.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePath = res.tempFilePaths[0]
        setProfile(prev => ({ ...prev, avatar: tempFilePath }))
        Taro.setStorageSync('user_profile', { ...profile, avatar: tempFilePath })
        showToast('头像更换成功', 'success')
      }
    })
  }
  
  // 编辑个人资料
  const editProfile = () => {
    Taro.navigateTo({ url: '/pages/profile/edit/index' })
  }
  
  // 切换主题
  const switchTheme = (themeId: string) => {
    setCurrentTheme(themeId)
    Taro.setStorageSync('app_theme', themeId)
    showToast(`已切换到${THEMES.find(t => t.id === themeId)?.name}`, 'success')
  }
  
  // 切换通知设置
  const toggleNotification = (key: keyof NotificationSettings) => {
    const newNotifications = { ...notifications, [key]: !notifications[key] }
    setNotifications(newNotifications)
    Taro.setStorageSync('notification_settings', newNotifications)
  }
  
  // 切换隐私设置
  const togglePrivacy = (key: keyof PrivacySettings) => {
    const newPrivacy = { ...privacy, [key]: !privacy[key] }
    setPrivacy(newPrivacy)
    Taro.setStorageSync('privacy_settings', newPrivacy)
  }
  
  // 进入消息通知页面
  const goToNotifications = () => {
    Taro.navigateTo({ 
      url: '/pages/profile/notifications/index',
      success: () => {
        // 传递当前设置
        Taro.setStorageSync('temp_notifications', notifications)
      }
    })
  }
  
  // 进入隐私设置页面
  const goToPrivacy = () => {
    Taro.navigateTo({ 
      url: '/pages/profile/privacy/index',
      success: () => {
        Taro.setStorageSync('temp_privacy', privacy)
      }
    })
  }
  
  // 进入帮助中心
  const goToHelp = () => {
    Taro.navigateTo({ url: '/pages/profile/help/index' })
  }
  
  // 退出登录
  const logout = async () => {
    const confirmed = await showConfirm('退出登录', '确定要退出登录吗？')
    if (confirmed) {
      // 清除登录状态
      Taro.removeStorageSync('user_info')
      showToast('已退出登录', 'success')
      setTimeout(() => {
        Taro.reLaunch({ url: '/pages/index/index' })
      }, 1500)
    }
  }
  
  const currentThemeConfig = THEMES.find(t => t.id === currentTheme) || THEMES[0]
  
  return (
    <View className='profile-page'>
      {/* 顶部个人信息 */}
      <View className='profile-header' style={{ background: currentThemeConfig.bg }}>
        <View className='header-content'>
          <View className='avatar-wrapper' onClick={changeAvatar}>
            <Image className='avatar' src={profile.avatar} mode='aspectFill' />
            <View className='avatar-edit'>
              <Text className='edit-icon'>📷</Text>
            </View>
          </View>
          <Text className='name'>{profile.nickname}</Text>
          <Text className='username'>{profile.username}</Text>
          <Text className='bio'>"{profile.bio}"</Text>
          <View className='edit-btn' onClick={editProfile}>
            <Text className='edit-text'>编辑资料</Text>
          </View>
        </View>
      </View>

      {/* 统计信息 */}
      <View className='stats-card'>
        <View className='stat-item'>
          <Text className='stat-num'>128</Text>
          <Text className='stat-label'>作品</Text>
        </View>
        <View className='stat-item'>
          <Text className='stat-num'>2.3k</Text>
          <Text className='stat-label'>获赞</Text>
        </View>
        <View className='stat-item'>
          <Text className='stat-num'>56</Text>
          <Text className='stat-label'>预约</Text>
        </View>
        <View className='stat-item'>
          <Text className='stat-num'>89</Text>
          <Text className='stat-label'>收藏</Text>
        </View>
      </View>

      {/* 摄影师模式开关 */}
      <View className='mode-card'>
        <View className='mode-info'>
          <Text className='mode-title'>📷 摄影师模式</Text>
          <Text className='mode-desc'>
            {isPhotographerMode ? '已开启，可接收预约' : '开启后可接收拍摄预约'}
          </Text>
        </View>
        <Switch 
          checked={isPhotographerMode} 
          onChange={togglePhotographerMode}
          color={currentThemeConfig.color}
        />
      </View>

      {/* 主题切换 */}
      <View className='settings-section'>
        <Text className='section-title'>主题风格</Text>
        <ScrollView scrollX className='theme-scroll' showScrollbar={false}>
          <View className='theme-list'>
            {THEMES.map(theme => (
              <View 
                key={theme.id}
                className={`theme-item ${currentTheme === theme.id ? 'active' : ''}`}
                onClick={() => switchTheme(theme.id)}
              >
                <View className='theme-preview' style={{ background: theme.bg }} />
                <Text className='theme-name'>{theme.name}</Text>
                {currentTheme === theme.id && (
                  <View className='theme-check'>✓</View>
                )}
              </View>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* 设置菜单 */}
      <View className='settings-section'>
        <Text className='section-title'>设置</Text>
        
        <View className='setting-item' onClick={editProfile}>
          <Text className='setting-icon'>👤</Text>
          <Text className='setting-text'>个人资料</Text>
          <Text className='setting-arrow'>›</Text>
        </View>
        
        <View className='setting-item' onClick={goToNotifications}>
          <Text className='setting-icon'>🔔</Text>
          <Text className='setting-text'>消息通知</Text>
          <View className='setting-status'>
            {notifications.bookingRemind && notifications.messageNotify ? (
              <Text className='status-on'>已开启</Text>
            ) : (
              <Text className='status-off'>部分关闭</Text>
            )}
            <Text className='setting-arrow'>›</Text>
          </View>
        </View>
        
        <View className='setting-item' onClick={goToPrivacy}>
          <Text className='setting-icon'>🔒</Text>
          <Text className='setting-text'>隐私设置</Text>
          <Text className='setting-arrow'>›</Text>
        </View>
        
        <View className='setting-item' onClick={goToHelp}>
          <Text className='setting-icon'>❓</Text>
          <Text className='setting-text'>帮助中心</Text>
          <Text className='setting-arrow'>›</Text>
        </View>
      </View>

      {/* 关于 */}
      <View className='settings-section'>
        <Text className='section-title'>关于</Text>
        
        <View className='setting-item'>
          <Text className='setting-icon'>📱</Text>
          <Text className='setting-text'>版本号</Text>
          <Text className='setting-value'>v1.0.0</Text>
        </View>
        
        <View className='setting-item' onClick={() => showToast('已是最新版本', 'success')}>
          <Text className='setting-icon'>🔄</Text>
          <Text className='setting-text'>检查更新</Text>
          <Text className='setting-arrow'>›</Text>
        </View>
      </View>

      {/* 退出登录 */}
      <View className='logout-section'>
        <View className='logout-btn' onClick={logout}>
          <Text className='logout-text'>退出登录</Text>
        </View>
      </View>

      {/* 底部导航 */}
      <BottomNav currentPage='profile' />
    </View>
  )
}
