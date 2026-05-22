import React, { useState } from 'react';
import { MATHER_DATA, SYSTEM_DATA, SCHOOLS } from '../data/schoolData';

function f(v) { return v !== null && v !== undefined ? `${(v * 100).toFixed(1)}%` : '—'; }
function fraw(v) { return v !== null && v !== undefined ? v.toLocaleString() : '—'; }

function DeltaTag({ v0, v2, lowerBetter }) {
  if (v0 === null || v0 === undefined || v2 === null || v2 === undefined) return null;
  const d = v2 - v0;
  const pp = (d * 100).toFixed(1);
  const neutral = Math.abs(d) < 0.005;
  if (neutral) return <span style={styles.deltaNeu}>● stable</span>;
  const improved = lowerBetter ? d < 0 : d > 0;
  const sign = d > 0 ? '+' : '';
  return <span style={improved ? styles.deltaGood : styles.deltaBad}>
    {improved ? (lowerBetter ? '▼' : '▲') : (lowerBetter ? '▲' : '▼')} {sign}{pp}pp
  </span>;
}

function DeltaTagRaw({ v0, v2, lowerBetter }) {
  if (v0 === null || v0 === undefined || v2 === null || v2 === undefined) return null;
  const d = v2 - v0;
  const neutral = Math.abs(d) < 1;
  if (neutral) return <span style={styles.deltaNeu}>● stable</span>;
  const improved = lowerBetter ? d < 0 : d > 0;
  const sign = d > 0 ? '+' : '';
  return <span style={improved ? styles.deltaGood : styles.deltaBad}>
    {improved ? '▲' : '▼'} {sign}{d}
  </span>;
}

function YoYCard({ title, data, lowerBetter, maxPct = 1 }) {
  const years = ['23-24', '24-25', '25-26'];
  return (
    <div style={styles.yoyCard}>
      <div style={styles.yoyTitle}>{title}</div>
      {years.map((yr, i) => {
        const v = data[i];
        const pct = v !== null ? Math.min((v / maxPct) * 100, 100) : 0;
        const prev = data[i - 1];
        const delta = v !== null && prev !== null && i > 0 ? v - prev : null;
        const improved = delta !== null && (lowerBetter ? delta < 0 : delta > 0);
        const color = i === 2 ? (delta !== null ? (improved ? '#1D9E75' : '#E24B4A') : '#378ADD') : '#378ADD';
        return (
          <div key={yr} style={styles.yoyRow}>
            <div style={styles.yoyLbl}>{yr}</div>
            <div style={styles.yoyTrack}>
              <div style={{ ...styles.yoyFill, width: `${pct}%`, background: color }} />
            </div>
            <div style={{ ...styles.yoyVal, color: i === 2 ? color : '#e2e0db', fontWeight: i === 2 ? 500 : 400 }}>
              {v !== null ? f(v) : '—'}{i === 2 && delta !== null ? (improved ? ' ▲' : ' ▼') : ''}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function MetCard({ label, value, delta, color }) {
  return (
    <div style={styles.metCard}>
      <div style={{ fontSize: 22, fontWeight: 500, color: color || '#e2e0db' }}>{value}</div>
      <div style={styles.metLbl}>{label}</div>
      {delta && <div style={{ marginTop: 4 }}>{delta}</div>}
    </div>
  );
}

function TRow({ label, sy23, sy24, sy25, lowerBetter, isRaw, isHeader }) {
  if (isHeader) return (
    <tr><td colSpan={5} style={styles.tblSection}>{label}</td></tr>
  );
  const v0 = sy23, v2 = sy25;
  const display = isRaw ? fraw : f;
  return (
    <tr style={styles.tblRow}>
      <td style={styles.tblCell}>{label}</td>
      <td style={styles.tblNum}>{display(sy23)}</td>
      <td style={styles.tblNum}>{display(sy24)}</td>
      <td style={{ ...styles.tblNum, fontWeight: 500 }}>{display(sy25)}</td>
      <td style={styles.tblNum}>
        {isRaw
          ? <DeltaTagRaw v0={v0} v2={v2} lowerBetter={lowerBetter} />
          : <DeltaTag v0={v0} v2={v2} lowerBetter={lowerBetter} />}
      </td>
    </tr>
  );
}

const styles = {
  sec: { fontSize: 11, fontWeight: 500, color: '#8b8885', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 8px' },
  metCard: { background: '#1e2a3a', borderRadius: 8, padding: '12px 14px', textAlign: 'center' },
  metLbl: { fontSize: 10, color: '#8b8885', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 3 },
  deltaGood: { fontSize: 10, fontWeight: 500, color: '#5DCAA5', background: 'rgba(29,158,117,0.12)', padding: '1px 5px', borderRadius: 3 },
  deltaBad:  { fontSize: 10, fontWeight: 500, color: '#F09595', background: 'rgba(226,75,74,0.12)',  padding: '1px 5px', borderRadius: 3 },
  deltaNeu:  { fontSize: 10, color: '#8b8885', background: 'rgba(255,255,255,0.05)', padding: '1px 5px', borderRadius: 3 },
  yoyCard:  { background: '#1e2a3a', borderRadius: 8, padding: '12px 14px' },
  yoyTitle: { fontSize: 12, fontWeight: 500, color: '#e2e0db', marginBottom: 8 },
  yoyRow:   { display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 },
  yoyLbl:   { width: 44, fontSize: 10, color: '#8b8885', flexShrink: 0 },
  yoyTrack: { flex: 1, background: 'rgba(255,255,255,0.07)', borderRadius: 3, height: 12 },
  yoyFill:  { height: '100%', borderRadius: 3 },
  yoyVal:   { width: 52, fontSize: 10, textAlign: 'right', flexShrink: 0 },
  tblRow:   { borderBottom: '0.5px solid rgba(255,255,255,0.05)' },
  tblCell:  { padding: '6px 10px', fontSize: 12, color: '#e2e0db' },
  tblNum:   { padding: '6px 10px', fontSize: 12, color: '#e2e0db', textAlign: 'right' },
  tblSection: { padding: '8px 10px 4px', fontSize: 10, fontWeight: 500, color: '#8b8885', textTransform: 'uppercase', letterSpacing: '0.05em', background: 'rgba(255,255,255,0.02)' },
};

export default function DataTab({ schoolId }) {
  const school = SYSTEM_DATA.find(s => s.id === schoolId) || SYSTEM_DATA.find(s => s.id === 'mather');
  const schoolInfo = SCHOOLS.find(s => s.id === schoolId) || SCHOOLS.find(s => s.id === 'mather');
  const isMather = schoolId === 'mather';
  const m = isMather ? MATHER_DATA.data : null;

  return (
    <div>
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 16, fontWeight: 500, color: '#e2e0db' }}>Data Review — {schoolInfo?.name}</div>
        <div style={{ fontSize: 12, color: '#8b8885', marginTop: 2 }}>SY23-24 through SY25-26 · Source: Panorama / Lighthouse · <span style={{ color: '#FAC775', background: 'rgba(186,117,23,0.12)', padding: '1px 6px', borderRadius: 3, fontSize: 11 }}>Data as of May 1, 2026</span></div>
      </div>

      {/* Metric cards */}
      <div style={{ fontSize: 11, fontWeight: 500, color: '#8b8885', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 8px' }}>Key metrics — SY25-26</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 10, marginBottom: 20 }}>
        <MetCard label="Enrollment" value={fraw(school.enroll[2])}
          color="#e2e0db"
          delta={<DeltaTagRaw v0={school.enroll[0]} v2={school.enroll[2]} lowerBetter={false} />} />
        <MetCard label="Avg Attendance" value={f(school.ada[2])}
          color={school.ada[2] >= 0.93 ? '#5DCAA5' : school.ada[2] >= 0.88 ? '#FAC775' : '#F09595'}
          delta={<DeltaTag v0={school.ada[0]} v2={school.ada[2]} lowerBetter={false} />} />
        <MetCard label="Chr. Absenteeism" value={f(school.ca[2])}
          color={school.ca[2] < 0.20 ? '#5DCAA5' : school.ca[2] < 0.30 ? '#FAC775' : '#F09595'}
          delta={<DeltaTag v0={school.ca[0]} v2={school.ca[2]} lowerBetter={true} />} />
        <MetCard label="Academics OT" value={f(school.aot[2])}
          color={school.aot[2] >= 0.45 ? '#5DCAA5' : school.aot[2] >= 0.30 ? '#FAC775' : '#F09595'}
          delta={<DeltaTag v0={school.aot[0]} v2={school.aot[2]} lowerBetter={false} />} />
        <MetCard label="Belonging" value={f(school.bel[2])}
          color={school.bel[2] >= 0.55 ? '#5DCAA5' : school.bel[2] >= 0.45 ? '#85B7EB' : '#FAC775'}
          delta={<DeltaTag v0={school.bel[0]} v2={school.bel[2]} lowerBetter={false} />} />
      </div>

      {/* YoY cards */}
      <div style={{ fontSize: 11, fontWeight: 500, color: '#8b8885', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 8px' }}>Year over year — QSP metrics</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 20 }}>
        <YoYCard title="Avg Daily Attendance"  data={school.ada} lowerBetter={false} maxPct={1.0} />
        <YoYCard title="Chronic Absenteeism"   data={school.ca}  lowerBetter={true}  maxPct={0.55} />
        <YoYCard title="Sense of Belonging"    data={school.bel} lowerBetter={false} maxPct={0.80} />
        <YoYCard title="Academics On Track"    data={school.aot} lowerBetter={false} maxPct={0.80} />
      </div>

      {/* Full metrics table */}
      <div style={{ fontSize: 11, fontWeight: 500, color: '#8b8885', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span>Full metrics table</span>
        <CopyTableButton schoolName={schoolInfo?.name} school={school} isMather={isMather} m={m} />
      </div>
      <div style={{ background: '#1e2a3a', borderRadius: 8, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '0.5px solid rgba(255,255,255,0.07)' }}>
              {['Metric', 'SY23-24', 'SY24-25', 'SY25-26', 'Change'].map((h, i) => (
                <th key={h} style={{ padding: '7px 10px', textAlign: i === 0 ? 'left' : 'right', color: '#8b8885', fontWeight: 500, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.03em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <TRow isHeader label="Attendance" />
            <TRow label="Enrollment"          sy23={school.enroll[0]} sy24={school.enroll[1]} sy25={school.enroll[2]} lowerBetter={false} isRaw />
            <TRow label="Avg Daily Attendance" sy23={school.ada[0]}    sy24={school.ada[1]}    sy25={school.ada[2]}    lowerBetter={false} />
            <TRow label="Chronic Absenteeism" sy23={school.ca[0]}     sy24={school.ca[1]}     sy25={school.ca[2]}     lowerBetter={true} />

            <TRow isHeader label="Academics" />
            <TRow label="Overall On Track"    sy23={school.aot[0]}    sy24={school.aot[1]}    sy25={school.aot[2]}    lowerBetter={false} />
            {isMather && <>
              <TRow label="English Learners"     sy23={m.aot_el[0]}       sy24={m.aot_el[1]}       sy25={m.aot_el[2]}       lowerBetter={false} />
              <TRow label="Former EL"            sy23={m.aot_former_el[0]} sy24={m.aot_former_el[1]} sy25={m.aot_former_el[2]} lowerBetter={false} />
              <TRow label="Non-EL"               sy23={m.aot_not_el[0]}   sy24={m.aot_not_el[1]}   sy25={m.aot_not_el[2]}   lowerBetter={false} />
              <TRow label="Students w/ Disab."  sy23={m.aot_swd[0]}      sy24={m.aot_swd[1]}      sy25={m.aot_swd[2]}      lowerBetter={false} />
              <TRow label="Non-SWD"              sy23={m.aot_non_swd[0]}  sy24={m.aot_non_swd[1]}  sy25={m.aot_non_swd[2]}  lowerBetter={false} />
            </>}

            <TRow isHeader label="Climate & Belonging" />
            <TRow label="Avg Sense of Belonging" sy23={school.bel[0]}    sy24={school.bel[1]}    sy25={school.bel[2]}    lowerBetter={false} />
            {isMather && <>
              <TRow label="Belonging Grades 3–5"  sy23={m.belonging_35[0]}  sy24={m.belonging_35[1]}  sy25={m.belonging_35[2]}  lowerBetter={false} />
              <TRow label="Belonging Grades 6+"   sy23={m.belonging_6up[0]} sy24={m.belonging_6up[1]} sy25={m.belonging_6up[2]} lowerBetter={false} />
              <TRow label="Safety Grades 3–5"     sy23={m.safety_35[0]}     sy24={m.safety_35[1]}     sy25={m.safety_35[2]}     lowerBetter={false} />
            </>}
            <TRow label="School Safety"           sy23={school.saf[0]}    sy24={school.saf[1]}    sy25={school.saf[2]}    lowerBetter={false} />

            <TRow isHeader label="Demographics" />
            <TRow label="Multilingual Learners"    sy23={school.ml[0]}  sy24={school.ml[1]}  sy25={school.ml[2]}  lowerBetter={false} />
            <TRow label="Students w/ Disabilities" sy23={school.swd[0]} sy24={school.swd[1]} sy25={school.swd[2]} lowerBetter={false} />
            <TRow label="Economically Disadvantaged" sy23={school.eco[0]} sy24={school.eco[1]} sy25={school.eco[2]} lowerBetter={false} />
            {isMather && <>
              <TRow label="Black / African American" sy23={m.demographics.black[0]}    sy24={m.demographics.black[1]}    sy25={m.demographics.black[2]}    lowerBetter={false} />
              <TRow label="Asian"                    sy23={m.demographics.asian[0]}    sy24={m.demographics.asian[1]}    sy25={m.demographics.asian[2]}    lowerBetter={false} />
              <TRow label="Hispanic / Latino"        sy23={m.demographics.hispanic[0]} sy24={m.demographics.hispanic[1]} sy25={m.demographics.hispanic[2]} lowerBetter={false} />
              <TRow label="White"                    sy23={m.demographics.white[0]}    sy24={m.demographics.white[1]}    sy25={m.demographics.white[2]}    lowerBetter={false} />
            </>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
