import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { useAuth, takePendingTabs } from '../hooks/useAuth';
import { fetchAll, AuthError } from '../utils/api';
import { buildData } from './transform';

const DataContext = createContext(null);

export function DataProvider({ children }) {
  const { user, logout } = useAuth();
  const [tabs, setTabs] = useState(() => takePendingTabs());
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setError('');
    try {
      const { tabs: fresh } = await fetchAll(user.credential);
      setTabs(fresh);
    } catch (e) {
      if (e instanceof AuthError) logout(e.message);
      else setError(e.message);
    }
  }, [user, logout]);

  useEffect(() => { if (!tabs) load(); }, [tabs, load]);

  const data = useMemo(() => (tabs ? buildData(tabs) : null), [tabs]);

  if (error) {
    return (
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center', justifyContent: 'center', color: '#e2e0db', fontSize: 13, padding: 20, textAlign: 'center' }}>
        <div>Could not load data from the spreadsheet.</div>
        <div style={{ color: '#F09595', maxWidth: 520 }}>{error}</div>
        <button onClick={load} style={{ background: '#E07B3A', color: 'white', border: 'none', borderRadius: 6, padding: '6px 14px', cursor: 'pointer' }}>Try again</button>
      </div>
    );
  }
  if (!data) {
    return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8b8885', fontSize: 13 }}>Loading data…</div>;
  }

  return <DataContext.Provider value={{ ...data, reload: load }}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used inside <DataProvider>');
  return ctx;
}
