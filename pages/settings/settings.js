const store = require('../../utils/store');
const T = require('../../utils/time');

Page({
  data: {
    semesterStart: '',
    maxWeek: 25,
    maxWeekOptions: [],
    sectionTimes: [],
    remindEnabled: true,
    remindMinutes: 15,
    remindOptions: [10, 15, 20, 30],
    remindIdx: 1,
    coursesCount: 0
  },

  onShow() {
    this.refresh();
  },

  refresh() {
    const s = store.getSettings();
    const maxWeekOptions = [];
    for (let i = 16; i <= 30; i++) maxWeekOptions.push(i + ' 周');
    const remindIdx = this.data.remindOptions.indexOf(s.remindMinutes);
    this.setData({
      semesterStart: s.semesterStart,
      maxWeek: s.maxWeek || 25,
      maxWeekOptions: maxWeekOptions,
      sectionTimes: s.sectionTimes.map(function (t, i) {
        return { n: i + 1, start: t.start, end: t.end };
      }),
      remindEnabled: !!s.remindEnabled,
      remindMinutes: s.remindMinutes,
      remindIdx: remindIdx > -1 ? remindIdx : 1,
      coursesCount: store.getCourses().length
    });
  },

  onSemesterStart(e) {
    const monday = T.getMonday(T.parseDate(e.detail.value));
    const s = store.getSettings();
    s.semesterStart = T.formatDate(monday);
    store.saveSettings(s);
    this.setData({ semesterStart: s.semesterStart });
    wx.showToast({ title: '已自动对齐到周一', icon: 'none' });
  },

  onMaxWeek(e) {
    const s = store.getSettings();
    s.maxWeek = 16 + Number(e.detail.value);
    store.saveSettings(s);
    this.setData({ maxWeek: s.maxWeek });
  },

  onTimeStart(e) {
    const i = Number(e.currentTarget.dataset.i);
    const s = store.getSettings();
    s.sectionTimes[i].start = e.detail.value;
    store.saveSettings(s);
    this.setData({
      sectionTimes: s.sectionTimes.map(function (t, idx) {
        return { n: idx + 1, start: t.start, end: t.end };
      })
    });
  },

  onTimeEnd(e) {
    const i = Number(e.currentTarget.dataset.i);
    const s = store.getSettings();
    s.sectionTimes[i].end = e.detail.value;
    store.saveSettings(s);
    this.setData({
      sectionTimes: s.sectionTimes.map(function (t, idx) {
        return { n: idx + 1, start: t.start, end: t.end };
      })
    });
  },

  onRemindToggle(e) {
    const s = store.getSettings();
    s.remindEnabled = e.detail.value;
    store.saveSettings(s);
    this.setData({ remindEnabled: s.remindEnabled });
  },

  onRemindMinutes(e) {
    const s = store.getSettings();
    s.remindMinutes = this.data.remindOptions[Number(e.detail.value)];
    store.saveSettings(s);
    this.setData({ remindMinutes: s.remindMinutes, remindIdx: Number(e.detail.value) });
  },

  exportData() {
    const data = {
      app: 'xiao-ketang',
      version: 1,
      settings: store.getSettings(),
      courses: store.getCourses()
    };
    wx.setClipboardData({
      data: JSON.stringify(data),
      success() {
        wx.showToast({ title: '已复制到剪贴板', icon: 'none' });
      }
    });
  },

  importData() {
    const that = this;
    wx.getClipboardData({
      success(res) {
        try {
          const obj = JSON.parse(res.data);
          if (!obj || !Array.isArray(obj.courses)) throw new Error('format');
          store.saveCourses(obj.courses);
          if (obj.settings && obj.settings.semesterStart && Array.isArray(obj.settings.sectionTimes)) {
            store.saveSettings(obj.settings);
          }
          that.refresh();
          wx.showToast({ title: '导入成功，共 ' + obj.courses.length + ' 门课', icon: 'success' });
        } catch (err) {
          wx.showToast({ title: '剪贴板里不是有效的课表数据', icon: 'none' });
        }
      }
    });
  },

  clearAll() {
    const that = this;
    wx.showModal({
      title: '清空数据',
      content: '将删除全部课程，且无法恢复。确定继续吗？',
      confirmColor: '#FA5151',
      success(res) {
        if (res.confirm) {
          store.saveCourses([]);
          that.refresh();
          wx.showToast({ title: '已清空', icon: 'none' });
        }
      }
    });
  }
});
