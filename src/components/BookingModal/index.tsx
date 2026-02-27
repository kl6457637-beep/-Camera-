import React, { useState, useEffect } from 'react'
import Taro from '@tarojs/taro'
import { View, Text, Image, Input, Textarea, Picker, ScrollView } from '@tarojs/components'
import Modal from '../Modal'
import { DEFAULT_PHOTOGRAPHER, SHOOTING_GUIDE } from '../../constants'
import './bookingModal.scss'

interface WorkItem {
  id: string
  title: string
  images: string[]
  style: string
}

interface BookingModalProps {
  visible: boolean
  onClose: () => void
  onSubmit: (data: BookingData) => void
  initialWorkId?: string // 从某个作品进入时传入
}

export interface BookingData {
  type: string
  date: string
  time: string
  location: string
  style: string
  notes: string
  phone: string
  selectedWorks: string[] // 选中的作品集
}

const BOOKING_TYPES = [
  '个人写真',
  '情侣照',
  '毕业照',
  '闺蜜照',
  '亲子照',
  '商业拍摄',
  '其他'
]

const TIME_SLOTS = [
  { value: 'morning', label: '上午 (9:00-12:00)' },
  { value: 'afternoon', label: '下午 (14:00-17:00)' },
  { value: 'evening', label: '傍晚 (17:00-19:00)' },
  { value: 'night', label: '晚上 (19:00-21:00)' }
]

// 意向筛选类型
const INTENT_FILTERS = [
  { id: 'all', name: '所有作品' },
  { id: 'favorites', name: '心动的作品' }
]

export default function BookingModal({
  visible,
  onClose,
  onSubmit,
  initialWorkId
}: BookingModalProps) {
  const [bookingType, setBookingType] = useState('')
  const [date, setDate] = useState('')
  const [timeSlot, setTimeSlot] = useState('')
  const [location, setLocation] = useState('')
  const [style, setStyle] = useState('')
  const [notes, setNotes] = useState('')
  const [phone, setPhone] = useState('')
  
  // 拍摄意向相关
  const [intentFilter, setIntentFilter] = useState('all') // 'all' | 'favorites'
  const [works, setWorks] = useState<WorkItem[]>([])
  const [favorites, setFavorites] = useState<string[]>([])
  const [selectedWorks, setSelectedWorks] = useState<string[]>([])
  const [showWorksSelector, setShowWorksSelector] = useState(false)

  // 加载作品和收藏数据
  useEffect(() => {
    if (visible) {
      loadWorksAndFavorites()
    }
  }, [visible])

  // 当初始作品ID变化时，设置选中
  useEffect(() => {
    if (initialWorkId && visible) {
      setSelectedWorks([initialWorkId])
    }
  }, [initialWorkId, visible])

  const loadWorksAndFavorites = () => {
    try {
      // 加载所有作品
      const defaultWorks = getDefaultWorks()
      setWorks(defaultWorks)
      
      // 加载收藏
      const favs = Taro.getStorageSync('user_favorites') || []
      setFavorites(favs)
    } catch (e) {
      console.error('加载数据失败', e)
    }
  }

  // 获取默认作品数据
  const getDefaultWorks = (): WorkItem[] => [
    { id: '1', title: '晨光少女', images: ['https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=200'], style: '清新' },
    { id: '2', title: '复古时光', images: ['https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200'], style: '复古' },
    { id: '3', title: '窗边思绪', images: ['https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200'], style: '情绪' },
    { id: '4', title: '温柔午后', images: ['https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200'], style: '清新' },
    { id: '5', title: '都市丽影', images: ['https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200'], style: '时尚' },
    { id: '6', title: '街头漫步', images: ['https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=200'], style: '街拍' }
  ]

  // 根据筛选条件获取作品
  const getFilteredWorks = () => {
    if (intentFilter === 'favorites') {
      return works.filter(w => favorites.includes(w.id))
    }
    return works
  }

  // 切换作品选中状态
  const toggleWorkSelection = (workId: string) => {
    setSelectedWorks(prev => {
      if (prev.includes(workId)) {
        return prev.filter(id => id !== workId)
      } else {
        return [...prev, workId]
      }
    })
  }

  // 获取选中的作品名称
  const getSelectedWorksNames = () => {
    return selectedWorks
      .map(id => works.find(w => w.id === id)?.title)
      .filter(Boolean)
      .join('、')
  }

  const handleSubmit = () => {
    if (selectedWorks.length === 0) {
      Taro.showToast({ title: '请选择拍摄意向', icon: 'none' })
      return
    }
    if (!bookingType) {
      Taro.showToast({ title: '请选择拍摄类型', icon: 'none' })
      return
    }
    if (!date || !timeSlot) {
      Taro.showToast({ title: '请选择拍摄时间', icon: 'none' })
      return
    }
    if (!phone) {
      Taro.showToast({ title: '请输入联系电话', icon: 'none' })
      return
    }

    const data: BookingData = {
      type: bookingType,
      date,
      time: TIME_SLOTS.find(t => t.value === timeSlot)?.label || '',
      location,
      style,
      notes,
      phone,
      selectedWorks
    }

    onSubmit(data)
    resetForm()
  }

  const resetForm = () => {
    setBookingType('')
    setDate('')
    setTimeSlot('')
    setLocation('')
    setStyle('')
    setNotes('')
    setPhone('')
    setSelectedWorks([])
    setIntentFilter('all')
    setShowWorksSelector(false)
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const getMinDate = () => {
    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth() + 1
    const day = now.getDate()
    return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`
  }

  return (
    <Modal
      visible={visible}
      onClose={handleClose}
      title='发起预约'
      footer={
        <View className='modal-btn primary' onClick={handleSubmit}>
          <Text className='btn-text'>发送预约</Text>
        </View>
      }
    >
      {/* 摄影师信息 */}
      <View className='photographer-preview'>
        <Image
          className='preview-avatar'
          src={DEFAULT_PHOTOGRAPHER.avatar}
          mode='aspectFill'
        />
        <View className='preview-info'>
          <Text className='preview-name'>{DEFAULT_PHOTOGRAPHER.name}</Text>
          <Text className='preview-style'>
            擅长：复古胶片、日系清新
          </Text>
        </View>
      </View>

      {/* 拍摄意向 */}
      <View className='form-group'>
        <Text className='form-label'>
          拍摄意向 <Text className='required'>*</Text>
        </Text>
        
        {/* 意向筛选 */}
        <View className='intent-filter'>
          {INTENT_FILTERS.map(filter => (
            <View
              key={filter.id}
              className={`filter-option ${intentFilter === filter.id ? 'selected' : ''}`}
              onClick={() => setIntentFilter(filter.id)}
            >
              <Text className='filter-text'>{filter.name}</Text>
            </View>
          ))}
        </View>

        {/* 已选作品集展示 */}
        <View className='selected-works-box' onClick={() => setShowWorksSelector(!showWorksSelector)}>
          <View className='selected-works-header'>
            <Text className='selected-label'>
              {selectedWorks.length > 0 ? `已选 ${selectedWorks.length} 个作品` : '点击选择作品'}
            </Text>
            <Text className='selected-arrow'>{showWorksSelector ? '▲' : '▼'}</Text>
          </View>
          {selectedWorks.length > 0 && (
            <Text className='selected-names'>{getSelectedWorksNames()}</Text>
          )}
        </View>

        {/* 作品选择器 */}
        {showWorksSelector && (
          <View className='works-selector'>
            <ScrollView scrollY className='works-scroll'>
              {getFilteredWorks().map(work => (
                <View
                  key={work.id}
                  className={`work-item ${selectedWorks.includes(work.id) ? 'selected' : ''}`}
                  onClick={() => toggleWorkSelection(work.id)}
                >
                  <Image className='work-thumb' src={work.images[0]} mode='aspectFill' />
                  <View className='work-info'>
                    <Text className='work-title'>{work.title}</Text>
                    <Text className='work-style'>#{work.style}</Text>
                  </View>
                  <View className='work-check'>
                    {selectedWorks.includes(work.id) && <Text className='check-icon'>✓</Text>}
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        )}
      </View>

      {/* 拍摄类型 */}
      <View className='form-group'>
        <Text className='form-label'>
          拍摄类型 <Text className='required'>*</Text>
        </Text>
        <View className='type-options'>
          {BOOKING_TYPES.map(type => (
            <View
              key={type}
              className={`type-option ${bookingType === type ? 'selected' : ''}`}
              onClick={() => setBookingType(type)}
            >
              <Text className='type-text'>{type}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* 期望拍摄时间 */}
      <View className='form-group'>
        <Text className='form-label'>
          期望拍摄时间 <Text className='required'>*</Text>
        </Text>
        <View className='date-time-picker'>
          <View className='date-input'>
            <Text className='input-label'>日期</Text>
            <Picker
              mode='date'
              value={date}
              start={getMinDate()}
              onChange={(e) => setDate(e.detail.value)}
            >
              <View className='picker-trigger'>
                <Text className={date ? 'picker-value' : 'picker-placeholder'}>
                  {date || '选择日期'}
                </Text>
                <Text className='picker-arrow'>▼</Text>
              </View>
            </Picker>
          </View>
          <View className='time-input'>
            <Text className='input-label'>时段</Text>
            <Picker
              mode='selector'
              range={TIME_SLOTS}
              rangeKey='label'
              value={TIME_SLOTS.findIndex(t => t.value === timeSlot)}
              onChange={(e: any) => {
                const index = parseInt(e.detail.value, 10)
                if (TIME_SLOTS[index]) {
                  setTimeSlot(TIME_SLOTS[index].value)
                }
              }}
            >
              <View className='picker-trigger'>
                <Text className={timeSlot ? 'picker-value' : 'picker-placeholder'}>
                  {TIME_SLOTS.find(t => t.value === timeSlot)?.label || '选择时段'}
                </Text>
                <Text className='picker-arrow'>▼</Text>
              </View>
            </Picker>
          </View>
        </View>
      </View>

      {/* 拍摄地点 */}
      <View className='form-group'>
        <Text className='form-label'>
          拍摄地点 <Text className='hint'>（可选）</Text>
        </Text>
        <Input
          className='form-input'
          value={location}
          onInput={(e: any) => setLocation(e.detail.value)}
          placeholder='例如：上海法租界、外滩'
        />
      </View>

      {/* 期望风格 */}
      <View className='form-group'>
        <Text className='form-label'>
          期望风格 <Text className='hint'>（可选）</Text>
        </Text>
        <Input
          className='form-input'
          value={style}
          onInput={(e: any) => setStyle(e.detail.value)}
          placeholder='例如：复古胶片、自然光'
        />
      </View>

      {/* 备注说明 */}
      <View className='form-group'>
        <Text className='form-label'>
          备注说明 <Text className='hint'>（可选）</Text>
        </Text>
        <Textarea
          className='form-textarea'
          value={notes}
          onInput={(e: any) => setNotes(e.detail.value)}
          placeholder='描述你的拍摄需求、期望效果、特殊要求等...'
          maxlength={200}
        />
      </View>

      {/* 联系电话 */}
      <View className='form-group'>
        <Text className='form-label'>
          联系电话 <Text className='required'>*</Text>
        </Text>
        <Input
          className='form-input'
          type='number'
          value={phone}
          onInput={(e: any) => setPhone(e.detail.value)}
          placeholder='请输入你的手机号码'
          maxlength={11}
        />
      </View>

      {/* 约拍流程说明 */}
      <View className='form-group'>
        <Text className='form-label'>约拍流程说明</Text>
        <View className='guide-section'>
          {Object.entries(SHOOTING_GUIDE).map(([key, section]) => (
            <View key={key} className='guide-item'>
              <Text className='guide-title'>{section.title}</Text>
              {section.items.map((item, index) => (
                <View key={index} className='guide-content'>
                  <Text className='guide-label'>• {item.label}：</Text>
                  <Text className='guide-text'>{item.content}</Text>
                </View>
              ))}
            </View>
          ))}
        </View>
      </View>
    </Modal>
  )
}
