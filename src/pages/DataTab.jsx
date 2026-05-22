import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';
import { Card, MetricCard, HBar, SectionHeader } from '../components/UI';
import { MATHER_DATA, YEARS } from '../data/schoolData';

function pct(v) { return v !== null && v !== undefined ? `${(v * 100).toFixed(1)}%` : '—'; }
function pp(a, b) {
  if (a === null || b === null) return null;
  return b - a;
}

export default function DataTab({ schoolId }) {
  const d = MATHER_DATA.data; // TODO: load by schoolId

  const attendanceTrend = YEARS.map((y, i) => ({
    year: y,
    'Attendance %': Math.round(d.ada[i] * 1000) / 10,
    'Chronic Absent %': Math.round(d.ca[i] * 1000) / 10,
  }));

  const belongingTrend = YEARS.map((y, i) => ({
    year: y,
    'Grades 3–5': d.belonging_35[i] !== null ? Math.round(d.belonging_35[i] * 1000) / 10 : null,
    'Grades 6+': d.belonging_6up[i] !== null ? Math.round(d.belonging_6up[i] * 1000) / 10 : null,
  }));

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 16, fontWeight: 500 }}>School Data Review — Mather Elementary</div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>3-year trends. Source: Panorama / Lighthouse. Updated January 2026.</div>
      </div>

      {/* Metric cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px,1fr))', gap: 10, marginBottom: 16 }}>
        <MetricCard label="Enrollment" value={d.enrollment[2].toLocaleString()} delta={`▲ +${d.enrollment[2] - d.enrollment[0]} vs SY23-24`} deltaDir="up" />
        <MetricCard label="Avg Daily Attendance" value={pct(d.ada[2])} delta={`▼ ${pct(Math.abs(pp(d.ada[0], d.ada[2])))} vs SY23-24`} deltaDir="down" accent="teal" />
        <MetricCard label="Chronic Absenteeism" value={pct(d.ca[2])} delta={`▲ Improving −${pct(Math.abs(pp(d.ca[0], d.ca[2])))}`} deltaDir="up" accent="orange" />
        <MetricCard label="Academics On Track" value={pct(d.aot[2])} delta={`▼ −${pct(Math.abs(pp(d.aot[0], d.aot[2])))} vs SY23-24`} deltaDir="down" accent="red" />
        <MetricCard label="Sense of Belonging" value={pct(d.belonging_all[2])} delta={`▲ +${pct(Math.abs(pp(d.belonging_all[0], d.belonging_all[2])))} vs SY23-24`} deltaDir="up" accent="blue" />
        <MetricCard label="School Safety" value={pct(d.safety_35[2])} delta={`▲ +${pct(Math.abs(pp(d.safety_35[0], d.safety_35[2])))} vs SY23-24`} deltaDir="up" accent="teal" />
      </div>

      <div className="grid-2" style={{ marginBottom: 12 }}>
        {/* Attendance chart */}
        <Card title="Attendance — 3-Year Trend">
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={attendanceTrend} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="year" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} domain={[70, 100]} />
              <Tooltip formatter={(v) => `${v}%`} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="Attendance %" stroke="#1D9E75" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="Chronic Absent %" stroke="#E24B4A" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Belonging chart */}
        <Card title="Sense of Belonging — 3-Year Trend">
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={belongingTrend} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="year" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} domain={[30, 80]} tickFormatter={v => `${v}%`} />
              <Tooltip formatter={(v) => v ? `${v}%` : '—'} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="Grades 3–5" stroke="#185FA5" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="Grades 6+" stroke="#E07B3A" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <div className="grid-2">
        {/* Academics by subgroup */}
        <Card title="Academics On Track by Subgroup (SY25-26)">
          <HBar label="All Students" pct={d.aot[2] * 100} color="var(--blue)" maxPct={100} />
          <HBar label="English Learners" pct={d.aot_el[2] * 100} color="var(--amber)" maxPct={100} />
          <HBar label="Former EL" pct={d.aot_former_el[2] * 100} color="var(--teal)" maxPct={100} />
          <HBar label="Non-EL" pct={d.aot_not_el[2] * 100} color="#185FA5" maxPct={100} />
          <HBar label="Students w/ Disabilities" pct={d.aot_swd[2] * 100} color="var(--red)" maxPct={100} />
          <HBar label="Non-SWD" pct={d.aot_non_swd[2] * 100} color="#1D9E75" maxPct={100} />
        </Card>

        {/* Demographics */}
        <Card title="Demographics — SY25-26">
          <SectionHeader>Race & Ethnicity</SectionHeader>
          <HBar label="Black/African American" pct={d.demographics.black[2] * 100} color="#185FA5" />
          <HBar label="Asian" pct={d.demographics.asian[2] * 100} color="#1D9E75" />
          <HBar label="Hispanic/Latino" pct={d.demographics.hispanic[2] * 100} color="var(--orange)" />
          <HBar label="White" pct={d.demographics.white[2] * 100} color="#888780" />
          <HBar label="Multi-Race" pct={d.demographics.multi[2] * 100} color="#534AB7" />
          <SectionHeader>Populations</SectionHeader>
          <HBar label="Econ. Disadvantaged" pct={d.demographics.econ_dis[2] * 100} color="var(--red)" />
          <HBar label="Students w/ Disabilities" pct={d.demographics.swd[2] * 100} color="var(--purple)" />
          <HBar label="Multilingual Learners" pct={d.demographics.ml[2] * 100} color="var(--teal)" />
        </Card>
      </div>
    </div>
  );
}
