import http, { USE_MOCK } from './http';
import { tokenStore } from './tokenStore';
import { db, delay, fail, uid, publicUser } from './mockDb';

const mockAuth = {
  async login({ email, password }) {
    await delay();
    const u = db.users().find((x) => x.email.toLowerCase() === email.toLowerCase());
    if (!u || u.password !== password) return fail(401, 'Invalid email or password');
    return { user: publicUser(u), accessToken: `mock-token-${u.id}` };
  },
  async register(payload) {
    await delay();
    const users = db.users();
    if (users.some((x) => x.email.toLowerCase() === payload.email.toLowerCase()))
      return fail(409, 'Email already registered', { email: 'This email is already in use' });
    const { confirmPassword, terms, ...rest } = payload;
    const user = { id: uid(), ...rest };
    db.saveUsers([...users, user]);
    return { user: publicUser(user), accessToken: `mock-token-${user.id}` };
  },
  async me() {
    await delay(150);
    const id = (tokenStore.get() || '').replace('mock-token-', '');
    const u = db.users().find((x) => x.id === id);
    return u ? { user: publicUser(u) } : fail(401, 'Session expired');
  },
  async logout() { await delay(100); return {}; },
};

const realAuth = {
  login: (p) => http.post('/auth/login', p).then((r) => r.data),
  register: (p) => http.post('/auth/register', p).then((r) => r.data),
  me: () => http.get('/auth/me').then((r) => r.data),
  logout: () => http.post('/auth/logout').then((r) => r.data),
};

export const authApi = USE_MOCK ? mockAuth : realAuth;
