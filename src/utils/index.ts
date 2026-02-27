import Taro from '@tarojs/taro'

/**
 * 获取本地收藏列表
 */
export const getLocalFavorites = (): LocalFavorite[] => {
  try {
    return Taro.getStorageSync('user_favorites') || []
  } catch (e) {
    console.error('获取收藏失败', e)
    return []
  }
}

/**
 * 添加收藏
 */
export const addFavorite = (photo: Photo, styleName: string): boolean => {
  try {
    const favorites = getLocalFavorites()
    const exists = favorites.some(f => f.photoId === photo._id)
    
    if (exists) return false
    
    favorites.push({
      photoId: photo._id,
      photoUrl: photo.thumbUrl || photo.url,
      styleId: photo.styleId,
      styleName,
      addedAt: Date.now()
    })
    
    Taro.setStorageSync('user_favorites', favorites)
    return true
  } catch (e) {
    console.error('添加收藏失败', e)
    return false
  }
}

/**
 * 取消收藏
 */
export const removeFavorite = (photoId: string): boolean => {
  try {
    const favorites = getLocalFavorites()
    const filtered = favorites.filter(f => f.photoId !== photoId)
    Taro.setStorageSync('user_favorites', filtered)
    return true
  } catch (e) {
    console.error('取消收藏失败', e)
    return false
  }
}

/**
 * 检查是否已收藏
 */
export const isFavorited = (photoId: string): boolean => {
  const favorites = getLocalFavorites()
  return favorites.some(f => f.photoId === photoId)
}

/**
 * 清空所有收藏
 */
export const clearFavorites = (): boolean => {
  try {
    Taro.setStorageSync('user_favorites', [])
    return true
  } catch (e) {
    console.error('清空收藏失败', e)
    return false
  }
}

/**
 * 获取收藏统计
 */
export const getFavoriteStats = () => {
  const favorites = getLocalFavorites()
  const styleCount: Record<string, number> = {}
  
  favorites.forEach(f => {
    styleCount[f.styleName] = (styleCount[f.styleName] || 0) + 1
  })
  
  return {
    total: favorites.length,
    byStyle: styleCount
  }
}

/**
 * 显示提示
 */
export const showToast = (title: string, icon: 'success' | 'none' | 'error' = 'none') => {
  Taro.showToast({
    title,
    icon,
    duration: 2000
  })
}

/**
 * 显示确认对话框
 */
export const showConfirm = (title: string, content: string): Promise<boolean> => {
  return new Promise((resolve) => {
    Taro.showModal({
      title,
      content,
      showCancel: true,
      success: (res) => {
        resolve(res.confirm)
      }
    })
  })
}

/**
 * 复制到剪贴板
 */
export const copyToClipboard = (data: string): Promise<boolean> => {
  return new Promise((resolve) => {
    Taro.setClipboardData({
      data,
      success: () => {
        showToast('已复制到剪贴板', 'success')
        resolve(true)
      },
      fail: () => {
        showToast('复制失败', 'error')
        resolve(false)
      }
    })
  })
}

/**
 * 格式化日期
 */
export const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp)
  return `${date.getMonth() + 1}月${date.getDate()}日`
}

/**
 * 节流函数
 */
export const throttle = <T extends (...args: any[]) => void>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let lastTime = 0
  return (...args: Parameters<T>) => {
    const now = Date.now()
    if (now - lastTime >= delay) {
      func(...args)
      lastTime = now
    }
  }
}

/**
 * 防抖函数
 */
export const debounce = <T extends (...args: any[]) => void>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timer: ReturnType<typeof setTimeout> | null = null
  return (...args: Parameters<T>) => {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      func(...args)
    }, delay)
  }
}