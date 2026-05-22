import React from 'react';
import { useAuth } from '../hooks/useAuth';

const Badge = ({ n }) => (
  <div style={{
    width: 28, height: 28, borderRadius: '50%', background: 'rgba(224,123,58,0.15)',
    border: '1px solid rgba(224,123,58,0.35)', color: '#E07B3A',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 11, fontWeight: 600, letterSpacing: '0.02em', marginBottom: 14, flexShrink: 0,
  }}>{String(n).padStart(2,'0')}</div>
);

export default function HomePage({ onNavigate }) {
  const { user } = useAuth();
  const isSystem = user?.role === 'system_leader' || user?.role === 'admin' || user?.role === 'guest';

  const navCards = [
    isSystem && { n: 1, id: 'system',   title: 'System View',      desc: 'System-wide dashboard across all 20 schools with 3-year trends and QSP metrics.' },
                 { n: isSystem ? 2 : 1, id: 'overview',  title: 'School Overview',  desc: 'AOA team, QSP goals, leadership teams, and school profile.' },
                 { n: isSystem ? 3 : 2, id: 'kpi',       title: 'KPI Tracker',      desc: 'Track intervention progress, completion rates, and endline results.' },
  ].filter(Boolean);

  const features = [
    { n: 1, title: 'Assets & Opportunity Assessment', desc: 'Track each school\'s AOA across all six sections — data review, partner quality, self-assessment, priorities, and KPIs.' },
    { n: 2, title: 'Key Practice Indicators',         desc: 'Monitor intervention implementation and completion rates. Coordinators update progress directly in the platform.' },
    { n: 3, title: 'System-wide View',                desc: 'Compare all 20 Hub Schools on the four core QSP metrics — attendance, chronic absenteeism, belonging, and academics.' },
    { n: 4, title: 'Real data, one place',            desc: 'Built directly from coordinator-submitted AOA workbooks. Powered by Google Sheets so data stays in tools teams already use.' },
  ];

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '48px 20px' }}>

      {/* Hero */}
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
          <div style={{ width: 52, height: 52, background: '#E07B3A', borderRadius: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, color: 'white' }}>◎</div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: 12, fontWeight: 500, color: '#E07B3A', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Boston Community Hub Schools</div>
            <div style={{ fontSize: 32, fontWeight: 700, color: '#e2e0db', lineHeight: 1.1, letterSpacing: '-0.01em' }}>BCHS Pulse</div>
          </div>
        </div>
        <p style={{ fontSize: 15, color: '#8b8885', lineHeight: 1.7, maxWidth: 580, margin: '0 auto' }}>
          The central platform for tracking Assets & Opportunity Assessments and Key Practice Indicators across Boston Community Hub Schools.
        </p>
      </div>

      {/* Welcome card */}
      <div style={{ background: '#1e2a3a', borderRadius: 12, padding: '20px 24px', marginBottom: 24, borderLeft: '3px solid #E07B3A' }}>
        <div style={{ fontSize: 12, color: '#8b8885', marginBottom: 3 }}>Welcome back</div>
        <div style={{ fontSize: 18, fontWeight: 500, color: '#e2e0db' }}>{user?.name}</div>
        <div style={{ fontSize: 13, color: '#8b8885', marginTop: 3 }}>
          {user?.role === 'system_leader' ? 'System Leader — access to all 20 Hub Schools' :
           user?.role === 'guest' ? 'Guest — read-only access' :
           `Coordinator — ${user?.schoolName}`}
        </div>
      </div>

      {/* Quick nav cards */}
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${navCards.length},1fr)`, gap: 12, marginBottom: 32 }}>
        {navCards.map(card => (
          <button key={card.id} onClick={() => onNavigate(card.id)} style={{
            background: '#1e2a3a', borderRadius: 10, padding: '20px 18px', textAlign: 'left',
            border: '0.5px solid rgba(255,255,255,0.08)', cursor: 'pointer', transition: 'border-color 0.15s',
          }}
            onMouseEnter={e => e.currentTarget.style.borderColor = '#E07B3A'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'}
          >
            <Badge n={card.n} />
            <div style={{ fontSize: 15, fontWeight: 500, color: '#e2e0db', marginBottom: 5 }}>{card.title}</div>
            <div style={{ fontSize: 12, color: '#8b8885', lineHeight: 1.6 }}>{card.desc}</div>
          </button>
        ))}
      </div>

      {/* What is BCHS Pulse */}
      <div style={{ background: '#1e2a3a', borderRadius: 12, padding: '20px 24px', marginBottom: 20 }}>
        <div style={{ fontSize: 15, fontWeight: 500, color: '#e2e0db', marginBottom: 16 }}>What is BCHS Pulse?</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {features.map(f => (
            <div key={f.n} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <div style={{
                width: 22, height: 22, borderRadius: '50%', background: 'rgba(224,123,58,0.12)',
                border: '1px solid rgba(224,123,58,0.3)', color: '#E07B3A',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 9, fontWeight: 600, flexShrink: 0, marginTop: 1,
              }}>{String(f.n).padStart(2,'0')}</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500, color: '#e2e0db', marginBottom: 4 }}>{f.title}</div>
                <div style={{ fontSize: 12, color: '#8b8885', lineHeight: 1.6 }}>{f.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ textAlign: 'center', fontSize: 11, color: '#555350', marginTop: 8 }}>
        YMCA of Greater Boston · Boston Community Hub Schools · SY25-26
      </div>
    </div>
  );
}
