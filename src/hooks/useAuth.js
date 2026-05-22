import React, { createContext, useContext, useState, useEffect } from 'react';
import { getUserRole } from '../utils/sheets';

const AuthContext = createContext(null);

export const GUEST_USER = {
  email: 'guest@bchs.org',
  name: 'Guest',
  picture: null,
  role: 'guest',
  schoolId: 'mather',
  schoolName: 'Mather Elementary',
  accessToken: null,
  isGuest: true,
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('bchs_user');
    if (stored) {
      try { setUser(JSON.parse(stored)); } catch { localStorage.removeItem('bchs_user'); }
    }
    setLoading(false);
  }, []);

  const loginWithGoogle = async (googleCredential) => {
    const payload = parseJwt(googleCredential.credential);
    const email = payload.email;
    const name = payload.name;
    const picture = payload.picture;

    let roleData = await getUserRole(email);

    if (!roleData && process.env.NODE_ENV === 'development') {
      roleData = { email, role: 'system_leader', schoolId: 'all', schoolName: 'All Schools' };
    }

    if (!roleData) {
      throw new Error(`No access found for ${email}. Ask your system administrator to add you to the Users sheet.`);
    }

    const userData = {
      email, name, picture,
      role: roleData.role,
      schoolId: roleData.schoolId,
      schoolName: roleData.schoolName,
      accessToken: googleCredential.access_token || null,
      credential: googleCredential.credential,
      isGuest: false,
    };

    setUser(userData);
    localStorage.setItem('bchs_user', JSON.stringify(userData));
    return userData;
  };

  const loginAsGuest = () => {
    setUser(GUEST_USER);
    localStorage.setItem('bchs_user', JSON.stringify(GUEST_USER));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('bchs_user');
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginWithGoogle, loginAsGuest, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

function parseJwt(token) {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64));
  } catch {
    return {};
  }
}
