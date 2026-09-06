// 日期与节次相关计算
function pad(n) {
  return n < 10 ? '0' + n : '' + n;
}

function formatDate(d) {
  return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
}

function parseDate(str) {
  const p = String(str || '').split('-');
  return new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2]));
}

// 该日期所在周的周一
function getMonday(d) {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const day = (x.getDay() + 6) % 7; // 周一为 0
  x.setDate(x.getDate() - day);
  return x;
}

// 学期第几周（按两个周一的天数差计算）
function getWeekNumber(semesterStart, date) {
  const s = getMonday(parseDate(semesterStart));
  const m = getMonday(date);
  const diff = Math.round((m.getTime() - s.getTime()) / (7 * 24 * 3600 * 1000));
  return diff + 1;
}

// 课程是否在某周生效（weeks 为周次数组）
function courseOccursInWeek(course, week) {
  if (!course || !Array.isArray(course.weeks)) return false;
  return course.weeks.indexOf(week) > -1;
}

function getCoursesInWeek(courses, week) {
  return (courses || []).filter(function (c) {
    return courseOccursInWeek(c, week);
  });
}

function getSectionTime(settings, section) {
  const t = settings.sectionTimes[section - 1];
  return t ? { start: t.start, end: t.end } : { start: '', end: '' };
}

// 某天的课程，按开始节次排序
function getCoursesOfDay(coursesInWeek, day) {
  return (coursesInWeek || [])
    .filter(function (c) { return c.day === day; })
    .sort(function (a, b) { return a.startSection - b.startSection; });
}

function minutesOf(hhmm) {
  const p = String(hhmm || '0:0').split(':');
  return Number(p[0]) * 60 + Number(p[1]);
}

function nowMinutes() {
  const d = new Date();
  return d.getHours() * 60 + d.getMinutes();
}

// [1,2,3,5,7,8] -> "第 1-3, 5, 7-8 周"
function formatWeeks(weeks) {
  if (!weeks || !weeks.length) return '未选择周次';
  const sorted = weeks.slice().sort(function (a, b) { return a - b; });
  const parts = [];
  let start = sorted[0];
  let prev = sorted[0];
  for (let i = 1; i <= sorted.length; i++) {
    const cur = sorted[i];
    if (cur !== prev + 1) {
      parts.push(start === prev ? String(start) : start + '-' + prev);
      start = cur;
    }
    prev = cur;
  }
  return '第 ' + parts.join(', ') + ' 周';
}

module.exports = {
  pad: pad,
  formatDate: formatDate,
  parseDate: parseDate,
  getMonday: getMonday,
  getWeekNumber: getWeekNumber,
  courseOccursInWeek: courseOccursInWeek,
  getCoursesInWeek: getCoursesInWeek,
  getSectionTime: getSectionTime,
  getCoursesOfDay: getCoursesOfDay,
  minutesOf: minutesOf,
  nowMinutes: nowMinutes,
  formatWeeks: formatWeeks
};
