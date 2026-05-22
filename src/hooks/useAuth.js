import React, { createContext, useContext, useState, useEffect } from 'react';
import { getUserRole } from '../utils/sheets';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('bchs_user');
    if (stored) {
      try { setUser(JSON.parse(stored)); } catch { localStorage.removeItem('bchs_user'); }
    }
    setLoading(false);
  }, []);

  const loginWithGoogle = async (googleCredential) => {
    // Decode the JWT from Google
    const payload = parseJwt(googleCredential.credential);
    const email = payload.email;
    const name = payload.name;
    const picture = payload.picture;

    // Look up role in Google Sheet
    let roleData = await getUserRole(email);

    // Dev fallback: if sheet not configured yet, grant system leader access
    // REMOVE THIS in production once your Users sheet is set up
    if (!roleData && process.env.NODE_ENV === 'development') {
      roleData = { email, role: 'system_leader', schoolId: 'all', schoolName: 'All Schools' };
    }

    if (!roleData) {
      throw new Error(`No access found for ${email}. Ask your system administrator to add you to the Users sheet.`);
    }

    const userData = {
      email,
      name,
      picture,
      role: roleData.role,       // 'coordinator' | 'system_leader' | 'admin'
      schoolId: roleData.schoolId,
      schoolName: roleData.schoolName,
      accessToken: googleCredential.access_token || null,
      credential: googleCredential.credential,
    };

    setUser(userData);
    localStorage.setItem('bchs_user', JSON.stringify(userData));
    return userData;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('bchs_user');
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginWithGoogle, logout }}>
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
