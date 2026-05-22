import React, { useState } from 'react';
import { Card, StatusPill, Button, Field, ProgressRing } from '../components/UI';
import { SCHOOL_KPIS, SCHOOLS } from '../data/schoolData';
import { useAuth } from '../hooks/useAuth';

const STATUS_OPTIONS = ['Not Started', 'In Progress', 'Done', 'Planning'];

const inp = {
  background: '#0f1623', border: '0.5px solid rgba(255,255,255,0.15)',
  borderRadius: 5, color: '#e2e0db', fontSize: 12, padding: '6px 9px',
  width: '100%', outline: 'none', fontFamily: 'inherit',
};

function KPIRow({ kpi, onUpdate, onDelete, canEdit }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm]       = useState({ ...kpi });

  return (
    <div style={{ padding: '12px 0', borderBottom: '0.5px solid var(--border)' }}>
      {editing ? (
        <div style={{ background: 'var(--surface)', borderRadius: 8, padding: 12 }}>
          <Field label="Long-term Goal">
            <textarea rows={2} style={{ ...inp, resize: 'vertical' }} value={form.longTermGoal || ''} onChange={e => setForm(f => ({ ...f, longTermGoal: e.target.value }))} />
          </Field>
          <Field label="Intervention / Action">
            <textarea rows={3} style={{ ...inp, resize: 'vertical' }} value={form.intervention || ''} onChange={e => setForm(f => ({ ...f, intervention: e.target.value }))} />
          </Field>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
            <Field label="Status">
              <select style={inp} value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="% Complete">
              <input style={inp} type="number" min={0} max={100} value={form.pct || 0} onChange={e => setForm(f => ({ ...f, pct: parseInt(e.target.value) || 0 }))} />
            </Field>
            <Field label="Goal Date">
              <input style={inp} value={form.goalDate || ''} onChange={e => setForm(f => ({ ...f, goalDate: e.target.value }))} placeholder="e.g. 2026-06-19" />
            </Field>
          </div>
          <Field label="Midpoint Update">
            <textarea rows={2} style={{ ...inp, resize: 'vertical' }} value={form.midpoint || ''} onChange={e => setForm(f => ({ ...f, midpoint: e.target.value }))} />
          </Field>
          <Field label="Endline / Result">
            <textarea rows={2} style={{ ...inp, resize: 'vertical' }} value={form.endline || ''} onChange={e => setForm(f => ({ ...f, endline: e.target.value }))} />
          </Field>
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <button onClick={() => { onUpdate(form); setEditing(false); }} style={{ background: '#E07B3A', color: 'white', border: 'none', borderRadius: 5, padding: '5px 14px', fontSize: 11, fontWeight: 500, cursor: 'pointer' }}>Save</button>
            <button onClick={() => { setForm({ ...kpi }); setEditing(false); }} style={{ background: 'rgba(255,255,255,0.05)', color: '#8b8885', border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: 5, padding: '5px 12px', fontSize: 11, cursor: 'pointer' }}>Cancel</button>
            {onDelete && <button onClick={onDelete} style={{ marginLeft: 'auto', background: 'rgba(163,45,45,0.2)', color: '#F09595', border: 'none', borderRadius: 5, padding: '5px 10px', fontSize: 11, cursor: 'pointer' }}>Delete</button>}
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <ProgressRing pct={form.pct || 0} size={44} strokeWidth={4} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4, flexWrap: 'wrap' }}>
              <StatusPill status={form.status} />
              {form.goalDate && <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Goal: {form.goalDate}</span>}
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{form.pct}% complete</span>
            </div>
            <div style={{ fontSize: 12, color: 'var(--text)', lineHeight: 1.5, marginBottom: form.midpoint ? 6 : 0 }}>{form.intervention}</div>
            {form.midpoint && (
              <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.5, background: 'var(--surface)', borderRadius: 6, padding: '6px 8px', marginTop: 6 }}>
                📍 {form.midpoint}
              </div>
            )}
            {form.endline && <div style={{ fontSize: 11, color: '#5DCAA5', marginTop: 4 }}>✓ {form.endline}</div>}
          </div>
          {canEdit && (
            <button onClick={() => setEditing(true)} style={{ background: 'rgba(255,255,255,0.05)', color: '#8b8885', border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: 5, padding: '3px 10px', fontSize: 11, cursor: 'pointer', flexShrink: 0 }}>Edit</button>
          )}
        </div>
      )}
    </div>
  );
}

export default function KPITab({ schoolId }) {
  const { user } = useAuth();
  const canEdit    = user?.role === 'system_leader' || user?.role === 'admin';
  const schoolName = SCHOOLS.find(s => s.id === schoolId)?.name || schoolId;

  // Use winthrop data for clap_winthrop key
  const kpiKey = schoolId === 'winthrop' ? 'clap_winthrop' : schoolId;
  const base   = SCHOOL_KPIS[kpiKey] || [];
  const [kpis, setKpis] = useState(base);

  const onUpdate = (updated) => setKpis(prev => prev.map(k => k.id === updated.id ? updated : k));
  const onDelete = (id)      => setKpis(prev => prev.filter(k => k.id !== id));
  const onAdd    = ()        => setKpis(prev => [...prev, {
    id: `${schoolId}-kpi-${Date.now()}`,
    longTermGoal: '', intervention: '', goalDate: '',
    midpoint: '', endline: '', status: 'Not Started', pct: 0,
  }]);

  const done       = kpis.filter(k => k.status === 'Done').length;
  const inProgress = kpis.filter(k => k.status === 'In Progress').length;
  const avgPct     = kpis.length > 0 ? Math.round(kpis.reduce((s, k) => s + (k.pct || 0), 0) / kpis.length) : 0;

  // Group by long-term goal
  const goalGroups = [];
  const seenGoals  = new Set();
  kpis.forEach(k => {
    const g = k.longTermGoal || '';
    if (!seenGoals.has(g)) { seenGoals.add(g); goalGroups.push({ goal: g, items: [] }); }
    goalGroups.find(gr => gr.goal === g).items.push(k);
  });

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 500, color: '#e2e0db' }}>KPI Tracker — {schoolName}</div>
          <div style={{ fontSize: 12, color: '#8b8885', marginTop: 2 }}>
            Intervention tracking · Progress updates · Endline results
            {' '}<span style={{ color: '#FAC775', background: 'rgba(186,117,23,0.12)', padding: '1px 6px', borderRadius: 3, fontSize: 11 }}>Data as of May 1, 2026</span>
          </div>
        </div>
        {canEdit && (
          <button onClick={onAdd} style={{ background: '#E07B3A', color: 'white', border: 'none', borderRadius: 6, padding: '6px 14px', fontSize: 12, fontWeight: 500, cursor: 'pointer', flexShrink: 0 }}>
            + Add KPI
          </button>
        )}
      </div>

      {kpis.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 16 }}>
          {[
            { label: 'Total KPIs',   value: kpis.length,  color: '#e2e0db' },
            { label: 'In Progress',  value: inProgress,   color: '#85B7EB' },
            { label: 'Completed',    value: done,         color: '#5DCAA5' },
            { label: 'Avg Progress', value: `${avgPct}%`, color: '#FAC775' },
          ].map(m => (
            <div key={m.label} style={{ background: '#1e2a3a', borderRadius: 8, padding: '12px 14px', textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 500, color: m.color }}>{m.value}</div>
              <div style={{ fontSize: 10, color: '#8b8885', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 3 }}>{m.label}</div>
            </div>
          ))}
        </div>
      )}

      {kpis.length === 0 ? (
        <div style={{ background: '#1e2a3a', borderRadius: 8, padding: '48px 20px', textAlign: 'center' }}>
          <div style={{ fontSize: 32, marginBottom: 12, opacity: 0.3 }}>◈</div>
          <div style={{ fontSize: 15, fontWeight: 500, color: '#e2e0db', marginBottom: 6 }}>No KPIs yet</div>
          <div style={{ fontSize: 13, color: '#8b8885', lineHeight: 1.7, maxWidth: 380, margin: '0 auto 16px' }}>
            Add Key Practice Indicators to track this school's interventions and progress.
          </div>
          {canEdit && (
            <button onClick={onAdd} style={{ background: '#E07B3A', color: 'white', border: 'none', borderRadius: 6, padding: '8px 18px', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
              + Add first KPI
            </button>
          )}
        </div>
      ) : (
        goalGroups.map((group, gi) => (
          <div key={gi} style={{ marginBottom: 12 }}>
            {group.goal && (
              <div style={{ background: 'rgba(224,123,58,0.08)', border: '0.5px solid rgba(224,123,58,0.2)', borderRadius: 8, padding: '10px 14px', marginBottom: 8, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'rgba(224,123,58,0.2)', border: '1px solid rgba(224,123,58,0.4)', color: '#E07B3A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 600, flexShrink: 0, marginTop: 1 }}>
                  {String(gi + 1).padStart(2, '0')}
                </div>
                <div style={{ fontSize: 12, color: '#e2e0db', lineHeight: 1.5 }}>{group.goal}</div>
              </div>
            )}
            <Card>
              {group.items.map(k => (
                <KPIRow
                  key={k.id}
                  kpi={k}
                  canEdit={canEdit}
                  onUpdate={onUpdate}
                  onDelete={canEdit ? () => onDelete(k.id) : null}
                />
              ))}
            </Card>
          </div>
        ))
      )}
    </div>
  );
}
