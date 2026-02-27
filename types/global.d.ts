/**
 * 全局类型定义
 */

// 微信小程序云开发类型
declare namespace wx {
  interface Cloud {
    init: (options: { env: string | boolean }) => void;
    callFunction: (options: {
      name: string;
      data?: any;
      success?: (res: any) => void;
      fail?: (err: any) => void;
      complete?: (res: any) => void;
    }) => void;
    database: () => {
      collection: (name: string) => any;
    };
    uploadFile: (options: {
      cloudPath: string;
      filePath: string;
      success?: (res: any) => void;
      fail?: (err: any) => void;
    }) => void;
  }
}

declare const wx: {
  cloud: wx.Cloud;
  getStorageSync: (key: string) => any;
  setStorageSync: (key: string, data: any) => void;
  removeStorageSync: (key: string) => void;
  showToast: (options: { title: string; icon?: string; duration?: number }) => void;
  showModal: (options: {
    title?: string;
    content?: string;
    showCancel?: boolean;
    success?: (res: { confirm: boolean; cancel: boolean }) => void;
  }) => void;
  setClipboardData: (options: {
    data: string;
    success?: () => void;
  }) => void;
  navigateTo: (options: { url: string }) => void;
  navigateBack: (options?: { delta?: number }) => void;
  switchTab: (options: { url: string }) => void;
  getSystemInfoSync: () => {
    windowWidth: number;
    windowHeight: number;
    statusBarHeight: number;
    screenWidth: number;
    screenHeight: number;
    safeArea?: {
      bottom: number;
      height: number;
      left: number;
      right: number;
      top: number;
      width: number;
    };
  };
  createInnerAudioContext: () => {
    src: string;
    play: () => void;
    stop: () => void;
    onPlay: (callback: () => void) => void;
    onError: (callback: (err: any) => void) => void;
  };
};

// 作品数据类型
interface Photo {
  _id: string;
  url: string;
  thumbUrl: string;
  title?: string;
  description?: string;
  style: string;
  styleId: string;
  order: number;
  createdAt: Date;
  width?: number;
  height?: number;
}

// 风格分类类型
interface PhotoStyle {
  _id: string;
  name: string;
  icon?: string;
  coverUrl?: string;
  order: number;
  count: number;
  createdAt: Date;
}

// 摄影师信息类型
interface Photographer {
  _id: string;
  name: string;
  avatar: string;
  motto: string;
  wechatId: string;
  qrCodeUrl?: string;
  createdAt: Date;
}

// 用户意向类型
interface UserIntent {
  _id: string;
  userId: string;
  photos: Array<{
    photoId: string;
    photoUrl: string;
    styleName: string;
    addedAt: Date;
  }>;
  styles: string[];
  contactStatus: 'pending' | 'contacted';
  note?: string;
  createdAt: Date;
  updatedAt: Date;
}

// 本地收藏类型
interface LocalFavorite {
  photoId: string;
  photoUrl: string;
  styleId: string;
  styleName: string;
  addedAt: number;
}

// 页面状态类型
interface PageState {
  loading: boolean;
  error: string | null;
  hasMore: boolean;
}