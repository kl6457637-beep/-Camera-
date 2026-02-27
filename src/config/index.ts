/**
 * 光影作品集 - 云开发配置文件
 * 用户需要将 'your-cloud-env-id' 替换为自己的云开发环境ID
 */

export const cloudConfig = {
  // 云开发环境ID
  env: 'your-cloud-env-id',
  
  // 数据库集合名称
  collections: {
    users: 'users',           // 用户集合
    works: 'works',           // 作品集合
    bookings: 'bookings',     // 预约集合
    favorites: 'favorites',   // 收藏集合
    settings: 'settings'      // 设置集合
  },
  
  // 存储桶配置
  storage: {
    works: 'works/',          // 作品图片存储路径
    avatars: 'avatars/'       // 头像存储路径
  }
}

export default cloudConfig
