import React from 'react';
import { Card, Avatar } from '../components/UI';
import { MATHER_DATA, SCHOOL_OVERVIEWS, SYSTEM_DATA } from '../data/schoolData';

export default function OverviewTab({ schoolId }) {
  const overview = SCHOOL_OVERVIEWS[schoolId] || MATHER_DATA.overview;
  const sysSchool = SYSTEM_DATA.find(s => s.id === schoolId);
  const enrollment = sysSchool ? sysSchool.enroll[2] : (MATHER_DATA.data?.enrollment?.[2] || '—');

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 16, fontWeight: 500 }}>{overview.name}</div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
          SY25-26 · Coordinator: {overview.coordinator || '—'} · Lead Partner: {overview.leadPartner || '—'}
        </div>
      </div>

      <div className="grid-2">
        <div>
          <Card title="School Information" style={{ marginBottom: 10 }}>
            {[
              ['Grades', overview.grades],
              ['Address', overview.address],
              ['Lead Partner', overview.leadPartner],
              ['School Leader', overview.schoolLeader],
              ['School Coordinator', overview.coordinator],
              ['Enrollment (SY25-26)', enrollment ? `${enrollment.toLocaleString()} students` : '—'],
            ].map(([label, value]) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '0.5px solid var(--border)', fontSize: 12 }}>
                <span style={{ color: 'var(--text-muted)' }}>{label}</span>
                <span style={{ fontWeight: 500, textAlign: 'right', maxWidth: '55%' }}>{value || '—'}</span>
              </div>
            ))}
            {overview.types && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 12 }}>
                <span style={{ color: 'var(--text-muted)' }}>School Type(s)</span>
                <span style={{ fontWeight: 500, textAlign: 'right', maxWidth: '55%' }}>{overview.types.join(', ')}</span>
              </div>
            )}
          </Card>

          {overview.teams && (
            <Card title="Active Leadership Teams">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
                {overview.teams.map(t => (
                  <span key={t.name} style={{ fontSize: 11, color: t.active ? '#5DCAA5' : 'var(--text-hint)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span>{t.active ? '●' : '○'}</span> {t.name}
                  </span>
                ))}
              </div>
            </Card>
          )}
        </div>

        <div>
          {overview.aoa_team && overview.aoa_team.length > 0 && (
            <Card title="AOA Team" style={{ marginBottom: 10 }}>
              {overview.aoa_team.map((m, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 0', borderBottom: i < overview.aoa_team.length - 1 ? '0.5px solid var(--border)' : 'none' }}>
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
          )}

          {overview.qspGoals && (
            <Card title="SY26 QSP Priority Goals">
              {overview.qspGoals.map((g, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, marginBottom: i < overview.qspGoals.length - 1 ? 8 : 0, fontSize: 12, lineHeight: 1.5 }}>
                  <span style={{ color: 'var(--orange)', fontWeight: 500, flexShrink: 0 }}>Priority #{i + 1}</span>
                  <span>{g}</span>
                </div>
              ))}
            </Card>
          )}

          {/* Quick stats card for schools without full profile */}
          {sysSchool && (
            <Card title="SY25-26 Key Metrics">
              {[
                ['Chronic Absenteeism', sysSchool.ca[2] !== null ? `${(sysSchool.ca[2]*100).toFixed(1)}%` : '—'],
                ['Avg Daily Attendance', sysSchool.ada[2] !== null ? `${(sysSchool.ada[2]*100).toFixed(1)}%` : '—'],
                ['Academics On Track', sysSchool.aot[2] !== null ? `${(sysSchool.aot[2]*100).toFixed(1)}%` : '—'],
                ['Sense of Belonging', sysSchool.bel[2] !== null ? `${(sysSchool.bel[2]*100).toFixed(1)}%` : '—'],
                ['Multilingual Learners', sysSchool.ml[2] !== null ? `${(sysSchool.ml[2]*100).toFixed(1)}%` : '—'],
                ['Students w/ Disabilities', sysSchool.swd[2] !== null ? `${(sysSchool.swd[2]*100).toFixed(1)}%` : '—'],
                ['Economically Disadvantaged', sysSchool.eco[2] !== null ? `${(sysSchool.eco[2]*100).toFixed(1)}%` : '—'],
              ].map(([label, value]) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '0.5px solid var(--border)', fontSize: 12 }}>
                  <span style={{ color: 'var(--text-muted)' }}>{label}</span>
                  <span style={{ fontWeight: 500 }}>{value}</span>
                </div>
              ))}
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
