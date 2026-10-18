import http, { USE_MOCK } from './http';
import { tokenStore } from './tokenStore';
import { db, delay, fail, uid } from './mockDb';

const me = () => (tokenStore.get() || '').replace('mock-token-', '');
const today = () => new Date().toISOString().slice(0, 10);
const mine = () => db.todos().filter((t) => t.userId === me());

const mockTodos = {
  async list({ page = 1, limit = 10, search = '', status = '', priority = '', sortBy = 'createdAt', order = 'desc' }) {
    await delay(250);
    const s = search.trim().toLowerCase();
    const rows = mine().filter((t) =>
      (!s || t.title.toLowerCase().includes(s) || t.description.toLowerCase().includes(s)) &&
      (!status || t.status === status) && (!priority || t.priority === priority));
    const rank = { low: 1, medium: 2, high: 3 };
    const key = (t) => (sortBy === 'priority' ? rank[t.priority] : (t[sortBy] ?? '').toString().toLowerCase());
    rows.sort((a, b) => (key(a) > key(b) ? 1 : key(a) < key(b) ? -1 : 0) * (order === 'asc' ? 1 : -1));
    return { data: rows.slice((page - 1) * limit, page * limit), total: rows.length, page, limit };
  },
  async stats() {
    await delay(200);
    const rows = mine();
    const count = (f, v) => rows.filter((t) => t[f] === v).length;
    return {
      total: rows.length,
      byStatus: { todo: count('status', 'todo'), in_progress: count('status', 'in_progress'), done: count('status', 'done') },
      byPriority: { low: count('priority', 'low'), medium: count('priority', 'medium'), high: count('priority', 'high') },
      overdue: rows.filter((t) => t.dueDate && t.dueDate < today() && t.status !== 'done').length,
    };
  },
  async create(p) {
    await delay();
    const now = new Date().toISOString();
    const todo = { id: uid(), userId: me(), ...p, createdAt: now, updatedAt: now };
    db.saveTodos([todo, ...db.todos()]);
    return todo;
  },
  async update(id, p) {
    await delay(200);
    const all = db.todos();
    const i = all.findIndex((t) => t.id === id && t.userId === me());
    if (i < 0) return fail(404, 'Todo not found');
    all[i] = { ...all[i], ...p, updatedAt: new Date().toISOString() };
    db.saveTodos(all);
    return all[i];
  },
  async remove(id) {
    await delay(200);
    const all = db.todos();
    if (!all.some((t) => t.id === id && t.userId === me())) return fail(404, 'Todo not found');
    db.saveTodos(all.filter((t) => t.id !== id));
    return {};
  },
};

const realTodos = {
  list: (params) => http.get('/todos', { params }).then((r) => r.data),
  stats: () => http.get('/dashboard/stats').then((r) => r.data),
  create: (p) => http.post('/todos', p).then((r) => r.data),
  update: (id, p) => http.patch(`/todos/${id}`, p).then((r) => r.data),
  remove: (id) => http.delete(`/todos/${id}`).then((r) => r.data),
};

export const todoApi = USE_MOCK ? mockTodos : realTodos;
