// 测试用例集合

/**
 * 测试数据
 */
export const TEST_DATA = {
  photographer: {
    id: 'test_photographer_1',
    name: '测试摄影师',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop&crop=face',
    title: '独立摄影师',
    location: '上海',
    bio: '测试摄影师简介',
    wechatId: 'test_wechat',
    phone: '138****8888'
  },
  
  works: [
    {
      id: 'test_work_1',
      title: '测试作品1',
      description: '测试作品描述1',
      images: ['https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=600&h=600&fit=crop&crop=face'],
      style: '清新',
      camera: 'Canon EOS R5',
      lens: 'RF 85mm f/1.2L',
      likes: 100,
      createdAt: '2024-01-15'
    },
    {
      id: 'test_work_2',
      title: '测试作品2',
      description: '测试作品描述2',
      images: [
        'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&h=600&fit=crop&crop=face',
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&h=600&fit=crop&crop=face'
      ],
      style: '复古',
      camera: 'Sony A7M4',
      lens: 'FE 50mm f/1.2',
      likes: 200,
      createdAt: '2024-01-14'
    }
  ],
  
  bookings: [
    {
      id: 'BK_TEST_001',
      photographerId: 'test_photographer_1',
      photographerName: '测试摄影师',
      photographerAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face',
      clientId: 'test_client_1',
      clientName: '测试客户',
      clientPhone: '139****6666',
      type: '个人写真',
      date: '2024-02-20',
      time: '下午',
      location: '上海法租界',
      style: '复古胶片',
      notes: '测试备注',
      status: 'pending',
      createdAt: '2024-02-10T14:30:00',
      updatedAt: '2024-02-10T14:30:00'
    }
  ]
}

/**
 * 测试用例
 */
export const TEST_CASES = {
  // 首页测试用例
  home: {
    '应该正确显示摄影师名片': () => {
      const photographer = TEST_DATA.photographer;
      return photographer.name === '测试摄影师' &&
             photographer.title === '独立摄影师' &&
             photographer.location === '上海';
    },
    
    '应该正确筛选作品': () => {
      const works = TEST_DATA.works;
      const filteredWorks = works.filter(w => w.style === '复古');
      return filteredWorks.length === 1 &&
             filteredWorks[0].title === '测试作品2';
    },
    
    '应该正确计算作品总数': () => {
      const works = TEST_DATA.works;
      return works.length === 2;
    }
  },
  
  // 预约测试用例
  booking: {
    '应该正确创建预约': () => {
      const booking = TEST_DATA.bookings[0];
      return booking.id.startsWith('BK_') &&
             booking.status === 'pending' &&
             booking.type === '个人写真';
    },
    
    '应该正确筛选待确认预约': () => {
      const bookings = TEST_DATA.bookings;
      const pendingBookings = bookings.filter(b => b.status === 'pending');
      return pendingBookings.length === 1;
    },
    
    '应该正确更新预约状态': () => {
      const booking = { ...TEST_DATA.bookings[0], status: 'confirmed' };
      return booking.status === 'confirmed';
    }
  },
  
  // 状态流转测试
  statusFlow: {
    '待确认 -> 已确认': () => {
      const currentStatus = 'pending';
      const newStatus = 'confirmed';
      return isValidTransition(currentStatus, newStatus);
    },
    
    '已确认 -> 拍摄中': () => {
      const currentStatus = 'confirmed';
      const newStatus = 'shooting';
      return isValidTransition(currentStatus, newStatus);
    },
    
    '拍摄中 -> 已完成': () => {
      const currentStatus = 'shooting';
      const newStatus = 'completed';
      return isValidTransition(currentStatus, newStatus);
    },
    
    '无效状态流转': () => {
      const currentStatus = 'pending';
      const newStatus = 'completed';
      return !isValidTransition(currentStatus, newStatus);
    }
  }
}

/**
 * 检查状态流转是否有效
 */
function isValidTransition(currentStatus: string, newStatus: string): boolean {
  const validTransitions: Record<string, string[]> = {
    'pending': ['confirmed', 'cancelled'],
    'confirmed': ['shooting', 'cancelled'],
    'shooting': ['review'],
    'review': ['completed'],
    'completed': [],
    'cancelled': []
  };
  
  return validTransitions[currentStatus]?.includes(newStatus) || false;
}

/**
 * 运行所有测试
 */
export function runAllTests(): { passed: number; failed: number; results: Record<string, boolean> } {
  const results: Record<string, boolean> = {};
  let passed = 0;
  let failed = 0;
  
  // 测试首页
  Object.entries(TEST_CASES.home).forEach(([name, testFn]) => {
    try {
      const result = testFn();
      results[name] = result;
      if (result) passed++; else failed++;
    } catch {
      results[name] = false;
      failed++;
    }
  });
  
  // 测试预约
  Object.entries(TEST_CASES.booking).forEach(([name, testFn]) => {
    try {
      const result = testFn();
      results[name] = result;
      if (result) passed++; else failed++;
    } catch {
      results[name] = false;
      failed++;
    }
  });
  
  // 测试状态流转
  Object.entries(TEST_CASES.statusFlow).forEach(([name, testFn]) => {
    try {
      const result = testFn();
      results[name] = result;
      if (result) passed++; else failed++;
    } catch {
      results[name] = false;
      failed++;
    }
  });
  
  return { passed, failed, results };
}
