import React, { useState } from 'react';
import { SYSTEM_DATA, SCHOOLS } from '../data/schoolData';

function fmt(v) { return v !== null && v !== undefined ? (v * 100).toFixed(1) + '%' : '—'; }
function caColor(v) { if (!v) return '#8b8885'; return v < 0.20 ? '#1D9E75' : v < 0.30 ? '#BA7517' : '#E24B4A'; }
function adaColor(v) { if (!v) return '#8b8885'; return v >= 0.93 ? '#1D9E75' : v >= 0.88 ? '#378ADD' : '#BA7517'; }
function belColor(v) { if (!v) return '#8b8885'; return v >= 0.55 ? '#1D9E75' : v >= 0.45 ? '#378ADD' : '#BA7517'; }
function aotColor(v) { if (!v) return '#8b8885'; return v >= 0.45 ? '#1D9E75' : v >= 0.30 ? '#378ADD' : '#E24B4A'; }

function HBar({ name, value, maxPct, color, highlight }) {
  const pct = value !== null ? Math.min((value / maxPct) * 100, 100) : 0;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
      <div style={{ width: 80, fontSize: 11, color: highlight ? '#E07B3A' : '#8b8885', textAlign: 'right', flexShrink: 0, fontWeight: highlight ? 600 : 400 }}>
        {name}
      </div>
      <div style={{ flex: 1, background: 'rgba(255,255,255,0.07)', borderRadius: 3, height: 13 }}>
        <div style={{ width: `${pct}%`, height: '100%', borderRadius: 3, background: value !== null ? color : 'transparent' }} />
      </div>
      <div style={{ width: 40, fontSize: 11, color: '#e2e0db', flexShrink: 0 }}>
        {value !== null && value !== undefined ? fmt(value) : '—'}
      </div>
    </div>
  );
}

function YoYCard({ title, data, colorFn, maxPct = 1, lowerBetter = false }) {
  const years = ['SY23-24', 'SY24-25', 'SY25-26'];
  return (
    <div style={{ background: '#1e2a3a', borderRadius: 8, padding: '12px 14px' }}>
      <div style={{ fontSize: 12, fontWeight: 500, color: '#e2e0db', marginBottom: 10 }}>{title}</div>
      {years.map((yr, i) => {
        const v = data[i];
        const pct = v !== null ? Math.min((v / maxPct) * 100, 100) : 0;
        const isLatest = i === 2;
        const prev = data[i - 1];
        const delta = v !== null && prev !== null && i > 0 ? v - prev : null;
        const improved = delta !== null && (lowerBetter ? delta < 0 : delta > 0);
        const color = isLatest ? (improved ? '#1D9E75' : v !== null && prev !== null ? '#E24B4A' : '#378ADD') : '#378ADD';
        return (
          <div key={yr} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <div style={{ width: 48, fontSize: 10, color: '#8b8885', flexShrink: 0 }}>{yr.replace('SY', '')}</div>
            <div style={{ flex: 1, background: 'rgba(255,255,255,0.07)', borderRadius: 3, height: 13 }}>
              <div style={{ width: `${pct}%`, height: '100%', borderRadius: 3, background: color }} />
            </div>
            <div style={{ width: 52, fontSize: 10, color: isLatest ? color : '#e2e0db', fontWeight: isLatest ? 500 : 400, flexShrink: 0, textAlign: 'right' }}>
              {v !== null ? fmt(v) : '—'}{isLatest && delta !== null ? (improved ? ' ▲' : ' ▼') : ''}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function SystemTab() {
  const [sortBy, setSortBy] = useState('ca');

  const schoolName = id => SCHOOLS.find(s => s.id === id)?.name || id;
  const schoolShort = id => SCHOOLS.find(s => s.id === id)?.short || id;

  const enriched = SYSTEM_DATA.map(s => ({ ...s, short: schoolShort(s.id), name: schoolName(s.id) }));

  // Weighted system averages
  const wavg = (metric, yr = 2) => {
    let num = 0, den = 0;
    SYSTEM_DATA.forEach(s => {
      if (s[metric][yr] !== null) { num += s[metric][yr] * s.enroll[yr]; den += s.enroll[yr]; }
    });
    return den > 0 ? num / den : null;
  };

  const totalStudents = SYSTEM_DATA.reduce((sum, s) => sum + (s.enroll[2] || 0), 0);

  const sortedSchools = [...enriched].sort((a, b) => {
    if (sortBy === 'ca')   return (a.ca[2] ?? 1) - (b.ca[2] ?? 1);
    if (sortBy === 'ada')  return (b.ada[2] ?? 0) - (a.ada[2] ?? 0);
    if (sortBy === 'bel')  return (b.bel[2] ?? 0) - (a.bel[2] ?? 0);
    if (sortBy === 'aot')  return (b.aot[2] ?? 0) - (a.aot[2] ?? 0);
    if (sortBy === 'name') return a.short.localeCompare(b.short);
    return 0;
  });

  const qspMetrics = [
    { id: 'ca',  title: 'Chronic Absenteeism', note: 'lower = better', colorFn: v => caColor(v), maxPct: 0.55, sortAsc: true },
    { id: 'bel', title: 'Sense of Belonging',  note: 'higher = better', colorFn: v => belColor(v), maxPct: 0.80, sortAsc: false },
    { id: 'ada', title: 'Avg Daily Attendance', note: 'higher = better', colorFn: v => adaColor(v), maxPct: 1.00, sortAsc: false },
    { id: 'aot', title: 'Academics On Track',  note: 'higher = better', colorFn: v => aotColor(v), maxPct: 0.80, sortAsc: false },
  ];

  const card = (label, value, color) => (
    <div style={{ background: '#1e2a3a', borderRadius: 8, padding: '14px 16px', textAlign: 'center' }}>
      <div style={{ fontSize: 26, fontWeight: 500, color }}>{value}</div>
      <div style={{ fontSize: 11, color: '#8b8885', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 4 }}>{label}</div>
    </div>
  );

  return (
    <div>
      <div style={{ marginBottom: 4 }}>
        <div style={{ fontSize: 16, fontWeight: 500, color: '#e2e0db' }}>System Dashboard — Boston Community Hub Schools</div>
        <div style={{ fontSize: 12, color: '#8b8885', marginTop: 2 }}>20 schools · SY23-24 through SY25-26 · System-wide roll-up</div>
      </div>

      {/* Metric cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, margin: '16px 0' }}>
        {card('Total Students', totalStudents.toLocaleString(), '#e2e0db')}
        {card('Hub Schools', '20', '#e2e0db')}
        {card('Avg Daily Attendance', fmt(wavg('ada')), '#5DCAA5')}
        {card('Chronic Absenteeism', fmt(wavg('ca')), '#FAC775')}
      </div>

      {/* YoY section */}
      <div style={{ fontSize: 11, fontWeight: 500, color: '#8b8885', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 8px' }}>
        System-wide metrics — year over year
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 20 }}>
        <YoYCard title="Avg Daily Attendance"   data={[wavg('ada',0), wavg('ada',1), wavg('ada',2)]} maxPct={1.0}  lowerBetter={false} />
        <YoYCard title="Chronic Absenteeism"    data={[wavg('ca',0),  wavg('ca',1),  wavg('ca',2)]}  maxPct={0.40} lowerBetter={true}  />
        <YoYCard title="Sense of Belonging"     data={[wavg('bel',0), wavg('bel',1), wavg('bel',2)]} maxPct={0.80} lowerBetter={false} />
        <YoYCard title="Academics On Track"     data={[wavg('aot',0), wavg('aot',1), wavg('aot',2)]} maxPct={0.60} lowerBetter={false} />
      </div>

      {/* QSP metrics per school */}
      <div style={{ fontSize: 11, fontWeight: 500, color: '#8b8885', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 8px' }}>
        QSP metrics by school — SY25-26
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
        {qspMetrics.map(m => {
          const sorted = [...enriched]
            .filter(s => s[m.id][2] !== null)
            .sort((a, b) => m.sortAsc ? a[m.id][2] - b[m.id][2] : b[m.id][2] - a[m.id][2]);
          return (
            <div key={m.id} style={{ background: '#1e2a3a', borderRadius: 8, padding: '12px 14px' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 500, color: '#e2e0db' }}>{m.title}</span>
                <span style={{ fontSize: 10, color: '#8b8885' }}>{m.note}</span>
              </div>
              {sorted.map(s => (
                <HBar
                  key={s.id}
                  name={s.short}
                  value={s[m.id][2]}
                  maxPct={m.maxPct}
                  color={m.colorFn(s[m.id][2])}
                  highlight={s.id === 'mather'}
                />
              ))}
              {m.id === 'ca' && (
                <div style={{ display: 'flex', gap: 12, marginTop: 6, fontSize: 10 }}>
                  <span style={{ color: '#1D9E75' }}>● &lt;20% Good</span>
                  <span style={{ color: '#BA7517' }}>● 20–30% Watch</span>
                  <span style={{ color: '#E24B4A' }}>● &gt;30% Concern</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Full table */}
      <div style={{ fontSize: 11, fontWeight: 500, color: '#8b8885', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 8px' }}>
        All schools snapshot
      </div>
      <div style={{ background: '#1e2a3a', borderRadius: 8, overflow: 'hidden' }}>
        <div style={{ display: 'flex', gap: 4, padding: '8px 12px', borderBottom: '0.5px solid rgba(255,255,255,0.07)', alignItems: 'center' }}>
          <span style={{ fontSize: 11, color: '#8b8885', marginRight: 6 }}>Sort by:</span>
          {[['ca','Chr. Absent'],['ada','Attendance'],['bel','Belonging'],['aot','Academics'],['name','Name']].map(([k, label]) => (
            <button key={k} onClick={() => setSortBy(k)} style={{
              padding: '3px 9px', fontSize: 11, borderRadius: 4, cursor: 'pointer', border: 'none',
              background: sortBy === k ? '#1a2744' : 'rgba(255,255,255,0.05)',
              color: sortBy === k ? 'white' : '#8b8885',
            }}>
              {label}
            </button>
          ))}
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: '0.5px solid rgba(255,255,255,0.07)' }}>
                {['School','Enroll.','Avg Att.','Chr. Absent','Academics','Belonging','Safety','Econ. Disadv.'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '7px 10px', color: '#8b8885', fontWeight: 500, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.03em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedSchools.map(s => (
                <tr key={s.id} style={{ borderBottom: '0.5px solid rgba(255,255,255,0.05)', background: s.id === 'mather' ? 'rgba(224,123,58,0.05)' : 'transparent' }}>
                  <td style={{ padding: '7px 10px', fontWeight: s.id === 'mather' ? 600 : 400, color: s.id === 'mather' ? '#E07B3A' : '#e2e0db' }}>{s.short}</td>
                  <td style={{ padding: '7px 10px', color: '#e2e0db' }}>{s.enroll[2]?.toLocaleString()}</td>
                  <td style={{ padding: '7px 10px', color: adaColor(s.ada[2]) }}>{fmt(s.ada[2])}</td>
                  <td style={{ padding: '7px 10px', color: caColor(s.ca[2]), fontWeight: 500 }}>{fmt(s.ca[2])}</td>
                  <td style={{ padding: '7px 10px', color: aotColor(s.aot[2]) }}>{fmt(s.aot[2])}</td>
                  <td style={{ padding: '7px 10px', color: belColor(s.bel[2]) }}>{fmt(s.bel[2])}</td>
                  <td style={{ padding: '7px 10px', color: '#e2e0db' }}>{fmt(s.saf[2])}</td>
                  <td style={{ padding: '7px 10px', color: '#e2e0db' }}>{fmt(s.eco[2])}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
