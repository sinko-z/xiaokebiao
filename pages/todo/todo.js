const store = require('../../utils/store');
const T = require('../../utils/time');

const WEEK_CN = ['', '周一', '周二', '周三', '周四', '周五', '周六', '周日'];

Page({
  data: {
    dateText: '',
    weekCn: '',
    inputText: '',
    todos: [],
    doneCount: 0,
    percent: 0
  },

  onShow() {
    this.refresh();
  },

  today() {
    return T.formatDate(new Date());
  },

  refresh() {
    const now = new Date();
    const day = now.getDay() === 0 ? 7 : now.getDay();
    const todos = store.getTodos(this.today());
    const doneCount = todos.filter(function (t) { return t.done; }).length;

    this.setData({
      dateText: (now.getMonth() + 1) + ' 月 ' + now.getDate() + ' 日',
      weekCn: WEEK_CN[day],
      todos: todos,
      doneCount: doneCount,
      percent: todos.length ? Math.round(doneCount * 100 / todos.length) : 0
    });
  },

  onInput(e) {
    this.setData({ inputText: e.detail.value });
  },

  onAdd() {
    const text = String(this.data.inputText || '').trim();
    if (!text) {
      wx.showToast({ title: '先写点内容吧', icon: 'none' });
      return;
    }
    store.addTodo(this.today(), text);
    this.setData({ inputText: '' });
    this.refresh();
  },

  toggle(e) {
    store.toggleTodo(this.today(), e.currentTarget.dataset.id);
    this.refresh();
  },

  remove(e) {
    const date = this.today();
    const id = e.currentTarget.dataset.id;
    wx.showModal({
      title: '删除待办',
      content: '确定删除这条待办吗？',
      confirmColor: '#FA5151',
      success: (res) => {
        if (!res.confirm) return;
        store.removeTodo(date, id);
        this.refresh();
      }
    });
  },

  clearDone() {
    store.clearDoneTodos(this.today());
    this.refresh();
  }
});
