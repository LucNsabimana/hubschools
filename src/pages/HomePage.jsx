import React from 'react';
import { useAuth } from '../hooks/useAuth';

export default function HomePage({ onNavigate }) {
  const { user } = useAuth();
  const isSystem = user?.role === 'system_leader' || user?.role === 'admin' || user?.role === 'guest';

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 20px' }}>

      {/* Hero */}
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <div style={{ width: 44, height: 44, background: '#E07B3A', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, color: 'white' }}>◎</div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: 11, fontWeight: 500, color: '#E07B3A', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Boston Community Hub Schools</div>
            <div style={{ fontSize: 26, fontWeight: 600, color: '#e2e0db', lineHeight: 1.1 }}>BCHS Pulse</div>
          </div>
        </div>
        <p style={{ fontSize: 15, color: '#8b8885', lineHeight: 1.7, maxWidth: 560, margin: '0 auto' }}>
          The central platform for tracking Assets & Opportunity Assessments and Key Practice Indicators across Boston Community Hub Schools.
        </p>
      </div>

      {/* Welcome card */}
      <div style={{ background: '#1e2a3a', borderRadius: 12, padding: '20px 24px', marginBottom: 24, borderLeft: '3px solid #E07B3A' }}>
        <div style={{ fontSize: 13, color: '#8b8885', marginBottom: 2 }}>Welcome back</div>
        <div style={{ fontSize: 16, fontWeight: 500, color: '#e2e0db' }}>{user?.name}</div>
        <div style={{ fontSize: 12, color: '#8b8885', marginTop: 2 }}>
          {user?.role === 'system_leader' ? 'System Leader — access to all 20 Hub Schools' :
           user?.role === 'guest' ? 'Guest — read-only access' :
           `Coordinator — ${user?.schoolName}`}
        </div>
      </div>

      {/* Quick nav cards */}
      <div style={{ display: 'grid', gridTemplateColumns: isSystem ? 'repeat(3,1fr)' : 'repeat(2,1fr)', gap: 12, marginBottom: 32 }}>
        {isSystem && (
          <button onClick={() => onNavigate('system')} style={{
            background: '#1e2a3a', borderRadius: 10, padding: '18px 20px', textAlign: 'left',
            border: '0.5px solid rgba(255,255,255,0.08)', cursor: 'pointer',
            transition: 'border-color 0.15s',
          }}
            onMouseEnter={e => e.currentTarget.style.borderColor = '#E07B3A'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'}
          >
            <div style={{ fontSize: 20, marginBottom: 8 }}>⊞</div>
            <div style={{ fontSize: 13, fontWeight: 500, color: '#e2e0db', marginBottom: 4 }}>System View</div>
            <div style={{ fontSize: 11, color: '#8b8885', lineHeight: 1.5 }}>System-wide dashboard across all 20 schools with 3-year trends and QSP metrics.</div>
          </button>
        )}
        <button onClick={() => onNavigate('overview')} style={{
          background: '#1e2a3a', borderRadius: 10, padding: '18px 20px', textAlign: 'left',
          border: '0.5px solid rgba(255,255,255,0.08)', cursor: 'pointer',
          transition: 'border-color 0.15s',
        }}
          onMouseEnter={e => e.currentTarget.style.borderColor = '#E07B3A'}
          onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'}
        >
          <div style={{ fontSize: 20, marginBottom: 8 }}>⬡</div>
          <div style={{ fontSize: 13, fontWeight: 500, color: '#e2e0db', marginBottom: 4 }}>School Overview</div>
          <div style={{ fontSize: 11, color: '#8b8885', lineHeight: 1.5 }}>AOA team, QSP goals, leadership teams, and school profile.</div>
        </button>
        <button onClick={() => onNavigate('kpi')} style={{
          background: '#1e2a3a', borderRadius: 10, padding: '18px 20px', textAlign: 'left',
          border: '0.5px solid rgba(255,255,255,0.08)', cursor: 'pointer',
          transition: 'border-color 0.15s',
        }}
          onMouseEnter={e => e.currentTarget.style.borderColor = '#E07B3A'}
          onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'}
        >
          <div style={{ fontSize: 20, marginBottom: 8 }}>◈</div>
          <div style={{ fontSize: 13, fontWeight: 500, color: '#e2e0db', marginBottom: 4 }}>KPI Tracker</div>
          <div style={{ fontSize: 11, color: '#8b8885', lineHeight: 1.5 }}>Track intervention progress, completion rates, and endline results.</div>
        </button>
      </div>

      {/* What is this */}
      <div style={{ background: '#1e2a3a', borderRadius: 12, padding: '20px 24px', marginBottom: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: '#e2e0db', marginBottom: 12 }}>What is BCHS Pulse?</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {[
            { icon: '▦', title: 'Assets & Opportunity Assessment', desc: 'Track each school\'s AOA across all six sections — data review, partner quality, self-assessment, priorities, and KPIs.' },
            { icon: '◈', title: 'Key Practice Indicators', desc: 'Monitor intervention implementation and completion rates. Coordinators update progress directly in the platform.' },
            { icon: '⊞', title: 'System-wide View', desc: 'Compare all 20 Hub Schools on the four core QSP metrics — attendance, chronic absenteeism, belonging, and academics.' },
            { icon: '◎', title: 'Real data, one place', desc: 'Built directly from coordinator-submitted AOA workbooks. Powered by Google Sheets so data stays in tools teams already use.' },
          ].map(item => (
            <div key={item.title} style={{ display: 'flex', gap: 10 }}>
              <div style={{ fontSize: 16, color: '#E07B3A', flexShrink: 0, marginTop: 1 }}>{item.icon}</div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 500, color: '#e2e0db', marginBottom: 3 }}>{item.title}</div>
                <div style={{ fontSize: 11, color: '#8b8885', lineHeight: 1.6 }}>{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ textAlign: 'center', fontSize: 11, color: '#555350' }}>
        YMCA of Greater Boston · Boston Community Hub Schools · SY25-26
      </div>
    </div>
  );
}
