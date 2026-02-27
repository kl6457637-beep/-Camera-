import { Component, PropsWithChildren } from 'react'
import Taro from '@tarojs/taro'
import './app.scss'
import { CLOUD_ENV_ID } from './config/cloud'
import { AppProvider } from './hooks/useAppContext'

class App extends Component<PropsWithChildren> {
  componentDidMount () {
    // 初始化云开发
    if (process.env.TARO_ENV === 'weapp') {
      Taro.cloud.init({
        env:'cloud1-7gvk6m425c2c3455'
      })
    }
    
    // 检查本地存储的收藏数据
    this.checkLocalFavorites()
  }

  componentDidShow () {}

  componentDidHide () {}

  componentDidCatchError () {}

  // 检查并初始化本地收藏
  checkLocalFavorites = () => {
    try {
      const favorites = Taro.getStorageSync('user_favorites')
      if (!favorites) {
        Taro.setStorageSync('user_favorites', [])
      }
    } catch (e) {
      console.error('初始化收藏数据失败', e)
    }
  }

  render () {
    return (
      <AppProvider>
        {this.props.children}
      </AppProvider>
    )
  }
}

export default App