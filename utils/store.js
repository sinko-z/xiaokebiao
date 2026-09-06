// 课表数据的本地存储（仅本地，不上传）
const COURSES_KEY = 'kb_courses_v1';
const SETTINGS_KEY = 'kb_settings_v1';

// 课程卡片配色
const COLORS = [
  '#4C7DFF', '#00B578', '#FFAA15', '#FA5151', '#9C6BFF',
  '#00A6C7', '#FF7D4D', '#F76FA6', '#7CB518', '#5A6B87'
];

// 默认节次时间（可在「设置」中修改）
const DEFAULT_SECTION_TIMES = [
  { start: '08:00', end: '08:50' },
  { start: '09:00', end: '09:50' },
  { start: '10:10', end: '11:00' },
  { start: '11:10', end: '12:00' },
  { start: '14:00', end: '14:50' },
  { start: '15:00', end: '15:50' },
  { start: '16:10', end: '17:00' },
  { start: '17:10', end: '18:00' },
  { start: '19:00', end: '19:50' },
  { start: '20:00', end: '20:50' },
  { start: '21:00', end: '21:50' }
];

function uid() {
  return 'c' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function defaultSettings() {
  return {
    semesterStart: '2026-08-31', // 开学第一周的周一
    maxWeek: 25,
    sectionTimes: DEFAULT_SECTION_TIMES.map(function (t) {
      return { start: t.start, end: t.end };
    }),
    remindEnabled: true,
    remindMinutes: 15
  };
}

function getSettings() {
  try {
    const s = wx.getStorageSync(SETTINGS_KEY);
    if (s && s.semesterStart && Array.isArray(s.sectionTimes) && s.sectionTimes.length) {
      return s;
    }
  } catch (e) {}
  const d = defaultSettings();
  saveSettings(d);
  return d;
}

function saveSettings(s) {
  wx.setStorageSync(SETTINGS_KEY, s);
}

function getCourses() {
  try {
    const c = wx.getStorageSync(COURSES_KEY);
    if (Array.isArray(c)) return c;
  } catch (e) {}
  return [];
}

function saveCourses(list) {
  wx.setStorageSync(COURSES_KEY, list || []);
}

function upsertCourse(course) {
  const list = getCourses();
  if (course.id) {
    const idx = list.findIndex(function (x) { return x.id === course.id; });
    if (idx > -1) {
      list[idx] = course;
    } else {
      list.push(course);
    }
  } else {
    course.id = uid();
    list.push(course);
  }
  saveCourses(list);
  return course;
}

function removeCourse(id) {
  saveCourses(getCourses().filter(function (c) { return c.id !== id; }));
}

// 示例课表（首次体验用）
function loadDemoCourses() {
  function range(s, e) {
    const arr = [];
    for (let i = s; i <= e; i++) arr.push(i);
    return arr;
  }
  const all16 = range(1, 16);
  const odd = all16.filter(function (w) { return w % 2 === 1; });
  const even = all16.filter(function (w) { return w % 2 === 0; });
  function mk(name, teacher, location, day, s, e, weeks, colorIdx) {
    return {
      id: uid(),
      name: name,
      teacher: teacher,
      location: location,
      day: day,
      startSection: s,
      endSection: e,
      weeks: weeks,
      color: COLORS[colorIdx % COLORS.length],
      note: ''
    };
  }
  const list = [
    mk('高等数学', '王立群', '教三 302', 1, 1, 2, all16, 0),
    mk('大学英语', '李梅', '外语楼 105', 1, 3, 4, all16, 1),
    mk('数据结构', '张伟', '机房 B201', 2, 3, 4, all16, 4),
    mk('数据结构（单周）', '张伟', '机房 B201', 4, 1, 2, odd, 4),
    mk('大学物理', '陈刚', '教一 201', 3, 5, 6, all16, 3),
    mk('程序设计实践', '刘洋', '机房 A305', 3, 8, 9, range(6, 16), 6),
    mk('线性代数', '赵敏', '教三 108', 5, 1, 2, even, 2),
    mk('体育', '孙健', '田径场', 5, 7, 8, all16, 7),
    mk('形势与政策', '周涛', '教二 301', 2, 10, 11, range(1, 8), 5)
  ];
  saveCourses(list);
  return list;
}

module.exports = {
  COLORS: COLORS,
  DEFAULT_SECTION_TIMES: DEFAULT_SECTION_TIMES,
  defaultSettings: defaultSettings,
  getSettings: getSettings,
  saveSettings: saveSettings,
  getCourses: getCourses,
  saveCourses: saveCourses,
  upsertCourse: upsertCourse,
  removeCourse: removeCourse,
  loadDemoCourses: loadDemoCourses,
  uid: uid
};
