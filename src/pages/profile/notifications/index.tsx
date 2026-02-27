import Taro, { useDidShow } from '@tarojs/taro'
import { useState } from 'react'
import { View, Text, Switch } from '@tarojs/components'
import { showToast } from '../../../utils'
import './index.scss'

interface NotificationSettings {
  bookingRemind: boolean
  systemNotify: boolean
  newWorkNotify: boolean
  messageNotify: boolean
  emailNotify: boolean
  soundNotify: boolean
  vibrateNotify: boolean
}

export default function Notifications() {
  const [settings, setSettings] = useState<NotificationSettings>({
    bookingRemind: true,
    systemNotify: true,
    newWorkNotify: false,
    messageNotify: true,
    emailNotify: false,
    soundNotify: true,
    vibrateNotify: true
  })

  // 页面显示时加载设置
  useDidShow(() => {
    const savedSettings = Taro.getStorageSync('notification_settings')
    if (savedSettings) {
      setSettings(savedSettings)
    }
  })

  // 切换设置
  const toggleSetting = (key: keyof NotificationSettings) => {
    const newSettings = { ...settings, [key]: !settings[key] }
    setSettings(newSettings)
    Taro.setStorageSync('notification_settings', newSettings)
    showToast(newSettings[key] ? '已开启' : '已关闭', 'success')
  }

  // 返回
  const goBack = () => {
    Taro.navigateBack()
  }

  return (
    <View className='notifications-page'>
      {/* 导航栏 */}
      <View className='nav-bar'>
        <View className='back-btn' onClick={goBack}>
          <Text className='back-icon'>←</Text>
        </View>
        <Text className='nav-title'>消息通知</Text>
        <View className='nav-placeholder' />
      </View>

      {/* 预约相关 */}
      <View className='settings-section'>
        <Text className='section-title'>预约相关</Text>
        
        <View className='setting-item'>
          <View className='setting-info'>
            <Text className='setting-name'>预约提醒</Text>
            <Text className='setting-desc'>有新的预约或预约状态变更时通知我</Text>
          </View>
          <Switch 
            checked={settings.bookingRemind} 
            onChange={() => toggleSetting('bookingRemind')}
            color='#ff6b6b'
          />
        </View>

        <View className='setting-item'>
          <View className='setting-info'>
            <Text className='setting-name'>消息通知</Text>
            <Text className='setting-desc'>收到新消息时通知我</Text>
          </View>
          <Switch 
            checked={settings.messageNotify} 
            onChange={() => toggleSetting('messageNotify')}
            color='#ff6b6b'
          />
        </View>
      </View>

      {/* 内容相关 */}
      <View className='settings-section'>
        <Text className='section-title'>内容相关</Text>
        
        <View className='setting-item'>
          <View className='setting-info'>
            <Text className='setting-name'>新作品通知</Text>
            <Text className='setting-desc'>关注摄影师发布新作品时通知我</Text>
          </View>
          <Switch 
            checked={settings.newWorkNotify} 
            onChange={() => toggleSetting('newWorkNotify')}
            color='#ff6b6b'
          />
        </View>
      </View>

      {/* 系统通知 */}
      <View className='settings-section'>
        <Text className='section-title'>系统通知</Text>
        
        <View className='setting-item'>
          <View className='setting-info'>
            <Text className='setting-name'>系统消息</Text>
            <Text className='setting-desc'>接收系统公告、活动消息等</Text>
          </View>
          <Switch 
            checked={settings.systemNotify} 
            onChange={() => toggleSetting('systemNotify')}
            color='#ff6b6b'
          />
        </View>

        <View className='setting-item'>
          <View className='setting-info'>
            <Text className='setting-name'>邮件通知</Text>
            <Text className='setting-desc'>重要消息同时发送到邮箱</Text>
          </View>
          <Switch 
            checked={settings.emailNotify} 
            onChange={() => toggleSetting('emailNotify')}
            color='#ff6b6b'
          />
        </View>
      </View>

      {/* 提醒方式 */}
      <View className='settings-section'>
        <Text className='section-title'>提醒方式</Text>
        
        <View className='setting-item'>
          <View className='setting-info'>
            <Text className='setting-name'>声音提醒</Text>
            <Text className='setting-desc'>收到通知时播放提示音</Text>
          </View>
          <Switch 
            checked={settings.soundNotify} 
            onChange={() => toggleSetting('soundNotify')}
            color='#ff6b6b'
          />
        </View>

        <View className='setting-item'>
          <View className='setting-info'>
            <Text className='setting-name'>震动提醒</Text>
            <Text className='setting-desc'>收到通知时震动</Text>
          </View>
          <Switch 
            checked={settings.vibrateNotify} 
            onChange={() => toggleSetting('vibrateNotify')}
            color='#ff6b6b'
          />
        </View>
      </View>

      {/* 提示 */}
      <View className='tips-section'>
        <Text className='tips-text'>关闭通知可能会影响您的使用体验</Text>
      </View>
    </View>
  )
}
