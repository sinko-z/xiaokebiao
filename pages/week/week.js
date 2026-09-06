const store = require('../../utils/store');
const T = require('../../utils/time');

const WEEK_CN = ['', '周一', '周二', '周三', '周四', '周五', '周六', '周日'];
const ROW_H = 52; // 每一节的高度（px）

Page({
  data: {
    weekNum: 1,
    maxWeek: 25,
    weekOptions: [],
    rangeText: '',
    dayHeads: [],
    todayIdx: -1,
    showTodayBack: false,
    sectionList: [],
    grid: [],
    empty: false,
    rowH: ROW_H,
    detail: null
  },

  onShow() {
    this.refresh(false);
  },

  refresh(keepWeek) {
    const settings = store.getSettings();
    const maxWeek = settings.maxWeek || 25;
    const now = new Date();
    const curWeek = T.getWeekNumber(settings.semesterStart, now);
    const curClamped = Math.min(Math.max(curWeek, 1), maxWeek);

    let weekNum = this.data.weekNum;
    if (!(keepWeek && weekNum >= 1 && weekNum <= maxWeek)) {
      weekNum = curClamped;
    }

    const all = store.getCourses();
    const weekCourses = T.getCoursesInWeek(all, weekNum);
    this._weekCourses = weekCourses;

    const semMonday = T.getMonday(T.parseDate(settings.semesterStart));
    const monday = new Date(
      semMonday.getFullYear(),
      semMonday.getMonth(),
      semMonday.getDate() + (weekNum - 1) * 7
    );
    const todayMid = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const dayHeads = [];
    let todayIdx = -1;
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i);
      if (d.getTime() === todayMid.getTime()) todayIdx = i;
      dayHeads.push({
        label: WEEK_CN[i + 1],
        date: (d.getMonth() + 1) + '/' + d.getDate()
      });
    }
    const weekEnd = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + 6);
    const rangeText =
      (monday.getMonth() + 1) + '/' + monday.getDate() + ' - ' +
      (weekEnd.getMonth() + 1) + '/' + weekEnd.getDate();

    const sectionList = [];
    for (let i = 1; i <= settings.sectionTimes.length; i++) {
      sectionList.push({ n: i, t: settings.sectionTimes[i - 1].start });
    }

    const grid = [];
    for (let day = 1; day <= 7; day++) {
      const blocks = T.getCoursesOfDay(weekCourses, day).map(function (c) {
        return {
          id: c.id,
          name: c.name,
          location: c.location || '',
          color: c.color,
          top: (c.startSection - 1) * ROW_H,
          height: (c.endSection - c.startSection + 1) * ROW_H - 4
        };
      });
      grid.push({ day: day, blocks: blocks });
    }

    const weekOptions = [];
    for (let i = 1; i <= maxWeek; i++) weekOptions.push('第 ' + i + ' 周');

    this.setData({
      weekNum: weekNum,
      maxWeek: maxWeek,
      weekOptions: weekOptions,
      rangeText: rangeText,
      dayHeads: dayHeads,
      todayIdx: todayIdx,
      showTodayBack: weekNum !== curWeek,
      sectionList: sectionList,
      grid: grid,
      empty: all.length === 0
    });
  },

  onWeekPick(e) {
    this.setData({ weekNum: Number(e.detail.value) + 1 });
    this.refresh(true);
  },

  prevWeek() {
    if (this.data.weekNum > 1) {
      this.setData({ weekNum: this.data.weekNum - 1 });
      this.refresh(true);
    }
  },

  nextWeek() {
    if (this.data.weekNum < this.data.maxWeek) {
      this.setData({ weekNum: this.data.weekNum + 1 });
      this.refresh(true);
    }
  },

  backToThisWeek() {
    this.refresh(false);
  },

  addCourse() {
    wx.navigateTo({ url: '/pages/edit/edit' });
  },

  loadDemo() {
    store.loadDemoCourses();
    this.refresh(true);
    wx.showToast({ title: '已载入示例课表', icon: 'success' });
  },

  onColLongPress(e) {
    wx.navigateTo({ url: '/pages/edit/edit?day=' + e.currentTarget.dataset.day });
  },

  onBlockTap(e) {
    const id = e.currentTarget.dataset.id;
    const c = (this._weekCourses || []).find(function (x) { return x.id === id; });
    if (!c) return;
    const settings = store.getSettings();
    const t1 = T.getSectionTime(settings, c.startSection);
    const t2 = T.getSectionTime(settings, c.endSection);
    this.setData({
      detail: Object.assign({}, c, {
        timeText: t1.start + ' - ' + t2.end + ' · 第' + c.startSection + '-' + c.endSection + '节',
        weekText: T.formatWeeks(c.weeks)
      })
    });
  },

  editDetail() {
    const id = this.data.detail.id;
    this.setData({ detail: null });
    wx.navigateTo({ url: '/pages/edit/edit?id=' + id });
  },

  deleteDetail() {
    const that = this;
    wx.showModal({
      title: '删除课程',
      content: '确定删除「' + this.data.detail.name + '」吗？',
      confirmColor: '#FA5151',
      success(res) {
        if (res.confirm) {
          store.removeCourse(that.data.detail.id);
          that.setData({ detail: null });
          that.refresh(true);
        }
      }
    });
  },

  closeDetail() {
    this.setData({ detail: null });
  },

  noop() {}
});
