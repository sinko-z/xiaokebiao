# 小课表 - 项目长期笔记

- 项目：课表微信小程序，原生框架（WXML/WXSS/JS），无云开发，仅本地存储。
- 存储：kb_courses_v1（课程数组）、kb_settings_v1（学期设置）。课程字段：id/name/teacher/location/day(1-7)/startSection/endSection/weeks(周次数组)/color/note。
- 学期：semesterStart 为开学第一周周一（默认 2026-08-31），getWeekNumber 按周一差值计算；maxWeek 默认 25，设置页可改（16-30）。
- 视觉：主色 #4C7DFF，背景 #F5F6FA，圆角卡片；周网格每节 52px；颜色板见 utils/store.js COLORS（10 色）。
- tab 图标由 tools/gen_icons.py 生成（PIL，81px 超采样），改图标跑脚本即可；packOptions.ignore 排除 tools/ 与 preview.html。
- 首次进入周课表页若为空，提供「载入示例课表」按钮。
- 用户称呼「同学」；界面语言简体中文；上课提醒当前为应用内横幅（订阅消息推送需后端，用户已选择不上服务器）。
