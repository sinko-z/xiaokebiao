const store = require('../../utils/store');
const T = require('../../utils/time');

const DAY_OPTIONS = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];

Page({
  data: {
    id: '',
    name: '',
    teacher: '',
    location: '',
    note: '',
    dayIdx: 0,
    dayOptions: DAY_OPTIONS,
    startSection: 1,
    endSection: 2,
    sectionOptions: [],
    maxWeek: 25,
    weekChips: [],
    colors: store.COLORS,
    colorIdx: 0,
    timePreview: '',
    weeksPreview: '',
    isEdit: false
  },

  onLoad(query) {
    const settings = store.getSettings();
    const maxWeek = settings.maxWeek || 25;
    const sectionOptions = [];
    for (let i = 1; i <= settings.sectionTimes.length; i++) {
      sectionOptions.push('第 ' + i + ' 节');
    }

    const data = {
      maxWeek: maxWeek,
      sectionOptions: sectionOptions,
      weekChips: this.buildChips(maxWeek, [])
    };

    if (query && query.id) {
      const c = store.getCourses().find(function (x) { return x.id === query.id; });
      if (c) {
        data.id = c.id;
        data.isEdit = true;
        data.name = c.name;
        data.teacher = c.teacher || '';
        data.location = c.location || '';
        data.note = c.note || '';
        data.dayIdx = (c.day || 1) - 1;
        data.startSection = c.startSection || 1;
        data.endSection = c.endSection || 1;
        data.weekChips = this.buildChips(maxWeek, c.weeks || []);
        const ci = store.COLORS.indexOf(c.color);
        data.colorIdx = ci > -1 ? ci : 0;
      }
      wx.setNavigationBarTitle({ title: '编辑课程' });
    } else if (query && query.day) {
      data.dayIdx = (Number(query.day) || 1) - 1;
      data.weekChips = this.buildChips(maxWeek, this.rangeWeeks(1, Math.min(16, maxWeek)));
    }

    this.setData(data);
    this.updatePreview();
  },

  buildChips(maxWeek, weeks) {
    const chips = [];
    for (let i = 1; i <= maxWeek; i++) {
      chips.push({ n: i, on: weeks.indexOf(i) > -1 });
    }
    return chips;
  },

  rangeWeeks(s, e) {
    const arr = [];
    for (let i = s; i <= e; i++) arr.push(i);
    return arr;
  },

  selectedWeeks() {
    return this.data.weekChips
      .filter(function (c) { return c.on; })
      .map(function (c) { return c.n; });
  },

  updatePreview() {
    const d = this.data;
    const settings = store.getSettings();
    const t1 = T.getSectionTime(settings, d.startSection);
    const t2 = T.getSectionTime(settings, d.endSection);
    this.setData({
      timePreview: t1.start + ' - ' + t2.end,
      weeksPreview: T.formatWeeks(this.selectedWeeks())
    });
  },

  inputName(e) { this.setData({ name: e.detail.value }); },
  inputTeacher(e) { this.setData({ teacher: e.detail.value }); },
  inputLocation(e) { this.setData({ location: e.detail.value }); },
  inputNote(e) { this.setData({ note: e.detail.value }); },

  onDay(e) {
    this.setData({ dayIdx: Number(e.detail.value) });
  },

  onStartSection(e) {
    const v = Number(e.detail.value) + 1;
    const patch = { startSection: v };
    if (v > this.data.endSection) {
      patch.endSection = Math.min(v, this.data.sectionOptions.length);
    }
    this.setData(patch);
    this.updatePreview();
  },

  onEndSection(e) {
    const v = Number(e.detail.value) + 1;
    if (v < this.data.startSection) {
      wx.showToast({ title: '结束节次不能早于开始节次', icon: 'none' });
      return;
    }
    this.setData({ endSection: v });
    this.updatePreview();
  },

  toggleWeek(e) {
    const n = Number(e.currentTarget.dataset.w);
    const chips = this.data.weekChips.map(function (c) {
      if (c.n === n) return { n: c.n, on: !c.on };
      return c;
    });
    this.setData({ weekChips: chips });
    this.updatePreview();
  },

  applyWeeks(weeks) {
    this.setData({ weekChips: this.buildChips(this.data.maxWeek, weeks) });
    this.updatePreview();
  },

  weeksRange16() {
    this.applyWeeks(this.rangeWeeks(1, Math.min(16, this.data.maxWeek)));
  },

  weeksAll() {
    this.applyWeeks(this.rangeWeeks(1, this.data.maxWeek));
  },

  weeksOdd() {
    this.applyWeeks(this.rangeWeeks(1, this.data.maxWeek).filter(function (w) { return w % 2 === 1; }));
  },

  weeksEven() {
    this.applyWeeks(this.rangeWeeks(1, this.data.maxWeek).filter(function (w) { return w % 2 === 0; }));
  },

  weeksClear() {
    this.applyWeeks([]);
  },

  pickColor(e) {
    this.setData({ colorIdx: Number(e.currentTarget.dataset.i) });
  },

  save() {
    const d = this.data;
    if (!d.name.trim()) {
      wx.showToast({ title: '请填写课程名称', icon: 'none' });
      return;
    }
    const weeks = this.selectedWeeks();
    if (!weeks.length) {
      wx.showToast({ title: '请至少选择一个周次', icon: 'none' });
      return;
    }
    store.upsertCourse({
      id: d.id || undefined,
      name: d.name.trim(),
      teacher: d.teacher.trim(),
      location: d.location.trim(),
      note: d.note.trim(),
      day: d.dayIdx + 1,
      startSection: d.startSection,
      endSection: d.endSection,
      weeks: weeks,
      color: d.colors[d.colorIdx]
    });
    wx.showToast({ title: '已保存', icon: 'success' });
    setTimeout(function () { wx.navigateBack(); }, 400);
  },

  remove() {
    const that = this;
    wx.showModal({
      title: '删除课程',
      content: '确定删除「' + this.data.name + '」吗？',
      confirmColor: '#FA5151',
      success(res) {
        if (res.confirm) {
          store.removeCourse(that.data.id);
          wx.navigateBack();
        }
      }
    });
  }
});
