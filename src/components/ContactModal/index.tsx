import React from 'react'
import Taro from '@tarojs/taro'
import { View, Text } from '@tarojs/components'
import Modal from '../Modal'
import './contactModal.scss'

interface ContactModalProps {
  visible: boolean
  onClose: () => void
}

const WECHAT_ID = 'l18273659421'

export default function ContactModal({
  visible,
  onClose
}: ContactModalProps) {
  const handleCopy = () => {
    Taro.setClipboardData({
      data: WECHAT_ID,
      success: () => {
        Taro.showToast({
          title: '微信号已复制',
          icon: 'success'
        })
      }
    })
  }

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title='联系我'
      footer={
        <View className='modal-btn primary' onClick={handleCopy}>
          <Text className='btn-text'>复制微信号</Text>
        </View>
      }
    >
      <View className='contact-content'>
        <View className='wechat-icon'>💬</View>
        <Text className='contact-tip'>添加摄影师微信进行咨询</Text>
        <View className='wechat-id-box'>
          <Text className='wechat-label'>微信号</Text>
          <Text className='wechat-id'>{WECHAT_ID}</Text>
        </View>
      </View>
    </Modal>
  )
}
