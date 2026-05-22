import React, { useState } from 'react';
import { SYSTEM_DATA, SCHOOLS } from '../data/schoolData';

function fmt(v) { return v !== null && v !== undefined ? (v * 100).toFixed(1) + '%' : '—'; }
function caColor(v)  { if (!v) return '#8b8885'; return v < 0.20 ? '#1D9E75' : v < 0.30 ? '#BA7517' : '#E24B4A'; }
function adaColor(v) { if (!v) return '#8b8885'; return v >= 0.93 ? '#1D9E75' : v >= 0.88 ? '#378ADD' : '#BA7517'; }
function belColor(v) { if (!v) return '#8b8885'; return v >= 0.55 ? '#1D9E75' : v >= 0.45 ? '#378ADD' : '#BA7517'; }
function aotColor(v) { if (!v) return '#8b8885'; return v >= 0.45 ? '#1D9E75' : v >= 0.30 ? '#378ADD' : '#E24B4A'; }

function DeltaTag({ v0, v2, lowerBetter }) {
  if (v0 === null || v0 === undefined || v2 === null || v2 === undefined) {
    return <span style={{ fontSize: 10, color: '#8b8885', padding: '1px 5px', background: 'rgba(255,255,255,0.05)', borderRadius: 3, minWidth: 52, textAlign: 'center', display: 'inline-block' }}>—</span>;
  }
  const d = v2 - v0;
  const pp = (d * 100).toFixed(1);
  const neutral = Math.abs(d) < 0.005;
  if (neutral) return <span style={{ fontSize: 10, color: '#8b8885', padding: '1px 5px', background: 'rgba(255,255,255,0.06)', borderRadius: 3, minWidth: 52, textAlign: 'center', display: 'inline-block' }}>● stable</span>;
  const improved = lowerBetter ? d < 0 : d > 0;
  const bg = improved ? 'rgba(29,158,117,0.15)' : 'rgba(226,75,74,0.15)';
  const color = improved ? '#5DCAA5' : '#F09595';
  const arrow = improved ? (lowerBetter ? '▼' : '▲') : (lowerBetter ? '▲' : '▼');
  const sign = d > 0 ? '+' : '';
  return <span style={{ fontSize: 10, fontWeight: 500, color, background: bg, padding: '1px 5px', borderRadius: 3, minWidth: 52, textAlign: 'center', display: 'inline-block', whiteSpace: 'nowrap' }}>{arrow} {sign}{pp}pp</span>;
}

function HBar({ name, v0, v2, maxPct, colorFn, lowerBetter, highlight }) {
  const pct = v2 !== null ? Math.min((v2 / maxPct) * 100, 100) : 0;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
      <div style={{ width: 82, fontSize: 11, color: highlight ? '#E07B3A' : '#8b8885', textAlign: 'right', flexShrink: 0, fontWeight: highlight ? 600 : 400 }}>{name}</div>
      <div style={{ flex: 1, background: 'rgba(255,255,255,0.07)', borderRadius: 3, height: 13 }}>
        <div style={{ width: `${pct}%`, height: '100%', borderRadius: 3, background: v2 !== null ? colorFn(v2) : 'transparent' }} />
      </div>
      <div style={{ fontSize: 11, color: '#e2e0db', width: 38, flexShrink: 0 }}>{fmt(v2)}</div>
      <DeltaTag v0={v0} v2={v2} lowerBetter={lowerBetter} />
    </div>
  );
}

function YoYCard({ title, data, lowerBetter, maxPct = 1 }) {
  const years = ['SY23-24', 'SY24-25', 'SY25-26'];
  return (
    <div style={{ background: '#1e2a3a', borderRadius: 8, padding: '12px 14px' }}>
      <div style={{ fontSize: 12, fontWeight: 500, color: '#e2e0db', marginBottom: 10 }}>{title}</div>
      {years.map((yr, i) => {
        const v = data[i];
        const pct = v !== null ? Math.min((v / maxPct) * 100, 100) : 0;
        const prev = data[i - 1];
        const delta = v !== null && prev !== null && i > 0 ? v - prev : null;
        const improved = delta !== null && (lowerBetter ? delta < 0 : delta > 0);
        const color = i === 2 ? (delta !== null ? (improved ? '#1D9E75' : '#E24B4A') : '#378ADD') : '#378ADD';
        return (
          <div key={yr} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <div style={{ width: 48, fontSize: 10, color: '#8b8885', flexShrink: 0 }}>{yr.replace('SY', '')}</div>
            <div style={{ flex: 1, background: 'rgba(255,255,255,0.07)', borderRadius: 3, height: 13 }}>
              <div style={{ width: `${pct}%`, height: '100%', borderRadius: 3, background: color }} />
            </div>
            <div style={{ width: 52, fontSize: 10, color: i === 2 ? color : '#e2e0db', fontWeight: i === 2 ? 500 : 400, flexShrink: 0, textAlign: 'right' }}>
              {v !== null ? fmt(v) : '—'}{i === 2 && delta !== null ? (improved ? ' ▲' : ' ▼') : ''}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function SystemTab() {
  const [sortBy, setSortBy] = useState('ca');

  const schoolShort = id => SCHOOLS.find(s => s.id === id)?.short || id;
  const enriched = SYSTEM_DATA.map(s => ({ ...s, short: schoolShort(s.id) }));

  const wavg = (metric, yr = 2) => {
    let num = 0, den = 0;
    SYSTEM_DATA.forEach(s => { if (s[metric][yr] !== null) { num += s[metric][yr] * s.enroll[yr]; den += s.enroll[yr]; } });
    return den > 0 ? num / den : null;
  };

  const totalStudents = SYSTEM_DATA.reduce((sum, s) => sum + (s.enroll[2] || 0), 0);

  const qspMetrics = [
    { id: 'ca',  title: 'Chronic Absenteeism', note: 'lower = better · delta: ▼ improving, ▲ worsening', colorFn: caColor, maxPct: 0.55, lowerBetter: true },
    { id: 'bel', title: 'Sense of Belonging',  note: 'higher = better · delta: ▲ improving, ▼ declining', colorFn: belColor, maxPct: 0.80, lowerBetter: false },
    { id: 'ada', title: 'Avg Daily Attendance', note: 'higher = better · delta: ▲ improving, ▼ declining', colorFn: adaColor, maxPct: 1.00, lowerBetter: false },
    { id: 'aot', title: 'Academics On Track',  note: 'higher = better · delta: ▲ improving, ▼ declining', colorFn: aotColor, maxPct: 0.80, lowerBetter: false },
  ];

  const sortedSchools = [...enriched].sort((a, b) => {
    if (sortBy === 'ca')   return (a.ca[2] ?? 1) - (b.ca[2] ?? 1);
    if (sortBy === 'ada')  return (b.ada[2] ?? 0) - (a.ada[2] ?? 0);
    if (sortBy === 'bel')  return (b.bel[2] ?? 0) - (a.bel[2] ?? 0);
    if (sortBy === 'aot')  return (b.aot[2] ?? 0) - (a.aot[2] ?? 0);
    if (sortBy === 'name') return a.short.localeCompare(b.short);
    return 0;
  });

  const sectionLabel = (text) => (
    <div style={{ fontSize: 11, fontWeight: 500, color: '#8b8885', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 8px' }}>{text}</div>
  );

  return (
    <div>
      <div style={{ marginBottom: 4 }}>
        <div style={{ fontSize: 16, fontWeight: 500, color: '#e2e0db' }}>System Dashboard — BCHS Pulse</div>
        <div style={{ fontSize: 12, color: '#8b8885', marginTop: 2, display: 'flex', alignItems: 'center', gap: 8 }}>20 schools · SY23-24 through SY25-26 · System-wide roll-up <span style={{ color: '#FAC775', background: 'rgba(186,117,23,0.12)', padding: '1px 6px', borderRadius: 3, fontSize: 11 }}>Data as of May 1, 2026</span></div>
      </div>

      {/* Metric cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, margin: '16px 0' }}>
        {[
          { label: 'Total Students', value: totalStudents.toLocaleString(), color: '#e2e0db' },
          { label: 'Hub Schools', value: '20', color: '#e2e0db' },
          { label: 'Avg Daily Attendance', value: fmt(wavg('ada')), color: '#5DCAA5' },
          { label: 'Chronic Absenteeism', value: fmt(wavg('ca')), color: '#FAC775' },
        ].map(m => (
          <div key={m.label} style={{ background: '#1e2a3a', borderRadius: 8, padding: '14px 16px', textAlign: 'center' }}>
            <div style={{ fontSize: 26, fontWeight: 500, color: m.color }}>{m.value}</div>
            <div style={{ fontSize: 11, color: '#8b8885', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 4 }}>{m.label}</div>
          </div>
        ))}
      </div>

      {/* YoY cards */}
      {sectionLabel('System-wide metrics — year over year')}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 20 }}>
        <YoYCard title="Avg Daily Attendance"  data={[wavg('ada',0), wavg('ada',1), wavg('ada',2)]} maxPct={1.0}  lowerBetter={false} />
        <YoYCard title="Chronic Absenteeism"   data={[wavg('ca',0),  wavg('ca',1),  wavg('ca',2)]}  maxPct={0.40} lowerBetter={true}  />
        <YoYCard title="Sense of Belonging"    data={[wavg('bel',0), wavg('bel',1), wavg('bel',2)]} maxPct={0.80} lowerBetter={false} />
        <YoYCard title="Academics On Track"    data={[wavg('aot',0), wavg('aot',1), wavg('aot',2)]} maxPct={0.60} lowerBetter={false} />
      </div>

      {/* QSP metrics with delta */}
      {sectionLabel('QSP metrics by school — SY25-26 with change since SY23-24')}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
        {qspMetrics.map(m => {
          const sorted = [...enriched]
            .filter(s => s[m.id][2] !== null)
            .sort((a, b) => m.lowerBetter ? a[m.id][2] - b[m.id][2] : b[m.id][2] - a[m.id][2]);
          return (
            <div key={m.id} style={{ background: '#1e2a3a', borderRadius: 8, padding: '12px 14px' }}>
              <div style={{ fontSize: 12, fontWeight: 500, color: '#e2e0db', marginBottom: 2 }}>{m.title}</div>
              <div style={{ fontSize: 10, color: '#8b8885', marginBottom: 10 }}>{m.note}</div>
              {sorted.map(s => (
                <HBar
                  key={s.id}
                  name={s.short}
                  v0={s[m.id][0]}
                  v2={s[m.id][2]}
                  maxPct={m.maxPct}
                  colorFn={m.colorFn}
                  lowerBetter={m.lowerBetter}
                  highlight={s.id === 'mather'}
                />
              ))}
              {m.id === 'ca' && (
                <div style={{ display: 'flex', gap: 12, marginTop: 8, fontSize: 10 }}>
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
      {sectionLabel('All schools snapshot')}
      <div style={{ background: '#1e2a3a', borderRadius: 8, overflow: 'hidden' }}>
        <div style={{ display: 'flex', gap: 4, padding: '8px 12px', borderBottom: '0.5px solid rgba(255,255,255,0.07)', alignItems: 'center' }}>
          <span style={{ fontSize: 11, color: '#8b8885', marginRight: 6 }}>Sort by:</span>
          {[['ca','Chr. Absent'],['ada','Attendance'],['bel','Belonging'],['aot','Academics'],['name','Name']].map(([k, label]) => (
            <button key={k} onClick={() => setSortBy(k)} style={{
              padding: '3px 9px', fontSize: 11, borderRadius: 4, cursor: 'pointer', border: 'none',
              background: sortBy === k ? '#1a2744' : 'rgba(255,255,255,0.05)',
              color: sortBy === k ? 'white' : '#8b8885',
            }}>{label}</button>
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
