const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

/**
 * 获取预约列表
 * @param {Object} event - 事件参数
 * @param {string} event.type - 类型: 'sent'(我发出的) | 'received'(我收到的)
 * @param {string} event.status - 状态筛选
 */
exports.main = async (event, context) => {
  const { type = 'sent', status } = event
  const { OPENID } = cloud.getWXContext()

  try {
    let query

    if (type === 'sent') {
      // 我发出的预约
      query = db.collection('bookings').where({
        _openid: OPENID
      })
    } else {
      // 我收到的预约 (需要是摄影师身份)
      // 先获取摄影师信息
      const photographer = await db.collection('photographers').where({
        _openid: OPENID
      }).get()

      if (photographer.data.length === 0) {
        return {
          success: false,
          error: '您还不是摄影师'
        }
      }

      const photographerId = photographer.data[0]._id
      query = db.collection('bookings').where({
        photographerId: photographerId
      })
    }

    // 状态筛选
    if (status && status !== 'all') {
      query = query.where({
        status: status
      })
    }

    // 查询预约列表
    const bookings = await query
      .orderBy('createdAt', 'desc')
      .get()

    return {
      success: true,
      data: bookings.data
    }
  } catch (error) {
    console.error('获取预约失败:', error)
    return {
      success: false,
      error: error.message
    }
  }
}
