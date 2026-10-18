import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import http from '../services/http';
import { tokenStore } from '../services/tokenStore';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

const USER_KEY = 'tb_user';
const readUser = () => {
  try { return JSON.parse(sessionStorage.getItem(USER_KEY)); } catch { return null; }
};

export function AuthProvider({ children }) {
  const [user, setUserState] = useState(readUser);   // restored instantly on refresh
  const loading = false;                              // nothing async on load in this version

  const setUser = useCallback((u) => {
    setUserState(u);
    if (u) sessionStorage.setItem(USER_KEY, JSON.stringify(u));
    else sessionStorage.removeItem(USER_KEY);
  }, []);

  // Axios 401 interceptor fires this when the server rejects the session
  useEffect(() => {
    const onLogout = () => setUser(null);
    window.addEventListener('auth:logout', onLogout);
    return () => window.removeEventListener('auth:logout', onLogout);
  }, [setUser]);

  const logout = useCallback(async () => {
    try { await http.post('/logout'); } catch { /* ignore */ }
    tokenStore.clear();
    setUser(null);
  }, [setUser]);

  return (
    <AuthContext.Provider value={{ user, setUser, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}