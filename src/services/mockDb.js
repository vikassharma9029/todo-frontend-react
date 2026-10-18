// Tiny fake backend persisted in localStorage. Mimics API responses & errors.
const read = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } };
const write = (k, v) => localStorage.setItem(k, JSON.stringify(v));
export const delay = (ms = 300) => new Promise((r) => setTimeout(r, ms));
export const fail = (status, message, errors) => Promise.reject({ response: { status, data: { message, errors } } });
export const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

const day = (n) => new Date(Date.now() + n * 864e5).toISOString().slice(0, 10);
const seedTodos = (userId) => [
  ['Prepare sprint demo', 'Slides and a short live walkthrough', 'in_progress', 'high', day(2)],
  ['Renew car insurance', 'Compare two quotes first', 'todo', 'medium', day(-3)],
  ['Book dentist appointment', '', 'todo', 'low', day(10)],
  ['Review pull requests', 'Auth module and API client', 'done', 'medium', day(-1)],
  ['Plan weekend trip', 'Hotels and train tickets', 'todo', 'low', day(14)],
  ['Write unit tests', 'Cover validation helpers', 'in_progress', 'high', day(1)],
  ['Pay electricity bill', '', 'done', 'high', day(-5)],
  ['Read React docs', 'Server components chapter', 'todo', 'medium', day(7)],
  ['Clean up inbox', '', 'done', 'low', ''],
  ['Update resume', 'Add latest project', 'todo', 'medium', day(5)],
  ['Grocery shopping', 'Milk, eggs, rice', 'todo', 'low', day(0)],
  ['Fix login bug', 'Token refresh edge case', 'in_progress', 'high', day(-2)],
].map(([title, description, status, priority, dueDate], i) => ({
  id: uid(), userId, title, description, status, priority, dueDate,
  createdAt: new Date(Date.now() - i * 36e5 * 5).toISOString(), updatedAt: new Date().toISOString(),
}));

export const db = {
  users: () => {
    let u = read('tb_users', null);
    if (!u) {
      u = [{ id: 'u_demo', fullName: 'Demo User', email: 'demo@example.com', password: 'Demo@1234', phone: '+919999999999',
        country: 'India', role: 'Developer', interests: ['Work', 'Learning'], notifications: ['Email'] }];
      write('tb_users', u); write('tb_todos', seedTodos('u_demo'));
    }
    return u;
  },
  saveUsers: (u) => write('tb_users', u),
  todos: () => { db.users(); return read('tb_todos', []); },
  saveTodos: (t) => write('tb_todos', t),
};
export const publicUser = ({ password, ...u }) => u;
