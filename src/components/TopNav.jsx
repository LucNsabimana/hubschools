import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { SCHOOLS } from '../data/schoolData';
import { FontSizeControl } from './FontSizeControl';

const TABS = [
  { id: 'overview',   label: 'School Overview',  icon: '⬡' },
  { id: 'data',       label: 'Data Review',       icon: '▦' },
  { id: 'partners',   label: 'Partner Quality',   icon: '◎' },
  { id: 'selfassess', label: 'Self-Assessment',   icon: '✓' },
  { id: 'kpi',        label: 'KPI Tracker',       icon: '◈' },
  { id: 'system',     label: 'System View',       icon: '⊞', systemOnly: true },
];

export default function TopNav({ activeTab, onTabChange, selectedSchool, onSchoolChange, fontSize, onIncrease, onDecrease }) {
  const { user, logout } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const isSystemLeader = user?.role === 'system_leader' || user?.role === 'admin' || user?.role === 'guest';
  const visibleTabs = TABS.filter(t => !t.systemOnly || isSystemLeader);

  return (
    <div>
      <div style={{
        background: 'var(--navy)', padding: '0 16px', display: 'flex',
        alignItems: 'center', justifyContent: 'space-between', height: 50,
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 28, height: 28, background: 'var(--orange)', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: 'white' }}>◎</div>
          <div>
            <div style={{ color: 'white', fontSize: 12, fontWeight: 500, lineHeight: 1.2 }}>Boston Community Hub Schools</div>
            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 10 }}>Assets & Opportunity Assessment Platform</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <FontSizeControl size={fontSize} increase={onIncrease} decrease={onDecrease} />

          {isSystemLeader && (
            <select
              value={selectedSchool}
              onChange={e => onSchoolChange(e.target.value)}
              style={{
                background: 'rgba(255,255,255,0.08)', border: '0.5px solid rgba(255,255,255,0.15)',
                color: 'white', borderRadius: 6, padding: '4px 8px', fontSize: 11,
                cursor: 'pointer', width: 'auto',
              }}
            >
              {SCHOOLS.map(s => (
                <option key={s.id} value={s.id} style={{ background: 'var(--navy)', color: 'white' }}>{s.short}</option>
              ))}
            </select>
          )}

          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowMenu(v => !v)}
              style={{
                display: 'flex', alignItems: 'center', gap: 7, background: 'rgba(255,255,255,0.06)',
                border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: 7, padding: '4px 8px',
                cursor: 'pointer', color: 'white',
              }}
            >
              {user?.picture ? (
                <img src={user.picture} alt="" style={{ width: 22, height: 22, borderRadius: '50%' }} />
              ) : (
                <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--orange)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 500 }}>
                  {user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
              )}
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: 11, fontWeight: 500, lineHeight: 1.2 }}>{user?.name}</div>
                <div style={{ fontSize: 9, opacity: 0.5 }}>
                  {user?.role === 'system_leader' ? 'System Leader' : user?.role === 'guest' ? 'Guest' : user?.role === 'admin' ? 'Admin' : `Coordinator · ${user?.schoolName}`}
                </div>
              </div>
              <span style={{ fontSize: 9, opacity: 0.4 }}>▾</span>
            </button>

            {showMenu && (
              <div style={{
                position: 'absolute', right: 0, top: '110%', background: 'var(--card)',
                border: '0.5px solid var(--border-strong)', borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-md)', minWidth: 180, zIndex: 200, overflow: 'hidden',
              }}>
                <div style={{ padding: '10px 14px', borderBottom: '0.5px solid var(--border)' }}>
                  <div style={{ fontSize: 12, fontWeight: 500 }}>{user?.email}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                    {user?.role === 'system_leader' ? 'System Leader' : user?.role === 'guest' ? 'Guest — read only' : `Coordinator · ${user?.schoolName}`}
                  </div>
                </div>
                <button onClick={() => { setShowMenu(false); logout(); }} style={{ width: '100%', padding: '10px 14px', textAlign: 'left', background: 'none', fontSize: 12, color: '#F09595', cursor: 'pointer', display: 'block' }}>
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={{ background: 'var(--navy-light)', display: 'flex', padding: '0 16px', overflowX: 'auto', position: 'sticky', top: 50, zIndex: 99 }}>
        {visibleTabs.map(tab => (
          <button key={tab.id} onClick={() => onTabChange(tab.id)} style={{
            padding: '9px 13px', fontSize: 11, whiteSpace: 'nowrap',
            color: activeTab === tab.id ? 'white' : 'rgba(255,255,255,0.45)',
            background: 'none', cursor: 'pointer',
            borderBottom: activeTab === tab.id ? '2px solid var(--orange)' : '2px solid transparent',
            transition: 'all 0.15s',
          }}>
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}
