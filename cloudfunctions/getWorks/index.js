const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

/**
 * 获取作品列表
 * @param {Object} event - 事件参数
 * @param {string} event.photographerId - 摄影师ID
 * @param {string} event.style - 风格筛选
 * @param {number} event.page - 页码
 * @param {number} event.pageSize - 每页数量
 */
exports.main = async (event, context) => {
  const { photographerId = 'default', style, page = 1, pageSize = 20 } = event
  const { OPENID } = cloud.getWXContext()

  try {
    let query = db.collection('works').where({
      photographerId: photographerId
    })

    // 风格筛选
    if (style && style !== 'all') {
      query = query.where({
        style: style
      })
    }

    // 获取总数
    const countResult = await query.count()
    const total = countResult.total

    // 分页查询
    const works = await query
      .orderBy('createdAt', 'desc')
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .get()

    // 检查每个作品是否被当前用户收藏
    const favorites = await db.collection('favorites').where({
      _openid: OPENID
    }).get()

    const favoriteIds = favorites.data.map(f => f.workId)

    const worksWithFavorite = works.data.map(work => ({
      ...work,
      isFavorited: favoriteIds.includes(work._id)
    }))

    return {
      success: true,
      data: worksWithFavorite,
      total,
      page,
      pageSize
    }
  } catch (error) {
    console.error('获取作品失败:', error)
    return {
      success: false,
      error: error.message
    }
  }
}
