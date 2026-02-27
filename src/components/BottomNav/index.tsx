import Taro from '@tarojs/taro'
import { View, Text } from '@tarojs/components'
import { useApp } from '../../hooks/useAppContext'
import './bottomNav.scss'

interface BottomNavProps {
  currentPage?: 'index' | 'works' | 'booking' | 'profile'
}

// 防止快速重复点击导航
let isNavigating = false

const safeNavigate = (url: string, useSwitchTab: boolean = false) => {
  if (isNavigating) return
  isNavigating = true
  
  try {
    if (useSwitchTab) {
      Taro.switchTab({ url })
    } else {
      Taro.navigateTo({ url })
    }
  } catch (e) {
    console.error('Navigation error:', e)
  } finally {
    setTimeout(() => {
      isNavigating = false
    }, 500) // 500ms 防止重复点击
  }
}

export default function BottomNav({ currentPage = 'index' }: BottomNavProps) {
  const { isPhotographerMode } = useApp()

  // 模特端只显示首页
  if (!isPhotographerMode) {
    return (
      <View className='bottom-nav'>
        <View 
          className={`nav-item ${currentPage === 'index' ? 'active' : ''}`}
          onClick={() => safeNavigate('/pages/index/index', true)}
        >
          <Text className='nav-icon'>
            {currentPage === 'index' ? '🏠' : '🏠'}
          </Text>
          <Text className='nav-text'>首页</Text>
        </View>
        <View 
          className={`nav-item ${currentPage === 'profile' ? 'active' : ''}`}
          onClick={() => safeNavigate('/pages/profile/index', true)}
        >
          <Text className='nav-icon'>👤</Text>
          <Text className='nav-text'>我的</Text>
        </View>
      </View>
    )
  }

  // 摄影师端显示完整导航
  return (
    <View className='bottom-nav'>
      <View 
        className={`nav-item ${currentPage === 'index' ? 'active' : ''}`}
        onClick={() => safeNavigate('/pages/index/index', true)}
      >
        <Text className='nav-icon'>🏠</Text>
        <Text className='nav-text'>首页</Text>
      </View>
      <View 
        className={`nav-item ${currentPage === 'works' ? 'active' : ''}`}
        onClick={() => safeNavigate('/pages/admin/index', true)}
      >
        <Text className='nav-icon'>📷</Text>
        <Text className='nav-text'>作品</Text>
      </View>
      <View 
        className={`nav-item ${currentPage === 'booking' ? 'active' : ''}`}
        onClick={() => safeNavigate('/pages/booking/index', true)}
      >
        <Text className='nav-icon'>📅</Text>
        <Text className='nav-text'>预约</Text>
      </View>
      <View 
        className={`nav-item ${currentPage === 'profile' ? 'active' : ''}`}
        onClick={() => safeNavigate('/pages/profile/index', true)}
      >
        <Text className='nav-icon'>👤</Text>
        <Text className='nav-text'>我的</Text>
      </View>
    </View>
  )
}
