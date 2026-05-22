import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, MetricCard, HBar, SectionHeader } from '../components/UI';
import { MATHER_DATA, SYSTEM_DATA, SCHOOLS, YEARS } from '../data/schoolData';

function pct(v) { return v !== null && v !== undefined ? `${(v * 100).toFixed(1)}%` : '—'; }
function delta(a, b, lowerBetter = false) {
  if (a === null || b === null || a === undefined || b === undefined) return null;
  const d = b - a;
  const improved = lowerBetter ? d < 0 : d > 0;
  const sign = d > 0 ? '+' : '';
  return { text: `${sign}${(d * 100).toFixed(1)}pp vs SY23-24`, dir: improved ? 'up' : 'down' };
}

export default function DataTab({ schoolId }) {
  const school = SYSTEM_DATA.find(s => s.id === schoolId) || SYSTEM_DATA.find(s => s.id === 'mather');
  const schoolInfo = SCHOOLS.find(s => s.id === schoolId) || SCHOOLS.find(s => s.id === 'mather');
  const isMather = schoolId === 'mather' || !SYSTEM_DATA.find(s => s.id === schoolId);
  const matherD = MATHER_DATA.data;

  const attendanceTrend = YEARS.map((y, i) => ({
    year: y.replace('SY',''),
    'Attendance %': school.ada[i] !== null ? +(school.ada[i] * 100).toFixed(1) : null,
    'Chronic Absent %': school.ca[i] !== null ? +(school.ca[i] * 100).toFixed(1) : null,
  }));

  const belongingTrend = YEARS.map((y, i) => ({
    year: y.replace('SY',''),
    'Belonging': school.bel[i] !== null ? +(school.bel[i] * 100).toFixed(1) : null,
  }));

  const caD = delta(school.ca[0], school.ca[2], true);
  const adaD = delta(school.ada[0], school.ada[2], false);
  const aotD = delta(school.aot[0], school.aot[2], false);
  const belD = delta(school.bel[0], school.bel[2], false);

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 16, fontWeight: 500, color: 'var(--text)' }}>
          Data Review — {schoolInfo?.name}
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
          3-year trends · SY23-24 through SY25-26 · Source: Panorama / Lighthouse
        </div>
      </div>

      {/* Metric cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px,1fr))', gap: 10, marginBottom: 16 }}>
        <MetricCard label="Enrollment" value={school.enroll[2]?.toLocaleString() || '—'}
          delta={school.enroll[0] ? `${school.enroll[2] - school.enroll[0] >= 0 ? '+' : ''}${school.enroll[2] - school.enroll[0]} vs SY23-24` : null}
          deltaDir={school.enroll[2] >= school.enroll[0] ? 'up' : 'down'} />
        <MetricCard label="Avg Daily Attendance" value={pct(school.ada[2])}
          delta={adaD?.text} deltaDir={adaD?.dir} accent="teal" />
        <MetricCard label="Chronic Absenteeism" value={pct(school.ca[2])}
          delta={caD?.text} deltaDir={caD?.dir} accent="orange" />
        <MetricCard label="Academics On Track" value={pct(school.aot[2])}
          delta={aotD?.text} deltaDir={aotD?.dir} accent={aotD?.dir === 'up' ? 'teal' : 'red'} />
        <MetricCard label="Sense of Belonging" value={pct(school.bel[2])}
          delta={belD?.text} deltaDir={belD?.dir} accent="blue" />
        <MetricCard label="Econ. Disadvantaged" value={pct(school.eco[2])} accent="orange" />
      </div>

      <div className="grid-2" style={{ marginBottom: 12 }}>
        {/* Attendance chart */}
        <Card title="Attendance & Chronic Absenteeism — 3-Year Trend">
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={attendanceTrend} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="year" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} domain={[60, 100]} />
              <Tooltip formatter={v => v ? `${v}%` : '—'} contentStyle={{ background: '#1e2a3a', border: '0.5px solid rgba(255,255,255,0.1)', fontSize: 11 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="Attendance %" stroke="#1D9E75" strokeWidth={2} dot={{ r: 3 }} connectNulls />
              <Line type="monotone" dataKey="Chronic Absent %" stroke="#E24B4A" strokeWidth={2} dot={{ r: 3 }} connectNulls />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Belonging chart */}
        <Card title="Sense of Belonging — 3-Year Trend">
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={belongingTrend} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="year" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} domain={[20, 80]} tickFormatter={v => `${v}%`} />
              <Tooltip formatter={v => v ? `${v}%` : '—'} contentStyle={{ background: '#1e2a3a', border: '0.5px solid rgba(255,255,255,0.1)', fontSize: 11 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="Belonging" stroke="#185FA5" strokeWidth={2} dot={{ r: 3 }} connectNulls />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <div className="grid-2">
        {/* Academics by subgroup — Mather only for now, others show available data */}
        <Card title="Academics On Track by Subgroup (SY25-26)">
          {isMather ? (
            <>
              <HBar label="All Students"          pct={matherD.aot[2] * 100}         color="#185FA5" maxPct={100} />
              <HBar label="English Learners"      pct={matherD.aot_el[2] * 100}       color="#BA7517" maxPct={100} />
              <HBar label="Former EL"             pct={matherD.aot_former_el[2] * 100} color="#1D9E75" maxPct={100} />
              <HBar label="Non-EL"                pct={matherD.aot_not_el[2] * 100}   color="#185FA5" maxPct={100} />
              <HBar label="Students w/ Disab."   pct={matherD.aot_swd[2] * 100}      color="#E24B4A" maxPct={100} />
              <HBar label="Non-SWD"              pct={matherD.aot_non_swd[2] * 100}  color="#1D9E75" maxPct={100} />
            </>
          ) : (
            <>
              <HBar label="All Students" pct={school.aot[2] !== null ? school.aot[2] * 100 : 0} color="#185FA5" maxPct={100} />
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8 }}>
                Subgroup breakdown available for Mather. Additional schools will be added as AOA workbooks are updated.
              </div>
            </>
          )}
        </Card>

        {/* Demographics */}
        <Card title="Selected Populations — SY25-26">
          <SectionHeader>Key Indicators</SectionHeader>
          <HBar label="Multilingual Learners"    pct={school.ml[2]  !== null ? school.ml[2]  * 100 : 0} color="#185FA5" maxPct={100} />
          <HBar label="Students w/ Disabilities" pct={school.swd[2] !== null ? school.swd[2] * 100 : 0} color="#534AB7" maxPct={100} />
          <HBar label="Econ. Disadvantaged"      pct={school.eco[2] !== null ? school.eco[2] * 100 : 0} color="#E24B4A" maxPct={100} />
          {isMather && (
            <>
              <SectionHeader>Race & Ethnicity</SectionHeader>
              <HBar label="Black/African Am." pct={matherD.demographics.black[2]    * 100} color="#185FA5" maxPct={100} />
              <HBar label="Asian"             pct={matherD.demographics.asian[2]    * 100} color="#1D9E75" maxPct={100} />
              <HBar label="Hispanic/Latino"   pct={matherD.demographics.hispanic[2] * 100} color="#E07B3A" maxPct={100} />
              <HBar label="White"             pct={matherD.demographics.white[2]    * 100} color="#888780" maxPct={100} />
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
