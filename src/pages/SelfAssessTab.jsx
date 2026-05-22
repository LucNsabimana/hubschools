import React, { useState } from 'react';
import { Card, MaturityBadge, Button, Field } from '../components/UI';
import { MATHER_DATA, SCHOOLS } from '../data/schoolData';

const RATINGS = ['Emerging', 'Maturing', 'Transforming'];

function AssessRow({ item, onUpdate, canEdit }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ ...item });
  return (
    <div style={{ padding: '10px 0', borderBottom: '0.5px solid var(--border)' }}>
      {editing ? (
        <div style={{ background: 'var(--surface)', borderRadius: 8, padding: 12 }}>
          <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 10 }}>{item.area}</div>
          <Field label="Rating">
            <select value={form.rating || ''} onChange={e => setForm(f => ({ ...f, rating: e.target.value || null }))}>
              <option value="">— Not assessed</option>
              {RATINGS.map(r => <option key={r}>{r}</option>)}
            </select>
          </Field>
          <Field label="Notes / Supporting Evidence">
            <textarea rows={3} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} style={{ resize: 'vertical' }} />
          </Field>
          <div style={{ display: 'flex', gap: 8 }}>
            <Button variant="orange" small onClick={() => { onUpdate(form); setEditing(false); }}>Save</Button>
            <Button variant="ghost" small onClick={() => setEditing(false)}>Cancel</Button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 500 }}>{item.area}</div>
            {item.notes && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, lineHeight: 1.5 }}>{item.notes}</div>}
          </div>
          <MaturityBadge rating={item.rating} />
          {canEdit && <Button variant="ghost" small onClick={() => setEditing(true)}>Edit</Button>}
        </div>
      )}
    </div>
  );
}

function NoData({ schoolName }) {
  return (
    <div style={{ textAlign: 'center', padding: '48px 20px' }}>
      <div style={{ fontSize: 32, marginBottom: 12, opacity: 0.3 }}>✓</div>
      <div style={{ fontSize: 15, fontWeight: 500, color: '#e2e0db', marginBottom: 6 }}>Self-assessment not yet completed</div>
      <div style={{ fontSize: 13, color: '#8b8885', lineHeight: 1.7, maxWidth: 400, margin: '0 auto' }}>
        The Hub School Self-Assessment rubric for {schoolName} has not been filled in yet.<br />
        Coordinators complete this in their AOA workbook each year.
      </div>
    </div>
  );
}

export default function SelfAssessTab({ schoolId }) {
  const schoolName = SCHOOLS.find(s => s.id === schoolId)?.name || schoolId;
  const isMather = schoolId === 'mather';
  const [data, setData] = useState(MATHER_DATA.selfAssessment);

  const updateItem = (section, idx, updated) => {
    setData(prev => ({ ...prev, [section]: prev[section].map((item, i) => i === idx ? updated : item) }));
  };

  const ratingScore = { 'Emerging': 1, 'Maturing': 2, 'Transforming': 3 };
  const allRated = [...data.whodrives, ...data.enabling, ...data.keypractices].filter(i => i.rating);
  const avgScore = allRated.length > 0 ? allRated.reduce((s, i) => s + (ratingScore[i.rating] || 0), 0) / allRated.length : 0;

  const sections = [
    { key: 'whodrives',   title: 'Who Drives This Work',  items: data.whodrives },
    { key: 'enabling',    title: 'Enabling Conditions',    items: data.enabling },
    { key: 'keypractices',title: 'Key Practices',          items: data.keypractices },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 16, fontWeight: 500, color: '#e2e0db' }}>Hub School Self-Assessment — {schoolName}</div>
        <div style={{ fontSize: 12, color: '#8b8885', marginTop: 2 }}>Strategy Implementation Rubric: Emerging → Maturing → Transforming</div>
      </div>

      {!isMather ? (
        <div style={{ background: '#1e2a3a', borderRadius: 8 }}>
          <NoData schoolName={schoolName} />
        </div>
      ) : (
        <>
          <div style={{ background: 'var(--card)', border: '0.5px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 16, display: 'flex', gap: 20, marginBottom: 14, alignItems: 'center', flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Overall Maturity</div>
              <MaturityBadge rating={avgScore >= 2.5 ? 'Transforming' : avgScore >= 1.5 ? 'Maturing' : 'Emerging'} />
            </div>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              {sections.map(s => {
                const rated = s.items.filter(i => i.rating);
                return (
                  <div key={s.key} style={{ fontSize: 12 }}>
                    <div style={{ fontWeight: 500, marginBottom: 3 }}>{s.title}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                      {rated.filter(i => i.rating === 'Transforming').length > 0 && <span style={{ color: '#5DCAA5' }}>{rated.filter(i => i.rating === 'Transforming').length} Transforming </span>}
                      {rated.filter(i => i.rating === 'Maturing').length > 0 && <span style={{ color: '#85B7EB' }}>{rated.filter(i => i.rating === 'Maturing').length} Maturing </span>}
                      {rated.filter(i => i.rating === 'Emerging').length > 0 && <span style={{ color: '#FAC775' }}>{rated.filter(i => i.rating === 'Emerging').length} Emerging</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          {sections.map(section => (
            <Card key={section.key} title={section.title} style={{ marginBottom: 12 }}>
              {section.items.map((item, idx) => (
                <AssessRow key={item.area} item={item} canEdit={true} onUpdate={(updated) => updateItem(section.key, idx, updated)} />
              ))}
            </Card>
          ))}
        </>
      )}
    </div>
  );
}
