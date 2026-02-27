/**
 * 显式类型声明，解决 STORAGE_KEYS 类型推断问题
 */

// 确保 STORAGE_KEYS 被正确导出
import { STORAGE_KEYS } from '../constants'

// 显式声明 STORAGE_KEYS 的类型
type StorageKeysType = typeof STORAGE_KEYS

// 验证所有必需的属性都存在
type ExpectedKeys = {
  FAVORITES: string
  USER_INFO: string
  INTENT_SENT: string
  PHOTOGRAPHER_MODE: string
}

// 检查 STORAGE_KEYS 是否包含所有必需的属性
type STORAGE_KEYS_CHECK = ExpectedKeys extends StorageKeysType ? true : false

// 如果类型检查失败，这里会产生编译错误
const _storageKeysCheck: STORAGE_KEYS_CHECK = true

// 导出以确保类型被加载
export type { StorageKeysType, ExpectedKeys }
