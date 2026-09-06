const store = require('../../utils/store');
const T = require('../../utils/time');

const WEEK_CN = ['', '周一', '周二', '周三', '周四', '周五', '周六', '周日'];

Page({
  data: {
    dateText: '',
    weekCn: '',
    weekNum: 1,
    items: [],
    banner: null,
    emptyText: ''
  },

  onShow() {
    this.refresh();
  },

  refresh() {
    const settings = store.getSettings();
    const all = store.getCourses();
    const now = new Date();
    const day = now.getDay() === 0 ? 7 : now.getDay();
    const maxWeek = settings.maxWeek || 25;
    const curWeek = T.getWeekNumber(settings.semesterStart, now);
    const weekNum = Math.min(Math.max(curWeek, 1), maxWeek);
    const weekCourses = T.getCoursesInWeek(all, weekNum);
    const todays = T.getCoursesOfDay(weekCourses, day);
    const nowM = T.nowMinutes();

    const items = todays.map(function (c) {
      const t1 = T.getSectionTime(settings, c.startSection);
      const t2 = T.getSectionTime(settings, c.endSection);
      const sM = T.minutesOf(t1.start);
      const eM = T.minutesOf(t2.end);
      let status = 'before';
      let statusText = '';
      if (nowM >= eM) {
        status = 'done';
        statusText = '已结束';
      } else if (nowM >= sM) {
        status = 'doing';
        statusText = '上课中';
      } else {
        const gap = sM - nowM;
        if (settings.remindEnabled && gap <= settings.remindMinutes) {
          status = 'soon';
          statusText = gap + ' 分钟后上课';
        } else if (gap >= 60) {
          statusText = '距开始 ' + Math.floor(gap / 60) + '小时' + (gap % 60) + '分';
        } else {
          statusText = gap + ' 分钟后';
        }
      }
      return Object.assign({}, c, {
        timeText: t1.start + ' - ' + t2.end + ' · 第' + c.startSection + '-' + c.endSection + '节',
        status: status,
        statusText: statusText
      });
    });

    let banner = null;
    if (settings.remindEnabled) {
      const near = items.find(function (i) { return i.status === 'soon' || i.status === 'doing'; });
      if (near) {
        const loc = near.location ? ' @ ' + near.location : '';
        banner = near.status === 'doing'
          ? '正在上课：' + near.name + loc
          : near.statusText + '：' + near.name + loc;
      }
    }

    let emptyText = '今天没有课，好好休息一下吧';
    if (all.length === 0) {
      emptyText = '还没有课程，点「添加课程」开始吧';
    } else if (curWeek > maxWeek) {
      emptyText = '本学期已结束，可在「设置 - 学期」开启新学期';
    }

    this.setData({
      dateText: (now.getMonth() + 1) + ' 月 ' + now.getDate() + ' 日',
      weekCn: WEEK_CN[day],
      weekNum: weekNum,
      items: items,
      banner: banner,
      emptyText: emptyText
    });
  },

  openCourse(e) {
    wx.navigateTo({ url: '/pages/edit/edit?id=' + e.currentTarget.dataset.id });
  },

  goEdit() {
    wx.navigateTo({ url: '/pages/edit/edit' });
  },

  goWeek() {
    wx.switchTab({ url: '/pages/week/week' });
  }
});
