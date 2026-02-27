import React from 'react'
import { View, Text, Image } from '@tarojs/components'
import './modal.scss'

interface ModalProps {
  visible: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  showFooter?: boolean
  footer?: React.ReactNode
  className?: string
}

export default function Modal({
  visible,
  onClose,
  title,
  children,
  showFooter = true,
  footer,
  className = ''
}: ModalProps) {
  return (
    <View 
      className={`modal-overlay ${visible ? 'show' : ''}`} 
      onClick={onClose}
      style={{ display: visible ? 'flex' : 'none' }}
    >
      <View className={`modal-content ${className}`} onClick={e => e.stopPropagation()}>
        <View className='modal-header'>
          <Text className='modal-title'>{title}</Text>
          <View className='modal-close' onClick={onClose}>
            <Text className='close-icon'>×</Text>
          </View>
        </View>
        <View className='modal-body'>
          {children}
        </View>
        {showFooter && (
          <View className='modal-footer'>
            {footer || (
              <>
                <View className='modal-btn secondary' onClick={onClose}>
                  <Text className='btn-text'>取消</Text>
                </View>
              </>
            )}
          </View>
        )}
      </View>
    </View>
  )
}
