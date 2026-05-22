import React from 'react';
import { Card, SectionHeader, Avatar, MaturityBadge } from '../components/UI';
import { MATHER_DATA } from '../data/schoolData';

export default function OverviewTab({ schoolId }) {
  const d = MATHER_DATA.overview; // TODO: load by schoolId when all schools have data

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 16, fontWeight: 500 }}>{d.name}</div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
          SY25-26 · Coordinator: {d.coordinator} · Lead Partner: {d.leadPartner}
        </div>
      </div>

      <div className="grid-2">
        {/* Left column */}
        <div>
          <Card title="School Information" style={{ marginBottom: 10 }}>
            {[
              ['Grades', d.grades],
              ['Address', d.address],
              ['Lead Partner', d.leadPartner],
              ['School Leader', d.schoolLeader],
              ['School Coordinator', d.coordinator],
              ['Enrollment (SY25-26)', d.enrollment.toLocaleString() + ' students'],
            ].map(([label, value]) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '0.5px solid var(--border)', fontSize: 12 }}>
                <span style={{ color: 'var(--text-muted)' }}>{label}</span>
                <span style={{ fontWeight: 500, textAlign: 'right', maxWidth: '55%' }}>{value}</span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 12 }}>
              <span style={{ color: 'var(--text-muted)' }}>School Type(s)</span>
              <span style={{ fontWeight: 500, textAlign: 'right', maxWidth: '55%' }}>{d.types.join(', ')}</span>
            </div>
          </Card>

          <Card title="Active Leadership Teams">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
              {d.teams.map(t => (
                <span key={t.name} style={{ fontSize: 11, color: t.active ? 'var(--teal)' : 'var(--text-hint)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span>{t.active ? '●' : '○'}</span> {t.name}
                </span>
              ))}
            </div>
          </Card>
        </div>

        {/* Right column */}
        <div>
          <Card title="AOA Team" style={{ marginBottom: 10 }}>
            {d.aoa_team.map((m, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 0', borderBottom: i < d.aoa_team.length - 1 ? '0.5px solid var(--border)' : 'none' }}>
                <Avatar name={`${m.first} ${m.last}`} role={m.role} />
                <div>
                  <div style={{ fontSize: 12, fontWeight: 500 }}>{m.first} {m.last}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    {m.role}{m.email ? ` · ${m.email}` : ''}{m.pronouns ? ` · ${m.pronouns}` : ''}
                  </div>
                </div>
              </div>
            ))}
          </Card>

          <Card title="SY26 QSP Priority Goals">
            {d.qspGoals.map((g, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, marginBottom: i < d.qspGoals.length - 1 ? 8 : 0, fontSize: 12, lineHeight: 1.5 }}>
                <span style={{ color: 'var(--orange)', fontWeight: 500, flexShrink: 0 }}>Priority #{i + 1}</span>
                <span>{g}</span>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </div>
  );
}
