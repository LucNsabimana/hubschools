import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { fetchAll } from '../utils/api';

const AuthContext = createContext(null);
const STORAGE_KEY = 'bchs_user';

// Data fetched during sign-in, handed to the DataProvider so it does not fetch twice.
let pendingTabs = null;
export function takePendingTabs() {
  const t = pendingTabs;
  pendingTabs = null;
  return t;
}

function parseJwt(token) {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64));
  } catch {
    return {};
  }
}

const isExpired = user => !user?.expiresAt || Date.now() > user.expiresAt - 60 * 1000;

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
      if (stored && !isExpired(stored)) setUser(stored);
      else localStorage.removeItem(STORAGE_KEY);
    } catch {
      try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
    }
    setLoading(false);
  }, []);

  const loginWithGoogle = async (googleCredential) => {
    const credential = googleCredential.credential;
    const payload = parseJwt(credential);
    // The server verifies the token and looks the email up in the Users tab.
    const { me, tabs } = await fetchAll(credential);
    const userData = {
      email: me.email,
      name: me.name || payload.name,
      picture: me.picture || payload.picture,
      role: me.role,
      schoolId: me.schoolId,
      schoolName: me.schoolName,
      credential,
      expiresAt: (payload.exp || 0) * 1000,
    };
    pendingTabs = tabs;
    setNotice('');
    setUser(userData);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(userData)); } catch { /* ignore */ }
    return userData;
  };

  const logout = useCallback((message = '') => {
    pendingTabs = null;
    setUser(null);
    setNotice(message);
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, notice, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
