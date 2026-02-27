import Taro from '@tarojs/taro'
import { useState } from 'react'
import { View, Text, Image, Input, Textarea, ScrollView } from '@tarojs/components'
import { PHOTO_STYLES } from '../../../constants'
import './index.scss'

export default function CreateWork() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [selectedStyles, setSelectedStyles] = useState<string[]>([])
  const [camera, setCamera] = useState('')
  const [lens, setLens] = useState('')

  // 切换风格选择
  const toggleStyle = (styleId: string) => {
    if (selectedStyles.includes(styleId)) {
      setSelectedStyles(selectedStyles.filter(id => id !== styleId))
    } else {
      setSelectedStyles([...selectedStyles, styleId])
    }
  }

  // 选择图片
  const handleChooseImage = () => {
    Taro.chooseImage({
      count: 9,
      success: (res) => {
        Taro.showToast({ title: `已选择 ${res.tempFilePaths.length} 张图片`, icon: 'success' })
      }
    })
  }

  // 发布作品
  const handlePublish = () => {
    if (!title.trim()) {
      Taro.showToast({ title: '请输入作品标题', icon: 'none' })
      return
    }

    Taro.showLoading({ title: '发布中...' })
    
    // 模拟发布
    setTimeout(() => {
      Taro.hideLoading()
      Taro.showToast({ title: '发布成功', icon: 'success' })
      
      // 返回上一页
      setTimeout(() => {
        Taro.navigateBack()
      }, 1500)
    }, 1000)
  }

  return (
    <View className='create-work-page'>
      <View className='page-header'>
        <Text className='page-title'>上传作品</Text>
      </View>

      <ScrollView className='content' scrollY>
        {/* 图片上传 */}
        <View className='section'>
          <View className='section-title'>作品图片 <Text className='required'>*</Text></View>
          <View className='image-grid'>
            <View className='add-image' onClick={handleChooseImage}>
              <Text className='add-icon'>+</Text>
              <Text className='add-text'>添加图片</Text>
            </View>
          </View>
        </View>

        {/* 作品标题 */}
        <View className='section'>
          <View className='section-title'>作品标题 <Text className='required'>*</Text></View>
          <Input
            className='title-input'
            placeholder='给你的作品起个名字'
            value={title}
            onInput={(e) => setTitle(e.detail.value)}
          />
        </View>

        {/* 风格标签 */}
        <View className='section'>
          <View className='section-title'>风格标签</View>
          <View className='style-tags'>
            {PHOTO_STYLES.filter(s => s.id !== 'all').map(style => (
              <View
                key={style.id}
                className={`style-tag ${selectedStyles.includes(style.id) ? 'active' : ''}`}
                onClick={() => toggleStyle(style.id)}
              >
                <Text className='style-icon'>{style.icon}</Text>
                <Text className='style-name'>{style.name}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* 创作想法 */}
        <View className='section'>
          <View className='section-title'>创作想法</View>
          <Textarea
            className='description-input'
            placeholder='分享这张照片背后的故事、拍摄心得...'
            value={description}
            onInput={(e) => setDescription(e.detail.value)}
          />
        </View>

        {/* 拍摄设备 */}
        <View className='section'>
          <View className='section-title'>拍摄设备</View>
          <View className='gear-inputs'>
            <Input
              className='gear-input'
              placeholder='相机型号'
              value={camera}
              onInput={(e) => setCamera(e.detail.value)}
            />
            <Input
              className='gear-input'
              placeholder='镜头'
              value={lens}
              onInput={(e) => setLens(e.detail.value)}
            />
          </View>
        </View>
      </ScrollView>

      {/* 底部按钮 */}
      <View className='bottom-bar'>
        <View className='publish-btn' onClick={handlePublish}>
          <Text className='btn-text'>发布作品</Text>
        </View>
      </View>
    </View>
  )
}
