const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

/**
 * 初始化摄影师信息和示例作品数据
 * @param {Object} event - 事件参数
 * @param {boolean} event.force - 是否强制重新初始化（会删除旧数据）
 */
exports.main = async (event, context) => {
  const { force = false } = event
  const { OPENID } = cloud.getWXContext()

  try {
    const results = {
      photographer: null,
      works: [],
      styles: [],
      bookings: [],
      favorites: []
    }

    // 1. 初始化摄影师信息
    const photographerData = {
      _id: 'default',
      name: '光影诗人',
      title: '独立摄影师',
      location: '上海',
      bio: '专注人像摄影5年，用镜头记录每一个动人瞬间。',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400',
      wechatId: 'guangying_shi',
      phone: '13800000000',
      stats: {
        works: 12,
        favorites: 234,
        bookings: 15
      },
      styles: ['清新', '复古', '情绪', '古风'],
      contactEnabled: true,
      createdAt: db.serverDate(),
      updatedAt: db.serverDate()
    }

    if (force) {
      // 强制模式下，先删除旧数据
      await db.collection('photographers').doc('default').remove()
      await db.collection('works').where({}).remove()
      await db.collection('styles').where({}).remove()
    }

    // 检查是否已存在
    const existingPhotographer = await db.collection('photographers').doc('default').get()
    
    if (existingPhotographer.data) {
      results.message = '摄影师信息已存在，如需重新初始化请使用 force: true'
    } else {
      await db.collection('photographers').add({
        data: photographerData
      })
      results.photographer = photographerData
      results.message = '摄影师信息初始化成功'
    }

    // 2. 初始化风格分类
    const styles = [
      { name: '清新', icon: '🌸', count: 4, desc: '自然光日系风格' },
      { name: '复古', icon: '📷', count: 3, desc: '胶片质感怀旧风' },
      { name: '情绪', icon: '🌙', count: 3, desc: '光影情绪人像' },
      { name: '古风', icon: '🏮', count: 2, desc: '汉服东方美学' }
    ]

    for (const style of styles) {
      const existingStyle = await db.collection('styles').where({ name: style.name }).get()
      if (existingStyle.data.length === 0) {
        await db.collection('styles').add({
          data: {
            ...style,
            createdAt: db.serverDate()
          }
        })
        results.styles.push(style)
      }
    }

    // 3. 初始化示例作品（如果还没有作品）
    if (!force) {
      const existingWorks = await db.collection('works').where({}).count()
      if (existingWorks.total === 0) {
        const works = [
          {
            title: '清新日系 | 窗边少女',
            style: '清新',
            desc: '自然光下的温柔时刻',
            photos: [
              { url: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=800', size: 'large', desc: '自然光下的温柔' },
              { url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600', size: 'medium', desc: '午后时光' },
              { url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600', size: 'medium', desc: '恬静时刻' }
            ],
            camera: 'Canon EOS R5',
            lens: 'RF 85mm f/1.2L',
            likes: 234,
            views: 1205
          },
          {
            title: '复古胶片 | 老上海风情',
            style: '复古',
            desc: '旗袍佳人的复古韵味',
            photos: [
              { url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800', size: 'large', desc: '旗袍佳人' },
              { url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600', size: 'medium', desc: '旧时光' },
              { url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=600', size: 'medium', desc: '复古韵味' },
              { url: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=600', size: 'medium', desc: '胶片质感' }
            ],
            camera: 'Fujifilm XT-4',
            lens: 'XF 56mm f/1.2',
            likes: 456,
            views: 2340
          },
          {
            title: '情绪人像 | 光影之间',
            style: '情绪',
            desc: '光影交错的静谧时刻',
            photos: [
              { url: 'https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=800', size: 'large', desc: '思绪万千' },
              { url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600', size: 'medium', desc: '光影交错' },
              { url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600', size: 'medium', desc: '静谧时刻' }
            ],
            camera: 'Sony A7M4',
            lens: 'FE 85mm f/1.4',
            likes: 189,
            views: 892
          },
          {
            title: '古风汉服 | 东方美学',
            style: '古风',
            desc: '汉服人像的古风之美',
            photos: [
              { url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800', size: 'large', desc: '古典韵味' },
              { url: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=600', size: 'medium', desc: '温婉如画' },
              { url: 'https://images.unsplash.com/photo-1496440737103-cd596325d314?w=600', size: 'medium', desc: '清雅脱俗' }
            ],
            camera: 'Canon EOS R6',
            lens: 'RF 85mm f/1.2L',
            likes: 567,
            views: 3102
          }
        ]

        for (const work of works) {
          const workData = {
            ...work,
            count: work.photos.length,
            photographerId: 'default',
            createdAt: db.serverDate(),
            updatedAt: db.serverDate()
          }
          const result = await db.collection('works').add({
            data: workData
          })
          results.works.push({
            id: result.id,
            title: work.title
          })
        }
      }
    }

    // 4. 初始化示例预约字段（可选）
    const bookingStatuses = ['pending', 'confirmed', 'shooting', 'review', 'completed', 'cancelled']

    return {
      success: true,
      data: {
        photographer: results.photographer,
        worksCount: results.works.length,
        stylesCount: results.styles.length,
        message: results.message || '数据初始化完成'
      },
      // 供前端使用的数据
      frontendData: {
        photographer: photographerData,
        styles: styles,
        works: force ? results.works : undefined
      }
    }
  } catch (error) {
    console.error('初始化数据失败:', error)
    return {
      success: false,
      error: error.message
    }
  }
}
