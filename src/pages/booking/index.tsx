import Taro, { useDidShow } from '@tarojs/taro'
import { useState, useEffect } from 'react'
import { View, Image, Text, ScrollView } from '@tarojs/components'
import { useAppContext } from '../../hooks/useAppContext'
import { THEMES, PHOTO_STYLES, BOOKING_STATUS_LABELS, DEFAULT_PHOTOGRAPHER } from '../../constants'
import BottomNav from '../../components/BottomNav'
import './index.scss'

interface BookingData {
  type: string
  date: string
  time: string
  location: string
  style: string
  notes: string
  clientName: string
  clientPhone: string
}

export default function BookingPage() {
  const { bookings, addBooking, updateBooking, isPhotographerMode } = useAppContext()
  const [currentTab, setCurrentTab] = useState<'sent' | 'received'>('sent')
  const [statusFilter, setStatusFilter] = useState('all')
  const [loading, setLoading] = useState(true)

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
    setLoading(false)
  })

  // 筛选预约
  const filteredBookings = bookings.filter(booking => {
    if (statusFilter === 'all') return true
    return booking.status === statusFilter
  })

  // 根据Tab过滤显示的预约
  const displayedBookings = filteredBookings.filter(booking => {
    if (currentTab === 'sent') {
      // 我发出的：显示所有非取消的预约
      return booking.status !== 'cancelled'
    } else {
      // 我收到的：显示所有预约（摄影师模式）
      return isPhotographerMode || booking.status !== 'cancelled'
    }
  })

  // 创建预约
  const handleCreateBooking = (bookingData: BookingData) => {
    const newBooking = {
      id: 'BK' + Date.now(),
      clientId: 'user_' + Date.now(),
      photographerId: DEFAULT_PHOTOGRAPHER.id,
      photographerName: DEFAULT_PHOTOGRAPHER.name,
      photographerAvatar: DEFAULT_PHOTOGRAPHER.avatar,
      ...bookingData,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    addBooking(newBooking)
    Taro.showToast({ title: '预约成功', icon: 'success' })
  }

  // 更新预约状态
  const handleUpdateStatus = (bookingId: string, newStatus: string) => {
    const booking = bookings.find(b => b.id === bookingId)
    if (booking) {
      updateBooking({
        ...booking,
        status: newStatus,
        updatedAt: new Date().toISOString()
      })
      Taro.showToast({ title: '操作成功', icon: 'success' })
    }
  }

  return (
    <View className='booking-page'>
      <View className='page-header' style={{ background: currentThemeConfig.bg }}>
        <Text className='page-title'>预约中心</Text>
      </View>

      {/* Tab切换 */}
      <View className='tab-bar'>
        <View
          className={`tab-item ${currentTab === 'sent' ? 'active' : ''}`}
          onClick={() => setCurrentTab('sent')}
        >
          <Text className='tab-text' style={currentTab === 'sent' ? { color: currentThemeConfig.color } : {}}>我发出的</Text>
          <Text className='tab-badge' style={{ background: currentThemeConfig.color }}>{bookings.filter(b => b.status !== 'cancelled').length}</Text>
        </View>
        <View
          className={`tab-item ${currentTab === 'received' ? 'active' : ''}`}
          onClick={() => setCurrentTab('received')}
        >
          <Text className='tab-text' style={currentTab === 'received' ? { color: currentThemeConfig.color } : {}}>我收到的</Text>
        </View>
      </View>

      {/* 状态筛选 */}
      <ScrollView scrollX className='status-filter'>
        {['all', ...Object.keys(BOOKING_STATUS_LABELS)].map(status => (
          <View
            key={status}
            className={`status-tag ${statusFilter === status ? 'active' : ''}`}
            onClick={() => setStatusFilter(status)}
          >
            <Text
              className='status-text'
              style={statusFilter === status ? { color: 'white' } : {}}
            >
              {status === 'all' ? '全部' : BOOKING_STATUS_LABELS[status]?.text || status}
            </Text>
          </View>
        ))}
      </ScrollView>

      {/* 预约列表 */}
      <ScrollView className='booking-list'>
        {filteredBookings.length === 0 ? (
          <View className='empty-state'>
            <Text className='empty-icon'>📭</Text>
            <Text className='empty-text'>暂无预约</Text>
          </View>
        ) : (
          filteredBookings.map(booking => (
            <View key={booking.id} className='booking-card'>
              <View className='card-header'>
                <View className='user-info'>
                  <Image 
                    className='user-avatar' 
                    src={currentTab === 'sent' ? booking.photographerAvatar : ''} 
                    mode='aspectFill'
                  />
                  <View className='user-detail'>
                    <Text className='user-name'>
                      {currentTab === 'sent' ? booking.photographerName : booking.clientName}
                    </Text>
                    <Text className='user-role'>
                      {currentTab === 'sent' ? '摄影师' : '客户'}
                    </Text>
                  </View>
                </View>
                <View 
                  className='status-badge'
                  style={{
                    backgroundColor: BOOKING_STATUS_LABELS[booking.status]?.bgColor || '#f5f5f5',
                    color: BOOKING_STATUS_LABELS[booking.status]?.color || '#999'
                  }}
                >
                  <Text className='status-label'>
                    {BOOKING_STATUS_LABELS[booking.status]?.text || booking.status}
                  </Text>
                </View>
              </View>

              <View className='card-body'>
                <View className='info-row'>
                  <Text className='info-icon'>📅</Text>
                  <Text className='info-text'>{booking.date} {booking.time}</Text>
                </View>
                <View className='info-row'>
                  <Text className='info-icon'>🏷️</Text>
                  <Text className='info-text'>{booking.type}</Text>
                </View>
                {booking.location && (
                  <View className='info-row'>
                    <Text className='info-icon'>📍</Text>
                    <Text className='info-text'>{booking.location}</Text>
                  </View>
                )}
              </View>

              <View className='card-actions'>
                {currentTab === 'sent' && booking.status === 'pending' && (
                  <View
                    className='action-btn cancel'
                    onClick={() => handleUpdateStatus(booking.id, 'cancelled')}
                  >
                    <Text className='btn-text'>取消预约</Text>
                  </View>
                )}
                {currentTab === 'received' && booking.status === 'pending' && (
                  <>
                    <View
                      className='action-btn secondary'
                      onClick={() => Taro.showToast({ title: '沟通功能开发中', icon: 'none' })}
                    >
                      <Text className='btn-text'>沟通</Text>
                    </View>
                    <View
                      className='action-btn danger'
                      onClick={() => handleUpdateStatus(booking.id, 'cancelled')}
                    >
                      <Text className='btn-text'>婉拒</Text>
                    </View>
                    <View
                      className='action-btn primary'
                      onClick={() => handleUpdateStatus(booking.id, 'confirmed')}
                      style={{ background: currentThemeConfig.bg }}
                    >
                      <Text className='btn-text'>确认预约</Text>
                    </View>
                  </>
                )}
                {currentTab === 'received' && booking.status === 'confirmed' && (
                  <View
                    className='action-btn primary'
                    onClick={() => handleUpdateStatus(booking.id, 'shooting')}
                    style={{ background: currentThemeConfig.bg }}
                  >
                    <Text className='btn-text'>开始拍摄</Text>
                  </View>
                )}
                {currentTab === 'received' && booking.status === 'shooting' && (
                  <View
                    className='action-btn primary'
                    onClick={() => handleUpdateStatus(booking.id, 'review')}
                    style={{ background: currentThemeConfig.bg }}
                  >
                    <Text className='btn-text'>完成拍摄</Text>
                  </View>
                )}
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* 底部导航 */}
      <BottomNav currentPage='booking' />
    </View>
  )
}
