// 小课表 - 小程序入口
const store = require('./utils/store');

App({
  globalData: {
    version: '1.0.0'
  },
  onLaunch() {
    // 首次启动时初始化默认设置
    store.getSettings();
  }
});
