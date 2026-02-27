const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

/**
 * 上传作品
 * @param {Object} event - 事件参数
 * @param {string} event.title - 作品标题
 * @param {string} event.style - 风格
 * @param {string} event.desc - 描述
 * @param {Array} event.photos - 照片列表 [{url, size}]
 * @param {string} event.camera - 相机型号
 * @param {string} event.lens - 镜头
 */
exports.main = async (event, context) => {
  const { title, style, desc, photos = [], camera, lens } = event
  const { OPENID } = cloud.getWXContext()

  // 参数验证
  if (!title || title.trim().length === 0) {
    return {
      success: false,
      error: '作品标题不能为空'
    }
  }

  if (!photos || photos.length === 0) {
    return {
      success: false,
      error: '请至少上传一张照片'
    }
  }

  if (photos.length > 9) {
    return {
      success: false,
      error: '最多上传9张照片'
    }
  }

  try {
    // 创建作品数据
    const workData = {
      title: title.trim(),
      style: style || '其他',
      desc: desc || '',
      photos: photos.map((photo, index) => ({
        id: Date.now().toString(36) + index,
        url: photo.url,
        size: photo.size || 'medium',
        desc: photo.desc || ''
      })),
      count: photos.length,
      camera: camera || '',
      lens: lens || '',
      photographerId: OPENID,
      likes: 0,
      views: Math.floor(Math.random() * 500) + 100,
      createdAt: db.serverDate(),
      updatedAt: db.serverDate()
    }

    // 保存到数据库
    const result = await db.collection('works').add({
      data: workData
    })

    return {
      success: true,
      data: {
        workId: result.id,
        ...workData
      }
    }
  } catch (error) {
    console.error('上传作品失败:', error)
    return {
      success: false,
      error: error.message
    }
  }
}
