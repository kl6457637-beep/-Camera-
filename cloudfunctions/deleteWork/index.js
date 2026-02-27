const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const _ = db.command

/**
 * 删除作品
 * @param {Object} event - 事件参数
 * @param {string} event.workId - 作品ID
 */
exports.main = async (event, context) => {
  const { workId } = event
  const { OPENID } = cloud.getWXContext()

  if (!workId) {
    return {
      success: false,
      error: '缺少作品ID'
    }
  }

  try {
    // 查询作品是否存在
    const work = await db.collection('works').doc(workId).get()

    if (!work.data) {
      return {
        success: false,
        error: '作品不存在'
      }
    }

    // 验证是否为作品所有者
    if (work.data.photographerId !== OPENID && work.data._openid !== OPENID) {
      return {
        success: false,
        error: '无权删除此作品'
      }
    }

    // 删除作品
    await db.collection('works').doc(workId).remove()

    // 删除关联的收藏记录
    await db.collection('favorites').where({
      workId: workId
    }).remove()

    // 删除关联的评论
    await db.collection('comments').where({
      workId: workId
    }).remove()

    return {
      success: true,
      data: {
        workId,
        deletedAt: new Date().toISOString()
      }
    }
  } catch (error) {
    console.error('删除作品失败:', error)
    return {
      success: false,
      error: error.message
    }
  }
}
