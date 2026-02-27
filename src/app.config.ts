export default {
  pages: [
    'pages/index/index',
    'pages/detail/index',
    'pages/favorites/index',
    'pages/contact/index',
    'pages/admin/index',
    'pages/booking/index',
    'pages/profile/index',
    'pages/profile/edit/index',
    'pages/profile/notifications/index',
    'pages/profile/privacy/index',
    'pages/profile/help/index',
    'pages/work/create/index'
  ],
  // 开启按需注入，优化启动时间和内存占用
  lazyCodeLoading: 'requiredComponents',
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#fff',
    navigationBarTitleText: '光影作品集',
    navigationBarTextStyle: 'black',
    navigationStyle: 'custom'
  },
  tabBar: {
    custom: true,
    list: [
      {
        pagePath: 'pages/index/index',
        text: '首页'
      },
      {
        pagePath: 'pages/admin/index',
        text: '作品'
      },
      {
        pagePath: 'pages/booking/index',
        text: '预约'
      },
      {
        pagePath: 'pages/profile/index',
        text: '我的'
      }
    ]
  },
  cloud: true,
  sitemapLocation: 'sitemap.json'
}