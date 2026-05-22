import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';
import { Card, MetricCard, Delta } from '../components/UI';
import { SYSTEM_DATA, SCHOOLS, YEARS } from '../data/schoolData';

function fmt(v, type = 'pct') {
  if (v === null || v === undefined) return '—';
  if (type === 'pct') return `${(v * 100).toFixed(1)}%`;
  return v.toLocaleString();
}

function caColor(v) {
  if (v === null) return 'var(--text-hint)';
  if (v < 0.20) return '#1D9E75';
  if (v < 0.30) return '#BA7517';
  return '#A32D2D';
}

export default function SystemTab() {
  const [sortBy, setSortBy] = useState('ca');
  const [highlightSchool, setHighlightSchool] = useState('mather');

  const schoolName = id => SCHOOLS.find(s => s.id === id)?.name || id;
  const schoolShort = id => SCHOOLS.find(s => s.id === id)?.short || id;

  // System-wide summary calculations
  const sy26 = SYSTEM_DATA.map(s => ({ ...s, name: schoolName(s.id), short: schoolShort(s.id) }));
  const totalStudents = SYSTEM_DATA.reduce((sum, s) => sum + (s.enroll[2] || 0), 0);

  // Weighted averages for SY25-26
  const wavg = (metric) => {
    let num = 0, den = 0;
    SYSTEM_DATA.forEach(s => {
      if (s[metric][2] !== null) { num += s[metric][2] * s.enroll[2]; den += s.enroll[2]; }
    });
    return den > 0 ? num / den : null;
  };

  const systemMetrics = [
    { label: 'Total Students', value: totalStudents.toLocaleString() },
    { label: 'Hub Schools', value: '20' },
    { label: 'Avg Daily Attendance', value: fmt(wavg('ada')), accent: 'teal', delta: '▲ Improving' },
    { label: 'Chronic Absenteeism', value: fmt(wavg('ca')), accent: 'orange', delta: '▲ −4.1pp since SY23-24' },
    { label: 'Sense of Belonging', value: fmt(wavg('bel')), accent: 'blue', delta: '▲ +4.5pp since SY23-24' },
    { label: 'Academics On Track', value: fmt(wavg('aot')), accent: 'red', delta: '▼ −13pp since SY23-24' },
  ];

  // 3-year system trend
  const trendData = YEARS.map((y, i) => {
    const calcWavg = (metric) => {
      let num = 0, den = 0;
      SYSTEM_DATA.forEach(s => {
        if (s[metric][i] !== null) { num += s[metric][i] * s.enroll[i]; den += s.enroll[i]; }
      });
      return den > 0 ? Math.round(num / den * 1000) / 10 : null;
    };
    return {
      year: y,
      'Attendance': calcWavg('ada'),
      'Chronic Absent': calcWavg('ca'),
      'Belonging': calcWavg('bel'),
      'Academics': calcWavg('aot'),
    };
  });

  // Sort schools
  const sortedSchools = [...sy26].sort((a, b) => {
    if (sortBy === 'ca') return (a.ca[2] ?? 1) - (b.ca[2] ?? 1);
    if (sortBy === 'ada') return (b.ada[2] ?? 0) - (a.ada[2] ?? 0);
    if (sortBy === 'bel') return (b.bel[2] ?? 0) - (a.bel[2] ?? 0);
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    return 0;
  });

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 16, fontWeight: 500 }}>System Dashboard — Boston Community Hub Schools</div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>20 schools · SY23-24 through SY25-26 · System-wide roll-up</div>
      </div>

      {/* Impact banner */}
      <div style={{ background: 'var(--navy)', borderRadius: 'var(--radius-lg)', padding: '14px 20px', display: 'flex', flexWrap: 'wrap', gap: 28, marginBottom: 14 }}>
        {systemMetrics.slice(0, 4).map(m => (
          <div key={m.label} style={{ color: 'white' }}>
            <div style={{ fontSize: 22, fontWeight: 600, color: m.accent === 'orange' ? 'var(--orange-light)' : m.accent === 'teal' ? '#5DCAA5' : m.accent === 'red' ? '#F09595' : 'white' }}>
              {m.value}
            </div>
            <div style={{ fontSize: 10, opacity: 0.6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{m.label}</div>
          </div>
        ))}
      </div>

      <div className="grid-2" style={{ marginBottom: 12 }}>
        {/* System trend */}
        <Card title="System-Wide Metrics — 3-Year Trend">
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={trendData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="year" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${v}%`} />
              <Tooltip formatter={(v) => v ? `${v}%` : '—'} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="Attendance" stroke="#1D9E75" strokeWidth={2} dot={{ r: 2 }} />
              <Line type="monotone" dataKey="Chronic Absent" stroke="#E24B4A" strokeWidth={2} dot={{ r: 2 }} />
              <Line type="monotone" dataKey="Belonging" stroke="#185FA5" strokeWidth={2} dot={{ r: 2 }} />
              <Line type="monotone" dataKey="Academics" stroke="#E07B3A" strokeWidth={2} strokeDasharray="4 2" dot={{ r: 2 }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* CA bar chart */}
        <Card title="Chronic Absenteeism by School — SY25-26 (sorted low to high)">
          <div style={{ overflowY: 'auto', maxHeight: 220 }}>
            {[...sy26].sort((a, b) => (a.ca[2] ?? 1) - (b.ca[2] ?? 1)).map(s => (
              <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '2px 0', cursor: 'pointer' }}
                onClick={() => setHighlightSchool(s.id)}>
                <div style={{ width: 110, fontSize: 10, color: s.id === highlightSchool ? 'var(--orange)' : 'var(--text-muted)', textAlign: 'right', flexShrink: 0, fontWeight: s.id === highlightSchool ? 600 : 400 }}>
                  {s.short}
                </div>
                <div style={{ flex: 1, background: 'var(--surface-2)', borderRadius: 3, height: 12 }}>
                  <div style={{ width: `${s.ca[2] !== null ? s.ca[2] * 200 : 0}%`, maxWidth: '100%', height: '100%', borderRadius: 3, background: caColor(s.ca[2]) }} />
                </div>
                <div style={{ width: 38, fontSize: 10, color: caColor(s.ca[2]), fontWeight: 500, flexShrink: 0 }}>
                  {fmt(s.ca[2])}
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 8, display: 'flex', gap: 12, fontSize: 10, color: 'var(--text-muted)' }}>
            <span style={{ color: '#1D9E75' }}>● &lt;20% Good</span>
            <span style={{ color: '#BA7517' }}>● 20-30% Watch</span>
            <span style={{ color: '#A32D2D' }}>● &gt;30% Concern</span>
          </div>
        </Card>
      </div>

      {/* School-by-school table */}
      <Card title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span>All Schools Snapshot — SY25-26</span>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 4 }}>
            {[['ca','Chr. Absent'],['ada','Attendance'],['bel','Belonging'],['name','Name']].map(([k, label]) => (
              <button key={k} onClick={() => setSortBy(k)} style={{
                padding: '3px 8px', fontSize: 11, borderRadius: 4, cursor: 'pointer', border: 'none',
                background: sortBy === k ? 'var(--navy)' : 'var(--surface-2)',
                color: sortBy === k ? 'white' : 'var(--text-muted)',
              }}>
                {label}
              </button>
            ))}
          </div>
        </div>
      }>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
            <thead>
              <tr style={{ borderBottom: '0.5px solid var(--border)' }}>
                {['School', 'Enroll.', 'Avg Att.', 'Chr. Absent', 'Academics OT', 'Belonging', 'Safety', 'Econ. Disadv.'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '5px 7px', color: 'var(--text-muted)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.03em', fontSize: 10 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedSchools.map(s => (
                <tr key={s.id} style={{ borderBottom: '0.5px solid var(--border)', background: s.id === 'mather' ? 'rgba(224,123,58,0.05)' : 'transparent' }}
                  onMouseEnter={e => e.currentTarget.style.background = s.id === 'mather' ? 'rgba(224,123,58,0.09)' : 'var(--surface)'}
                  onMouseLeave={e => e.currentTarget.style.background = s.id === 'mather' ? 'rgba(224,123,58,0.05)' : 'transparent'}
                >
                  <td style={{ padding: '6px 7px', fontWeight: s.id === 'mather' ? 600 : 400, color: s.id === 'mather' ? 'var(--orange)' : 'var(--text)', whiteSpace: 'nowrap' }}>{s.short}</td>
                  <td style={{ padding: '6px 7px' }}>{s.enroll[2]?.toLocaleString()}</td>
                  <td style={{ padding: '6px 7px', color: s.ada[2] > 0.93 ? 'var(--teal)' : s.ada[2] < 0.85 ? 'var(--red)' : 'var(--text)' }}>{fmt(s.ada[2])}</td>
                  <td style={{ padding: '6px 7px', color: caColor(s.ca[2]), fontWeight: 500 }}>{fmt(s.ca[2])}</td>
                  <td style={{ padding: '6px 7px', color: s.aot[2] > 0.5 ? 'var(--teal)' : s.aot[2] < 0.25 ? 'var(--red)' : 'var(--text)' }}>{fmt(s.aot[2])}</td>
                  <td style={{ padding: '6px 7px' }}>{fmt(s.bel[2])}</td>
                  <td style={{ padding: '6px 7px' }}>{fmt(s.saf[2])}</td>
                  <td style={{ padding: '6px 7px' }}>{fmt(s.eco[2])}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
