import React from 'react';
import { useAuth } from '../hooks/useAuth';

export default function HomePage({ onNavigate }) {
  const { user } = useAuth();
  const isSystem = user?.role === 'system_leader' || user?.role === 'admin' || user?.role === 'guest';

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '60px 20px' }}>

      {/* Hero */}
      <div style={{ textAlign: 'center', marginBottom: 64 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
          <div style={{ width: 64, height: 64, background: '#E07B3A', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, color: 'white' }}>◎</div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: 14, fontWeight: 500, color: '#E07B3A', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Boston Community Hub Schools</div>
            <div style={{ fontSize: 48, fontWeight: 700, color: '#e2e0db', lineHeight: 1.05, letterSpacing: '-0.01em' }}>BCHS Pulse</div>
          </div>
        </div>
        <p style={{ fontSize: 20, color: '#8b8885', lineHeight: 1.7, maxWidth: 600, margin: '0 auto' }}>
          The central platform for tracking Assets & Opportunity Assessments and Key Practice Indicators across Boston Community Hub Schools.
        </p>
      </div>

      {/* Welcome card */}
      <div style={{ background: '#1e2a3a', borderRadius: 12, padding: '24px 28px', marginBottom: 28, borderLeft: '4px solid #E07B3A' }}>
        <div style={{ fontSize: 15, color: '#8b8885', marginBottom: 4 }}>Welcome back</div>
        <div style={{ fontSize: 24, fontWeight: 500, color: '#e2e0db' }}>{user?.name}</div>
        <div style={{ fontSize: 15, color: '#8b8885', marginTop: 4 }}>
          {user?.role === 'system_leader' ? 'System Leader — access to all 20 Hub Schools' :
           user?.role === 'guest' ? 'Guest — read-only access' :
           `Coordinator — ${user?.schoolName}`}
        </div>
      </div>

      {/* Quick nav cards */}
      <div style={{ display: 'grid', gridTemplateColumns: isSystem ? 'repeat(3,1fr)' : 'repeat(2,1fr)', gap: 14, marginBottom: 40 }}>
        {isSystem && (
          <button onClick={() => onNavigate('system')} style={{
            background: '#1e2a3a', borderRadius: 12, padding: '24px 22px', textAlign: 'left',
            border: '0.5px solid rgba(255,255,255,0.08)', cursor: 'pointer', transition: 'border-color 0.15s',
          }}
            onMouseEnter={e => e.currentTarget.style.borderColor = '#E07B3A'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'}
          >
            <div style={{ fontSize: 28, marginBottom: 12 }}>⊞</div>
            <div style={{ fontSize: 18, fontWeight: 500, color: '#e2e0db', marginBottom: 6 }}>System View</div>
            <div style={{ fontSize: 14, color: '#8b8885', lineHeight: 1.6 }}>System-wide dashboard across all 20 schools with 3-year trends and QSP metrics.</div>
          </button>
        )}
        <button onClick={() => onNavigate('overview')} style={{
          background: '#1e2a3a', borderRadius: 12, padding: '24px 22px', textAlign: 'left',
          border: '0.5px solid rgba(255,255,255,0.08)', cursor: 'pointer', transition: 'border-color 0.15s',
        }}
          onMouseEnter={e => e.currentTarget.style.borderColor = '#E07B3A'}
          onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'}
        >
          <div style={{ fontSize: 28, marginBottom: 12 }}>⬡</div>
          <div style={{ fontSize: 18, fontWeight: 500, color: '#e2e0db', marginBottom: 6 }}>School Overview</div>
          <div style={{ fontSize: 14, color: '#8b8885', lineHeight: 1.6 }}>AOA team, QSP goals, leadership teams, and school profile.</div>
        </button>
        <button onClick={() => onNavigate('kpi')} style={{
          background: '#1e2a3a', borderRadius: 12, padding: '24px 22px', textAlign: 'left',
          border: '0.5px solid rgba(255,255,255,0.08)', cursor: 'pointer', transition: 'border-color 0.15s',
        }}
          onMouseEnter={e => e.currentTarget.style.borderColor = '#E07B3A'}
          onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'}
        >
          <div style={{ fontSize: 28, marginBottom: 12 }}>◈</div>
          <div style={{ fontSize: 18, fontWeight: 500, color: '#e2e0db', marginBottom: 6 }}>KPI Tracker</div>
          <div style={{ fontSize: 14, color: '#8b8885', lineHeight: 1.6 }}>Track intervention progress, completion rates, and endline results.</div>
        </button>
      </div>

      {/* What is this */}
      <div style={{ background: '#1e2a3a', borderRadius: 12, padding: '24px 28px', marginBottom: 24 }}>
        <div style={{ fontSize: 18, fontWeight: 500, color: '#e2e0db', marginBottom: 20 }}>What is BCHS Pulse?</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          {[
            { icon: '▦', title: 'Assets & Opportunity Assessment', desc: 'Track each school\'s AOA across all six sections — data review, partner quality, self-assessment, priorities, and KPIs.' },
            { icon: '◈', title: 'Key Practice Indicators', desc: 'Monitor intervention implementation and completion rates. Coordinators update progress directly in the platform.' },
            { icon: '⊞', title: 'System-wide View', desc: 'Compare all 20 Hub Schools on the four core QSP metrics — attendance, chronic absenteeism, belonging, and academics.' },
            { icon: '◎', title: 'Real data, one place', desc: 'Built directly from coordinator-submitted AOA workbooks. Powered by Google Sheets so data stays in tools teams already use.' },
          ].map(item => (
            <div key={item.title} style={{ display: 'flex', gap: 14 }}>
              <div style={{ fontSize: 22, color: '#E07B3A', flexShrink: 0, marginTop: 2 }}>{item.icon}</div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 500, color: '#e2e0db', marginBottom: 5 }}>{item.title}</div>
                <div style={{ fontSize: 14, color: '#8b8885', lineHeight: 1.6 }}>{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ textAlign: 'center', fontSize: 13, color: '#555350', marginTop: 8 }}>
        YMCA of Greater Boston · Boston Community Hub Schools · SY25-26
      </div>
    </div>
  );
}
