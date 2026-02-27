const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

/**
 * 创建预约
 * @param {Object} event - 事件参数
 * @param {string} event.photographerId - 摄影师ID
 * @param {string} event.type - 拍摄类型
 * @param {string} event.date - 期望日期
 * @param {string} event.time - 期望时段
 * @param {string} event.location - 拍摄地点
 * @param {string} event.style - 期望风格
 * @param {string} event.notes - 备注
 * @param {string} event.clientName - 客户姓名
 * @param {string} event.clientPhone - 客户电话
 */
exports.main = async (event, context) => {
  const {
    photographerId,
    type,
    date,
    time,
    location,
    style,
    notes,
    clientName,
    clientPhone
  } = event
  const { OPENID } = cloud.getWXContext()

  // 参数验证
  if (!photographerId || !type || !date || !clientPhone) {
    return {
      success: false,
      error: '缺少必要参数'
    }
  }

  try {
    // 获取摄影师信息
    const photographer = await db.collection('photographers').doc(photographerId).get()
    
    if (!photographer.data) {
      return {
        success: false,
        error: '摄影师不存在'
      }
    }

    // 生成预约ID
    const bookingId = 'BK' + Date.now()

    // 创建预约
    const booking = {
      _id: bookingId,
      _openid: OPENID,
      photographerId: photographerId,
      photographerName: photographer.data.name,
      photographerAvatar: photographer.data.avatar,
      clientName: clientName || '匿名用户',
      clientPhone,
      type,
      date,
      time: time || '',
      location: location || '',
      style: style || '',
      notes: notes || '',
      status: 'pending',
      createdAt: db.serverDate(),
      updatedAt: db.serverDate()
    }

    await db.collection('bookings').add({
      data: booking
    })

    // 发送通知给摄影师
    await sendNotification(photographerId, {
      type: 'new_booking',
      title: '新的预约',
      content: `${booking.clientName} 预约了 ${type}`,
      bookingId: bookingId
    })

    return {
      success: true,
      data: booking
    }
  } catch (error) {
    console.error('创建预约失败:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

// 发送通知
async function sendNotification(photographerId, notification) {
  try {
    await db.collection('notifications').add({
      data: {
        photographerId,
        ...notification,
        isRead: false,
        createdAt: db.serverDate()
      }
    })
  } catch (error) {
    console.error('发送通知失败:', error)
  }
}
