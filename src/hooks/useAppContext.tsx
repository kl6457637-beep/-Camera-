import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import Taro from '@tarojs/taro'
import { DEFAULT_PHOTOGRAPHER } from '../constants'

// 用户类型
interface UserInfo {
  id: string
  name: string
  avatar: string
  isPhotographer: boolean
  photographerId?: string
}

// 作品类型
interface Work {
  id: string
  title: string
  description: string
  images: string[]
  style: string
  camera?: string
  lens?: string
  likes: number
  createdAt: string
}

// 预约类型
interface Booking {
  id: string
  photographerId: string
  photographerName: string
  photographerAvatar: string
  clientId: string
  clientName: string
  clientPhone: string
  type: string
  date: string
  time: string
  location: string
  style: string
  notes: string
  status: string
  createdAt: string
  updatedAt: string
}

// 存储键类型
interface StorageKeys {
  FAVORITES: string
  USER_INFO: string
  INTENT_SENT: string
  PHOTOGRAPHER_MODE: string
}

// 存储键常量
const STORAGE_KEYS: StorageKeys = {
  FAVORITES: 'user_favorites',
  USER_INFO: 'user_info',
  INTENT_SENT: 'intent_sent',
  PHOTOGRAPHER_MODE: 'photographer_mode'
}

// 全局状态类型
interface AppState {
  userInfo: UserInfo | null
  isLoggedIn: boolean
  isPhotographerMode: boolean
  photographer: typeof DEFAULT_PHOTOGRAPHER
  works: Work[]
  bookings: Booking[]
  favorites: string[]
  loading: boolean
}

// Context类型
interface AppContextType extends AppState {
  login: (userInfo: UserInfo) => void
  logout: () => void
  togglePhotographerMode: () => void
  setWorks: (works: Work[]) => void
  addWork: (work: Work) => void
  updateWork: (work: Work) => void
  deleteWork: (id: string) => void
  setBookings: (bookings: Booking[]) => void
  addBooking: (booking: Booking) => void
  updateBooking: (booking: Booking) => void
  toggleFavorite: (workId: string) => void
  isFavorited: (workId: string) => boolean
}

// 初始状态
const initialState: AppState = {
  userInfo: null,
  isLoggedIn: false,
  isPhotographerMode: false,
  photographer: DEFAULT_PHOTOGRAPHER,
  works: [],
  bookings: [],
  favorites: [],
  loading: false
}

// 创建Context
const AppContext = createContext<AppContextType | undefined>(undefined)

// Provider组件
export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>(initialState)

  // 初始化：从本地存储读取数据
  useEffect(() => {
    const initData = async () => {
      try {
        // 读取用户登录状态
        const userInfo = Taro.getStorageSync(STORAGE_KEYS.USER_INFO)
        const photographerModeStr = Taro.getStorageSync(STORAGE_KEYS.PHOTOGRAPHER_MODE)
        const isPhotographerMode = photographerModeStr === true || photographerModeStr === 'true'
        const favorites = Taro.getStorageSync(STORAGE_KEYS.FAVORITES) || []

        setState(prev => ({
          ...prev,
          userInfo: userInfo || null,
          isLoggedIn: !!userInfo,
          isPhotographerMode,
          favorites
        }))

        // 加载作品数据
        await loadWorks()
        await loadBookings()
      } catch (error) {
        console.error('初始化数据失败:', error)
      }
    }

    initData()
  }, [])

  // 加载作品
  const loadWorks = async () => {
    try {
      const res = await Taro.cloud.callFunction({
        name: 'getWorks',
        data: { photographerId: 'default' }
      }) as any
      
      if (res.result && res.result.success && Array.isArray(res.result.data)) {
        setState(prev => ({ ...prev, works: res.result.data }))
      }
    } catch (error) {
      console.error('加载作品失败:', error)
      setState(prev => ({ ...prev, works: getDefaultWorks() }))
    }
  }

  // 加载预约
  const loadBookings = async () => {
    try {
      const res = await Taro.cloud.callFunction({
        name: 'getBookings',
        data: {}
      }) as any
      
      if (res.result && res.result.success && Array.isArray(res.result.data)) {
        setState(prev => ({ ...prev, bookings: res.result.data }))
      }
    } catch (error) {
      console.error('加载预约失败:', error)
      setState(prev => ({ ...prev, bookings: getDefaultBookings() }))
    }
  }

  // 登录
  const login = useCallback((userInfo: UserInfo) => {
    setState(prev => ({
      ...prev,
      userInfo,
      isLoggedIn: true
    }))
    Taro.setStorageSync(STORAGE_KEYS.USER_INFO, userInfo)
  }, [])

  // 登出
  const logout = useCallback(() => {
    setState(prev => ({
      ...prev,
      userInfo: null,
      isLoggedIn: false
    }))
    Taro.removeStorageSync(STORAGE_KEYS.USER_INFO)
  }, [])

  // 切换摄影师模式
  const togglePhotographerMode = useCallback(() => {
    setState(prev => {
      const newMode = !prev.isPhotographerMode
      Taro.setStorageSync(STORAGE_KEYS.PHOTOGRAPHER_MODE, newMode)
      return { ...prev, isPhotographerMode: newMode }
    })
  }, [])

  // 设置作品
  const setWorks = useCallback((works: Work[]) => {
    setState(prev => ({ ...prev, works }))
  }, [])

  // 添加作品
  const addWork = useCallback((work: Work) => {
    setState(prev => ({
      ...prev,
      works: [work, ...prev.works]
    }))
  }, [])

  // 更新作品
  const updateWork = useCallback((work: Work) => {
    setState(prev => ({
      ...prev,
      works: prev.works.map(w => w.id === work.id ? work : w)
    }))
  }, [])

  // 删除作品
  const deleteWork = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      works: prev.works.filter(w => w.id !== id)
    }))
  }, [])

  // 设置预约
  const setBookings = useCallback((bookings: Booking[]) => {
    setState(prev => ({ ...prev, bookings }))
  }, [])

  // 添加预约
  const addBooking = useCallback((booking: Booking) => {
    setState(prev => ({
      ...prev,
      bookings: [booking, ...prev.bookings]
    }))
  }, [])

  // 更新预约
  const updateBooking = useCallback((booking: Booking) => {
    setState(prev => ({
      ...prev,
      bookings: prev.bookings.map(b => b.id === booking.id ? booking : b)
    }))
  }, [])

  // 切换收藏
  const toggleFavorite = useCallback((workId: string) => {
    setState(prev => {
      const isFav = prev.favorites.includes(workId)
      const newFavorites = isFav
        ? prev.favorites.filter(id => id !== workId)
        : [...prev.favorites, workId]
      
      Taro.setStorageSync(STORAGE_KEYS.FAVORITES, newFavorites)
      
      return {
        ...prev,
        favorites: newFavorites
      }
    })
  }, [])

  // 检查是否已收藏
  const isFavorited = useCallback((workId: string) => {
    return state.favorites.includes(workId)
  }, [state.favorites])

  const value: AppContextType = {
    ...state,
    login,
    logout,
    togglePhotographerMode,
    setWorks,
    addWork,
    updateWork,
    deleteWork,
    setBookings,
    addBooking,
    updateBooking,
    toggleFavorite,
    isFavorited
  }

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  )
}

// Hook - 正确的导出名称
export const useApp = () => {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}

// 兼容旧名称
export const useAppContext = useApp

// 默认作品数据
const getDefaultWorks = (): Work[] => [
  {
    id: '1',
    title: '晨光少女',
    description: '自然光下的温柔时刻',
    images: ['https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=600&h=600&fit=crop&crop=face'],
    style: '清新',
    camera: 'Canon EOS R5',
    lens: 'RF 85mm f/1.2L',
    likes: 234,
    createdAt: '2024-01-15'
  },
  {
    id: '2',
    title: '复古时光',
    description: '老上海风情人像',
    images: ['https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&h=600&fit=crop&crop=face'],
    style: '复古',
    camera: 'Sony A7M4',
    lens: 'FE 50mm f/1.2',
    likes: 189,
    createdAt: '2024-01-14'
  },
  {
    id: '3',
    title: '窗边思绪',
    description: '午后窗边的静谧时刻',
    images: ['https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&h=600&fit=crop&crop=face'],
    style: '情绪',
    camera: 'Fujifilm XT-4',
    lens: 'XF 56mm f/1.2',
    likes: 156,
    createdAt: '2024-01-13'
  },
  {
    id: '4',
    title: '温柔午后',
    description: '阳光洒落的温柔瞬间',
    images: ['https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&h=600&fit=crop&crop=face'],
    style: '清新',
    camera: 'Canon EOS R6',
    lens: 'RF 50mm f/1.8',
    likes: 312,
    createdAt: '2024-01-12'
  },
  {
    id: '5',
    title: '都市丽影',
    description: '都市街头时尚人像',
    images: ['https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600&h=600&fit=crop&crop=face'],
    style: '时尚',
    camera: 'Nikon Z6 II',
    lens: 'Z 85mm f/1.8',
    likes: 278,
    createdAt: '2024-01-11'
  },
  {
    id: '6',
    title: '街头漫步',
    description: '城市街头的自然瞬间',
    images: ['https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=600&h=600&fit=crop&crop=face'],
    style: '街拍',
    camera: 'Leica Q2',
    lens: 'Summilux 28mm',
    likes: 145,
    createdAt: '2024-01-10'
  },
  {
    id: '7',
    title: '优雅时刻',
    description: '职场女性的自信风采',
    images: ['https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=600&h=600&fit=crop&crop=face'],
    style: '职业',
    camera: 'Canon EOS R5',
    lens: 'RF 24-70mm f/2.8',
    likes: 201,
    createdAt: '2024-01-09'
  },
  {
    id: '8',
    title: '纯真笑容',
    description: '最自然的笑容捕捉',
    images: ['https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=600&h=600&fit=crop&crop=face'],
    style: '清新',
    camera: 'Sony A7C',
    lens: 'FE 35mm f/1.8',
    likes: 167,
    createdAt: '2024-01-08'
  },
  {
    id: '9',
    title: '古典韵味',
    description: '汉服人像的古风之美',
    images: ['https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&h=600&fit=crop&crop=face'],
    style: '古风',
    camera: 'Canon EOS R6',
    lens: 'RF 85mm f/1.2L',
    likes: 423,
    createdAt: '2024-01-07'
  }
]

// 默认预约数据
const getDefaultBookings = (): Booking[] => [
  {
    id: 'BK001',
    photographerId: 'default',
    photographerName: '光影诗人',
    photographerAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face',
    clientId: 'user1',
    clientName: '小雨',
    clientPhone: '138****8888',
    type: '个人写真',
    date: '2024-02-15',
    time: '下午',
    location: '上海法租界',
    style: '复古胶片',
    notes: '喜欢复古胶片风格，希望能有阳光的时候拍摄',
    status: 'pending',
    createdAt: '2024-02-10T14:30:00',
    updatedAt: '2024-02-10T14:30:00'
  },
  {
    id: 'BK002',
    photographerId: 'default',
    photographerName: '光影诗人',
    photographerAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face',
    clientId: 'user2',
    clientName: '晓晓',
    clientPhone: '139****6666',
    type: '情侣照',
    date: '2024-02-18',
    time: '上午',
    location: '外滩',
    style: '日系清新',
    notes: '情侣写真，希望能自然一些',
    status: 'confirmed',
    createdAt: '2024-02-08T10:00:00',
    updatedAt: '2024-02-09T09:30:00'
  }
]
