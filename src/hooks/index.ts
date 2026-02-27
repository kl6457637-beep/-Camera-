import { useState, useEffect, useCallback } from 'react'
import Taro from '@tarojs/taro'
import { getLocalFavorites, isFavorited as checkIsFavorited } from '../utils'

/**
 * 收藏状态管理 Hook
 */
export const useFavorites = () => {
  const [favorites, setFavorites] = useState<LocalFavorite[]>([])
  const [loading, setLoading] = useState(false)

  // 刷新收藏列表
  const refresh = useCallback(() => {
    setLoading(true)
    const data = getLocalFavorites()
    setFavorites(data)
    setLoading(false)
  }, [])

  // 检查是否已收藏
  const checkFavorite = useCallback((photoId: string) => {
    return checkIsFavorited(photoId)
  }, [])

  // 初始加载
  useEffect(() => {
    refresh()
  }, [refresh])

  return {
    favorites,
    loading,
    refresh,
    checkFavorite,
    count: favorites.length
  }
}

/**
 * 系统信息 Hook
 */
export const useSystemInfo = () => {
  const [systemInfo, setSystemInfo] = useState({
    windowWidth: 375,
    windowHeight: 667,
    statusBarHeight: 20,
    safeAreaBottom: 0
  })

  useEffect(() => {
    const info = Taro.getSystemInfoSync()
    setSystemInfo({
      windowWidth: info.windowWidth,
      windowHeight: info.windowHeight,
      statusBarHeight: info.statusBarHeight || 20,
      safeAreaBottom: info.safeArea ? (info.screenHeight - info.safeArea.bottom) : 0
    })
  }, [])

  return systemInfo
}

/**
 * 图片加载状态 Hook
 */
export const useImageLoader = () => {
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set())
  const [loadingImages, setLoadingImages] = useState<Set<string>>(new Set())

  const onLoadStart = useCallback((url: string) => {
    setLoadingImages(prev => new Set(prev).add(url))
  }, [])

  const onLoadComplete = useCallback((url: string) => {
    setLoadingImages(prev => {
      const next = new Set(prev)
      next.delete(url)
      return next
    })
    setLoadedImages(prev => new Set(prev).add(url))
  }, [])

  const onLoadError = useCallback((url: string) => {
    setLoadingImages(prev => {
      const next = new Set(prev)
      next.delete(url)
      return next
    })
  }, [])

  const isLoading = useCallback((url: string) => loadingImages.has(url), [loadingImages])
  const isLoaded = useCallback((url: string) => loadedImages.has(url), [loadedImages])

  return {
    isLoading,
    isLoaded,
    onLoadStart,
    onLoadComplete,
    onLoadError
  }
}

/**
 * 分页加载 Hook
 */
export const usePagination = <T,>(
  fetchFn: (page: number, pageSize: number) => Promise<T[]>,
  pageSize: number = 10
) => {
  const [data, setData] = useState<T[]>([])
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return

    setLoading(true)
    setError(null)

    try {
      const newData = await fetchFn(page, pageSize)
      
      if (newData.length < pageSize) {
        setHasMore(false)
      }
      
      setData(prev => page === 1 ? newData : [...prev, ...newData])
      setPage(prev => prev + 1)
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载失败')
    } finally {
      setLoading(false)
    }
  }, [fetchFn, page, pageSize, loading, hasMore])

  const refresh = useCallback(async () => {
    setPage(1)
    setHasMore(true)
    setData([])
    await loadMore()
  }, [loadMore])

  const reset = useCallback(() => {
    setData([])
    setPage(1)
    setHasMore(true)
    setError(null)
  }, [])

  return {
    data,
    loading,
    hasMore,
    error,
    loadMore,
    refresh,
    reset
  }
}