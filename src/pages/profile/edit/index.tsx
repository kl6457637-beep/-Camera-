import Taro, { useDidShow } from '@tarojs/taro'
import { useState } from 'react'
import { View, Text, Image, Input, Textarea, Picker } from '@tarojs/components'
import { showToast } from '../../../utils'
import './index.scss'

interface UserProfile {
  avatar: string
  nickname: string
  username: string
  bio: string
  phone: string
  gender: 'male' | 'female' | 'unknown'
  birthday: string
  location: string
  email: string
}

const GENDER_OPTIONS = [
  { value: 'unknown', label: '保密' },
  { value: 'male', label: '男' },
  { value: 'female', label: '女' }
]

export default function EditProfile() {
  const [profile, setProfile] = useState<UserProfile>({
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop&crop=face',
    nickname: '光影诗人',
    username: '@light_chaser',
    bio: '用镜头记录每一个动人瞬间',
    phone: '138****8888',
    gender: 'unknown',
    birthday: '1995-06-15',
    location: '上海',
    email: 'photographer@example.com'
  })

  // 页面显示时加载数据
  useDidShow(() => {
    const savedProfile = Taro.getStorageSync('user_profile')
    if (savedProfile) {
      setProfile(prev => ({ ...prev, ...savedProfile }))
    }
  })

  // 更换头像
  const changeAvatar = () => {
    Taro.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePath = res.tempFilePaths[0]
        setProfile(prev => ({ ...prev, avatar: tempFilePath }))
        showToast('头像选择成功', 'success')
      }
    })
  }

  // 更新字段
  const updateField = (field: keyof UserProfile, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }))
  }

  // 选择性别
  const onGenderChange = (e: any) => {
    const index = e.detail.value
    updateField('gender', GENDER_OPTIONS[index].value as any)
  }

  // 选择生日
  const onBirthdayChange = (e: any) => {
    updateField('birthday', e.detail.value)
  }

  // 保存资料
  const saveProfile = () => {
    // 验证必填项
    if (!profile.nickname.trim()) {
      showToast('请输入昵称', 'error')
      return
    }

    // 保存到本地
    Taro.setStorageSync('user_profile', profile)
    showToast('保存成功', 'success')
    
    // 延迟返回
    setTimeout(() => {
      Taro.navigateBack()
    }, 1500)
  }

  // 返回
  const goBack = () => {
    Taro.navigateBack()
  }

  return (
    <View className='edit-profile-page'>
      {/* 导航栏 */}
      <View className='nav-bar'>
        <View className='back-btn' onClick={goBack}>
          <Text className='back-icon'>←</Text>
        </View>
        <Text className='nav-title'>编辑资料</Text>
        <View className='save-btn' onClick={saveProfile}>
          <Text className='save-text'>保存</Text>
        </View>
      </View>

      {/* 头像区域 */}
      <View className='avatar-section'>
        <View className='avatar-wrapper' onClick={changeAvatar}>
          <Image className='avatar' src={profile.avatar} mode='aspectFill' />
          <View className='avatar-mask'>
            <Text className='mask-text'>更换头像</Text>
          </View>
        </View>
      </View>

      {/* 表单区域 */}
      <View className='form-section'>
        <View className='form-item'>
          <Text className='form-label'>昵称</Text>
          <Input
            className='form-input'
            value={profile.nickname}
            onInput={(e) => updateField('nickname', e.detail.value)}
            placeholder='请输入昵称'
            maxlength={20}
          />
        </View>

        <View className='form-item'>
          <Text className='form-label'>用户名</Text>
          <Input
            className='form-input'
            value={profile.username}
            onInput={(e) => updateField('username', e.detail.value)}
            placeholder='请输入用户名'
            maxlength={30}
          />
        </View>

        <View className='form-item'>
          <Text className='form-label'>个人简介</Text>
          <Textarea
            className='form-textarea'
            value={profile.bio}
            onInput={(e) => updateField('bio', e.detail.value)}
            placeholder='介绍一下自己'
            maxlength={100}
          />
        </View>

        <View className='form-item'>
          <Text className='form-label'>性别</Text>
          <Picker mode='selector' range={GENDER_OPTIONS} rangeKey='label' onChange={onGenderChange}>
            <View className='picker-value'>
              <Text>{GENDER_OPTIONS.find(g => g.value === profile.gender)?.label}</Text>
              <Text className='picker-arrow'>›</Text>
            </View>
          </Picker>
        </View>

        <View className='form-item'>
          <Text className='form-label'>生日</Text>
          <Picker mode='date' value={profile.birthday} onChange={onBirthdayChange}>
            <View className='picker-value'>
              <Text>{profile.birthday}</Text>
              <Text className='picker-arrow'>›</Text>
            </View>
          </Picker>
        </View>

        <View className='form-item'>
          <Text className='form-label'>所在地</Text>
          <Input
            className='form-input'
            value={profile.location}
            onInput={(e) => updateField('location', e.detail.value)}
            placeholder='请输入所在地'
          />
        </View>

        <View className='form-item'>
          <Text className='form-label'>手机号</Text>
          <Input
            className='form-input'
            value={profile.phone}
            onInput={(e) => updateField('phone', e.detail.value)}
            placeholder='请输入手机号'
            type='number'
            maxlength={11}
          />
        </View>

        <View className='form-item'>
          <Text className='form-label'>邮箱</Text>
          <Input
            className='form-input'
            value={profile.email}
            onInput={(e) => updateField('email', e.detail.value)}
            placeholder='请输入邮箱'
          />
        </View>
      </View>

      {/* 提示 */}
      <View className='tips-section'>
        <Text className='tips-text'>完善个人资料可以让更多人了解你</Text>
      </View>

      {/* 底部保存按钮 */}
      <View className='bottom-save-bar'>
        <View className='save-btn-bottom' onClick={saveProfile}>
          <Text className='save-btn-text'>保存资料</Text>
        </View>
      </View>
    </View>
  )
}
