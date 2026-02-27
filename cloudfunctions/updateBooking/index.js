const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

/**
 * 更新预约状态
 * @param {Object} event - 事件参数
 * @param {string} event.bookingId - 预约ID
 * @param {string} event.status - 新状态
 * @param {string} event.note - 备注
 */
exports.main = async (event, context) => {
  const { bookingId, status, note } = event
  const { OPENID } = cloud.getWXContext()

  if (!bookingId || !status) {
    return {
      success: false,
      error: '缺少必要参数'
    }
  }

  // 有效的状态
  const validStatuses = ['pending', 'confirmed', 'shooting', 'review', 'completed', 'cancelled']
  if (!validStatuses.includes(status)) {
    return {
      success: false,
      error: '无效的状态'
    }
  }

  try {
    // 查询预约
    const booking = await db.collection('bookings').doc(bookingId).get()
    
    if (!booking.data) {
      return {
        success: false,
        error: '预约不存在'
      }
    }

    // 更新预约
    const updateData = {
      status,
      updatedAt: db.serverDate()
    }

    if (note) {
      updateData.note = note
    }

    await db.collection('bookings').doc(bookingId).update({
      data: updateData
    })

    return {
      success: true,
      data: {
        ...booking.data,
        ...updateData
      }
    }
  } catch (error) {
    console.error('更新预约失败:', error)
    return {
      success: false,
      error: error.message
    }
  }
}
