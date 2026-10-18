// Access token lives in memory; sessionStorage only survives a page refresh within the tab.
// PRODUCTION: keep the refresh token in an httpOnly, Secure, SameSite cookie set by the API.
const KEY = 'token';
let token = sessionStorage.getItem(KEY);
export const tokenStore = {
  get: () => token,
  set: (t) => { token = t; sessionStorage.setItem(KEY, t); },
  clear: () => { token = null; sessionStorage.removeItem(KEY); },
};
