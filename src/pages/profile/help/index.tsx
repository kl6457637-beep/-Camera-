import Taro from '@tarojs/taro'
import { useState } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import { showToast } from '../../../utils'
import './index.scss'

interface HelpItem {
  id: string
  question: string
  answer: string
}

const HELP_ITEMS: HelpItem[] = [
  {
    id: '1',
    question: '如何预约拍摄？',
    answer: '您可以在首页浏览摄影师的作品，点击"预约摄影"按钮，填写拍摄时间、类型、地点等信息后提交预约。摄影师会在24小时内确认您的预约。'
  },
  {
    id: '2',
    question: '预约后可以取消吗？',
    answer: '可以。在预约待确认状态下，您可以随时取消预约。如果预约已确认，需要提前48小时联系摄影师取消，否则可能无法退还定金。'
  },
  {
    id: '3',
    question: '如何收藏喜欢的作品？',
    answer: '浏览作品时，点击作品卡片上的爱心图标即可收藏。收藏的作品可以在"我的心动清单"中查看。'
  },
  {
    id: '4',
    question: '摄影师模式是什么？',
    answer: '开启摄影师模式后，您可以接收其他用户的拍摄预约。在个人中心的设置中可以开启或关闭此功能。'
  },
  {
    id: '5',
    question: '如何更换头像和个人资料？',
    answer: '进入个人中心，点击头像或个人资料区域，进入编辑页面后可以修改头像、昵称、简介等信息。'
  },
  {
    id: '6',
    question: '可以下载摄影师的作品吗？',
    answer: '这取决于摄影师的隐私设置。如果摄影师允许下载，您可以在作品详情页看到下载按钮。未经摄影师允许，请勿擅自使用他人作品。'
  },
  {
    id: '7',
    question: '如何联系摄影师？',
    answer: '在摄影师的个人主页点击"联系我"按钮，可以查看摄影师的微信号并一键复制，通过微信与摄影师沟通。'
  },
  {
    id: '8',
    question: '支持哪些主题风格？',
    answer: '目前支持5种主题风格：默认粉、暗夜黑、清新绿、海洋蓝、梦幻紫。您可以在个人中心的主题设置中切换喜欢的风格。'
  }
]

export default function Help() {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  // 切换展开/收起
  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id)
  }

  // 联系客服
  const contactSupport = () => {
    showToast('客服功能开发中', 'none')
  }

  // 返回
  const goBack = () => {
    Taro.navigateBack()
  }

  return (
    <View className='help-page'>
      {/* 导航栏 */}
      <View className='nav-bar'>
        <View className='back-btn' onClick={goBack}>
          <Text className='back-icon'>←</Text>
        </View>
        <Text className='nav-title'>帮助中心</Text>
        <View className='nav-placeholder' />
      </View>

      {/* 常见问题列表 */}
      <ScrollView className='help-list' scrollY>
        <View className='list-header'>
          <Text className='header-title'>常见问题</Text>
          <Text className='header-subtitle'>点击问题查看解答</Text>
        </View>

        {HELP_ITEMS.map((item) => (
          <View 
            key={item.id} 
            className={`help-item ${expandedId === item.id ? 'expanded' : ''}`}
            onClick={() => toggleExpand(item.id)}
          >
            <View className='question-row'>
              <View className='q-mark'>Q</View>
              <Text className='question-text'>{item.question}</Text>
              <Text className='expand-icon'>{expandedId === item.id ? '−' : '+'}</Text>
            </View>
            {expandedId === item.id && (
              <View className='answer-row'>
                <View className='a-mark'>A</View>
                <Text className='answer-text'>{item.answer}</Text>
              </View>
            )}
          </View>
        ))}

        <View className='list-footer' />
      </ScrollView>

      {/* 底部联系客服 */}
      <View className='contact-section'>
        <Text className='contact-text'>还有其他问题？</Text>
        <View className='contact-btn' onClick={contactSupport}>
          <Text className='btn-text'>联系客服</Text>
        </View>
      </View>
    </View>
  )
}
