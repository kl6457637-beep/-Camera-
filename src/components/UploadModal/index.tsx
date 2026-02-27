import React, { useState } from 'react'
import Taro from '@tarojs/taro'
import { View, Text, Image, Input, Textarea } from '@tarojs/components'
import Modal from '../Modal'
import { PHOTO_STYLES } from '../../constants'
import './uploadModal.scss'

interface UploadModalProps {
  visible: boolean
  onClose: () => void
  onSubmit: (data: UploadData) => void
}

export interface UploadData {
  title: string
  style: string
  description: string
  camera: string
  lens: string
  images: string[]
}

const STYLE_OPTIONS = PHOTO_STYLES.filter(s => s.id !== 'all').map(s => s.name)

export default function UploadModal({
  visible,
  onClose,
  onSubmit
}: UploadModalProps) {
  const [images, setImages] = useState<string[]>([])
  const [title, setTitle] = useState('')
  const [selectedStyle, setSelectedStyle] = useState('')
  const [description, setDescription] = useState('')
  const [camera, setCamera] = useState('')
  const [lens, setLens] = useState('')
  const [uploading, setUploading] = useState(false)

  const handleChooseImage = () => {
    Taro.chooseImage({
      count: 9 - images.length,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res: any) => {
        setImages([...images, ...res.tempFilePaths])
      }
    })
  }

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index))
  }

  const handleSubmit = () => {
    if (images.length === 0) {
      Taro.showToast({ title: '请选择照片', icon: 'none' })
      return
    }
    if (!title.trim()) {
      Taro.showToast({ title: '请输入作品标题', icon: 'none' })
      return
    }

    setUploading(true)

    // 模拟上传延迟
    setTimeout(() => {
      const data: UploadData = {
        title: title.trim(),
        style: selectedStyle,
        description: description.trim(),
        camera: camera.trim(),
        lens: lens.trim(),
        images
      }

      onSubmit(data)
      resetForm()
      Taro.showToast({ title: '发布成功', icon: 'success' })
    }, 1500)
  }

  const resetForm = () => {
    setImages([])
    setTitle('')
    setSelectedStyle('')
    setDescription('')
    setCamera('')
    setLens('')
    setUploading(false)
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  return (
    <Modal
      visible={visible}
      onClose={handleClose}
      title='上传新作品'
      footer={
        <View
          className={`modal-btn primary ${uploading ? 'loading' : ''}`}
          onClick={uploading ? undefined : handleSubmit}
        >
          <Text className='btn-text'>{uploading ? '上传中...' : '发布作品'}</Text>
        </View>
      }
    >
      {/* 照片上传 */}
      <View className='form-group'>
        <Text className='form-label'>
          照片 <Text className='required'>*</Text>
        </Text>
        <View className='photo-section'>
          <View className='photo-grid'>
            {images.map((img, index) => (
              <View key={index} className='photo-item'>
                <Image
                  className='photo-preview'
                  src={img}
                  mode='aspectFill'
                />
                <View className='photo-remove' onClick={() => handleRemoveImage(index)}>
                  <Text className='remove-icon'>×</Text>
                </View>
              </View>
            ))}
            {images.length < 9 && (
              <View className='photo-add' onClick={handleChooseImage}>
                <Text className='add-icon'>+</Text>
                <Text className='add-text'>添加照片</Text>
              </View>
            )}
          </View>
          <Text className='photo-hint'>最多上传9张照片</Text>
        </View>
      </View>

      {/* 作品标题 */}
      <View className='form-group'>
        <Text className='form-label'>
          标题 <Text className='required'>*</Text>
        </Text>
        <Input
          className='form-input'
          value={title}
          onInput={(e: any) => setTitle(e.detail.value)}
          placeholder='给你的作品起个名字'
          maxlength={50}
        />
      </View>

      {/* 风格标签 */}
      <View className='form-group'>
        <Text className='form-label'>风格标签</Text>
        <View className='style-section'>
          <Text className='style-title'>点击选择常用标签</Text>
          <View className='style-options'>
            {STYLE_OPTIONS.map(style => (
              <View
                key={style}
                className={`style-option ${selectedStyle === style ? 'selected' : ''}`}
                onClick={() => setSelectedStyle(style)}
              >
                <Text className='style-text'>{style}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* 创作想法 */}
      <View className='form-group'>
        <Text className='form-label'>创作想法</Text>
        <Textarea
          className='form-textarea'
          value={description}
          onInput={(e: any) => setDescription(e.detail.value)}
          placeholder='分享这张照片背后的故事、拍摄心得、创作理念...'
          maxlength={500}
        />
      </View>

      {/* 拍摄设备 */}
      <View className='form-group'>
        <Text className='form-label'>拍摄设备</Text>
        <View className='gear-section'>
          <Input
            className='gear-input'
            value={camera}
            onInput={(e: any) => setCamera(e.detail.value)}
            placeholder='相机型号'
          />
          <Input
            className='gear-input'
            value={lens}
            onInput={(e: any) => setLens(e.detail.value)}
            placeholder='镜头'
          />
        </View>
      </View>
    </Modal>
  )
}
