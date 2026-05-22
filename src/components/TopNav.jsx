import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { SCHOOLS } from '../data/schoolData';

const TABS = [
  { id: 'home',       label: 'Home',             icon: '⌂' },
  { id: 'system',     label: 'System View',      icon: '⊞', systemOnly: true },
  { id: 'overview',   label: 'School Overview',  icon: '⬡' },
  { id: 'data',       label: 'Data Review',      icon: '▦' },
  { id: 'partners',   label: 'Partner Quality',  icon: '◎' },
  { id: 'selfassess', label: 'Self-Assessment',  icon: '✓' },
  { id: 'kpi',        label: 'KPI Tracker',      icon: '◈' },
];

export default function TopNav({ activeTab, onTabChange, selectedSchool, onSchoolChange }) {
  const { user, logout } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const isSystemLeader = user?.role === 'system_leader' || user?.role === 'admin' || user?.role === 'guest';
  const visibleTabs = TABS.filter(t => !t.systemOnly || isSystemLeader);
  const isSystemView = activeTab === 'system';

  return (
    <div>
      <div style={{
        background: '#1a2744', padding: '0 20px', display: 'flex',
        alignItems: 'center', justifyContent: 'space-between', height: 52,
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 30, height: 30, background: '#E07B3A', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, color: 'white' }}>◎</div>
          <div>
            <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Boston Community Hub Schools</div>
            <div style={{ color: 'white', fontSize: 14, fontWeight: 600, lineHeight: 1.2, letterSpacing: '0.02em' }}>BCHS Pulse</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* School selector — shows "System-wide" when on system tab */}
          {isSystemLeader && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {isSystemView ? (
                <div style={{ background: 'rgba(224,123,58,0.15)', border: '0.5px solid rgba(224,123,58,0.4)', color: '#E07B3A', borderRadius: 6, padding: '5px 12px', fontSize: 12, fontWeight: 500 }}>
                  System-wide
                </div>
              ) : (
                <select
                  value={selectedSchool}
                  onChange={e => onSchoolChange(e.target.value)}
                  style={{
                    background: 'rgba(255,255,255,0.08)', border: '0.5px solid rgba(255,255,255,0.15)',
                    color: 'white', borderRadius: 6, padding: '5px 10px', fontSize: 12,
                    cursor: 'pointer', width: 'auto',
                  }}
                >
                  {SCHOOLS.map(s => (
                    <option key={s.id} value={s.id} style={{ background: '#1e2a3a', color: 'white' }}>{s.short}</option>
                  ))}
                </select>
              )}
            </div>
          )}

          {/* User menu */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowMenu(v => !v)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.07)',
                border: '0.5px solid rgba(255,255,255,0.12)', borderRadius: 8, padding: '5px 10px',
                cursor: 'pointer', color: 'white',
              }}
            >
              {user?.picture ? (
                <img src={user.picture} alt="" style={{ width: 24, height: 24, borderRadius: '50%' }} />
              ) : (
                <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#E07B3A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 500 }}>
                  {user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
              )}
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: 12, fontWeight: 500, lineHeight: 1.3 }}>{user?.name}</div>
                <div style={{ fontSize: 10, opacity: 0.5 }}>
                  {user?.role === 'system_leader' ? 'System Leader' : user?.role === 'guest' ? 'Guest' : user?.role === 'admin' ? 'Admin' : `Coordinator · ${user?.schoolName}`}
                </div>
              </div>
              <span style={{ fontSize: 10, opacity: 0.4 }}>▾</span>
            </button>

            {showMenu && (
              <div style={{
                position: 'absolute', right: 0, top: '110%', background: '#1e2a3a',
                border: '0.5px solid rgba(255,255,255,0.14)', borderRadius: 10,
                boxShadow: '0 4px 16px rgba(0,0,0,0.4)', minWidth: 190, zIndex: 200, overflow: 'hidden',
              }}>
                <div style={{ padding: '11px 14px', borderBottom: '0.5px solid rgba(255,255,255,0.07)' }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: '#e2e0db' }}>{user?.email}</div>
                  <div style={{ fontSize: 11, color: '#8b8885', marginTop: 2 }}>
                    {user?.role === 'system_leader' ? 'System Leader — All Schools' : user?.role === 'guest' ? 'Guest — read only' : `Coordinator · ${user?.schoolName}`}
                  </div>
                </div>
                <button onClick={() => { setShowMenu(false); logout(); }} style={{ width: '100%', padding: '10px 14px', textAlign: 'left', background: 'none', fontSize: 13, color: '#F09595', cursor: 'pointer', display: 'block' }}>
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <div style={{ background: '#243258', display: 'flex', padding: '0 20px', overflowX: 'auto', position: 'sticky', top: 52, zIndex: 99 }}>
        {visibleTabs.map(tab => (
          <button key={tab.id} onClick={() => onTabChange(tab.id)} style={{
            padding: '10px 14px', fontSize: 12, whiteSpace: 'nowrap',
            color: activeTab === tab.id ? 'white' : 'rgba(255,255,255,0.45)',
            background: 'none', cursor: 'pointer',
            borderBottom: activeTab === tab.id ? '2px solid #E07B3A' : '2px solid transparent',
            transition: 'color 0.15s',
          }}>
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}
