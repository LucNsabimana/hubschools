import React, { useState } from 'react';
import { Card, StatusPill, Button, Field, ProgressRing } from '../components/UI';
import { MATHER_DATA, SCHOOLS } from '../data/schoolData';
import { saveKPIUpdate } from '../utils/sheets';
import { useAuth } from '../hooks/useAuth';

const STATUS_OPTIONS = ['Not Started', 'In Progress', 'Done'];

function KPIRow({ kpi, onUpdate, canEdit }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ ...kpi });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await onUpdate(form);
    setSaving(false);
    setEditing(false);
  };

  return (
    <div style={{ padding: '12px 0', borderBottom: '0.5px solid var(--border)' }}>
      {editing ? (
        <div style={{ background: 'var(--surface)', borderRadius: 8, padding: 12 }}>
          <div className="grid-2">
            <Field label="Status">
              <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="% Complete">
              <input type="number" min={0} max={100} value={form.pct} onChange={e => setForm(f => ({ ...f, pct: parseInt(e.target.value) || 0 }))} />
            </Field>
            <Field label="Midpoint Update" style={{ gridColumn: '1 / -1' }}>
              <textarea rows={2} value={form.midpoint} onChange={e => setForm(f => ({ ...f, midpoint: e.target.value }))} style={{ resize: 'vertical' }} />
            </Field>
            <Field label="Endline / Result" style={{ gridColumn: '1 / -1' }}>
              <textarea rows={2} value={form.endline} onChange={e => setForm(f => ({ ...f, endline: e.target.value }))} style={{ resize: 'vertical' }} />
            </Field>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Button variant="orange" small onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : 'Save Update'}</Button>
            <Button variant="ghost" small onClick={() => setEditing(false)}>Cancel</Button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <ProgressRing pct={form.pct} size={44} strokeWidth={4} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4, flexWrap: 'wrap' }}>
              <StatusPill status={form.status} />
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Goal: {form.goalDate}</span>
            </div>
            <div style={{ fontSize: 12, color: 'var(--text)', lineHeight: 1.5, marginBottom: form.midpoint ? 6 : 0 }}>{form.intervention}</div>
            {form.midpoint && <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.5, background: 'var(--surface)', borderRadius: 6, padding: '6px 8px' }}>📍 {form.midpoint}</div>}
            {form.endline && <div style={{ fontSize: 11, color: '#5DCAA5', marginTop: 4 }}>✓ {form.endline}</div>}
          </div>
          {canEdit && <Button variant="ghost" small onClick={() => setEditing(true)}>Update</Button>}
        </div>
      )}
    </div>
  );
}

function NoData({ schoolName }) {
  return (
    <div style={{ textAlign: 'center', padding: '48px 20px' }}>
      <div style={{ fontSize: 32, marginBottom: 12, opacity: 0.3 }}>◈</div>
      <div style={{ fontSize: 15, fontWeight: 500, color: '#e2e0db', marginBottom: 6 }}>KPI data not yet available</div>
      <div style={{ fontSize: 13, color: '#8b8885', lineHeight: 1.7, maxWidth: 400, margin: '0 auto' }}>
        Key Practice Indicators for {schoolName} have not been entered yet.<br />
        Coordinators log KPI progress in their AOA workbook.
      </div>
    </div>
  );
}

export default function KPITab({ schoolId }) {
  const { user } = useAuth();
  const schoolName = SCHOOLS.find(s => s.id === schoolId)?.name || schoolId;
  const isMather = schoolId === 'mather';
  const canEdit = user?.role !== 'guest';
  const [kpis, setKpis] = useState(MATHER_DATA.kpis);

  const onUpdate = async (updated) => {
    setKpis(prev => prev.map(k => k.id === updated.id ? updated : k));
    if (user?.accessToken) {
      try { await saveKPIUpdate({ ...updated, schoolId }, user.accessToken); } catch {}
    }
  };

  const done = kpis.filter(k => k.status === 'Done').length;
  const inProgress = kpis.filter(k => k.status === 'In Progress').length;
  const avgPct = kpis.length > 0 ? Math.round(kpis.reduce((s, k) => s + k.pct, 0) / kpis.length) : 0;

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 16, fontWeight: 500, color: '#e2e0db' }}>KPI Tracker — {schoolName}</div>
        <div style={{ fontSize: 12, color: '#8b8885', marginTop: 2 }}>Intervention tracking · Progress updates · Endline results</div>
      </div>

      {!isMather ? (
        <div style={{ background: '#1e2a3a', borderRadius: 8 }}>
          <NoData schoolName={schoolName} />
        </div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px,1fr))', gap: 10, marginBottom: 14 }}>
            {[
              { label: 'Total KPIs',   value: kpis.length },
              { label: 'In Progress',  value: inProgress,  accent: 'blue' },
              { label: 'Completed',    value: done,         accent: 'teal' },
              { label: 'Avg Progress', value: `${avgPct}%`, accent: 'orange' },
            ].map(m => (
              <div key={m.label} style={{ background: '#1e2a3a', borderRadius: 8, padding: '12px 14px', textAlign: 'center' }}>
                <div style={{ fontSize: 22, fontWeight: 500, color: m.accent === 'teal' ? '#5DCAA5' : m.accent === 'blue' ? '#85B7EB' : m.accent === 'orange' ? '#FAC775' : '#e2e0db' }}>{m.value}</div>
                <div style={{ fontSize: 10, color: '#8b8885', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 3 }}>{m.label}</div>
              </div>
            ))}
          </div>

          {kpis.filter(k => k.longTermGoal).map((kpi, i) => (
            <Card key={kpi.id} title={`Goal ${i + 1}: ${kpi.longTermGoal.slice(0, 80)}${kpi.longTermGoal.length > 80 ? '…' : ''}`} style={{ marginBottom: 12 }}>
              {kpis.filter(k => !k.longTermGoal || k === kpi).map(k => (
                k === kpi && <KPIRow key={k.id} kpi={k} canEdit={canEdit} onUpdate={onUpdate} />
              ))}
            </Card>
          ))}

          <Card title="All Interventions">
            {kpis.map(k => (
              <KPIRow key={k.id} kpi={k} canEdit={canEdit} onUpdate={onUpdate} />
            ))}
          </Card>
        </>
      )}
    </div>
  );
}
