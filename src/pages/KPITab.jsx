import React, { useState } from 'react';
import { Card, StatusPill, Button, Field, ProgressRing } from '../components/UI';
import { MATHER_DATA } from '../data/schoolData';
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
    <div style={{ borderBottom: '0.5px solid var(--border)', padding: '12px 0' }}>
      {editing ? (
        <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-md)', padding: 14 }}>
          <div className="grid-2">
            <Field label="Status">
              <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="% Complete">
              <input
                type="number" min="0" max="100" step="5"
                value={form.pct}
                onChange={e => setForm(f => ({ ...f, pct: Number(e.target.value) }))}
              />
            </Field>
          </div>
          <Field label="Midpoint Results">
            <textarea
              rows={3} value={form.midpoint}
              onChange={e => setForm(f => ({ ...f, midpoint: e.target.value }))}
              style={{ resize: 'vertical' }}
            />
          </Field>
          <Field label="Endline Results">
            <textarea
              rows={3} value={form.endline}
              onChange={e => setForm(f => ({ ...f, endline: e.target.value }))}
              style={{ resize: 'vertical' }}
            />
          </Field>
          <div style={{ display: 'flex', gap: 8 }}>
            <Button onClick={handleSave} disabled={saving} variant="orange" small>{saving ? 'Saving…' : 'Save'}</Button>
            <Button onClick={() => setEditing(false)} variant="ghost" small>Cancel</Button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 3fr 90px 70px 70px', gap: 10, alignItems: 'start', fontSize: 12 }}>
          <div>
            <div>{kpi.intervention}</div>
            {kpi.goalDate && (
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3 }}>
                Target: {new Date(kpi.goalDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </div>
            )}
          </div>
          <div>
            {kpi.midpoint && <div style={{ marginBottom: kpi.endline ? 4 : 0 }}><span style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Midpoint: </span>{kpi.midpoint}</div>}
            {kpi.endline && <div><span style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Endline: </span>{kpi.endline}</div>}
          </div>
          <div><StatusPill status={kpi.status} /></div>
          <div style={{ fontWeight: kpi.pct === 100 ? 600 : 400, color: kpi.pct === 100 ? 'var(--teal)' : 'var(--text)' }}>{kpi.pct}%</div>
          <div>
            {canEdit && (
              <Button onClick={() => setEditing(true)} variant="ghost" small>Edit</Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function KPITab({ schoolId }) {
  const { user } = useAuth();
  const [kpis, setKpis] = useState(MATHER_DATA.kpis);
  const canEdit = user?.role === 'coordinator' || user?.role === 'admin';

  const completedCount = kpis.filter(k => k.status === 'Done').length;
  const overallPct = Math.round((completedCount / kpis.length) * 100);

  const handleUpdate = (updated) => {
    setKpis(prev => prev.map(k => k.id === updated.id ? updated : k));
    // Save to Sheets if access token available
    if (user?.accessToken) {
      saveKPIUpdate({ ...updated, schoolId }, user.accessToken).catch(console.error);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 16, fontWeight: 500 }}>KPI Tracker — Built-in Intervention & Implementation</div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Mather Elementary · Coordinator: Lori Thames · SY25-26</div>
      </div>

      {/* Overall rate */}
      <div style={{
        background: 'var(--card)', border: '0.5px solid var(--border)', borderRadius: 'var(--radius-lg)',
        padding: 16, display: 'flex', alignItems: 'center', gap: 16, marginBottom: 14,
      }}>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ProgressRing pct={overallPct} size={56} />
          <div style={{ position: 'absolute', fontSize: 12, fontWeight: 600, color: 'var(--orange)' }}>{overallPct}%</div>
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 500 }}>KPI % Completion Rate</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
            {completedCount} of {kpis.length} interventions marked Done
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
            Goal: decrease chronic absenteeism 1% + increase sense of belonging
          </div>
        </div>
        {canEdit && (
          <div style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--text-hint)', textAlign: 'right' }}>
            Click "Edit" on any row<br />to update status & results
          </div>
        )}
      </div>

      {/* Long-term goal banner */}
      <div style={{ background: 'var(--navy)', borderRadius: 'var(--radius-lg)', padding: '10px 14px', marginBottom: 12, fontSize: 12, color: 'rgba(255,255,255,0.85)', lineHeight: 1.5 }}>
        <span style={{ color: 'var(--orange)', fontWeight: 500 }}>QSP Long-Term Goal: </span>
        {kpis[0]?.longTermGoal}
      </div>

      {/* Intervention table */}
      <Card>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 3fr 90px 70px 70px', gap: 10, fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', paddingBottom: 8, borderBottom: '0.5px solid var(--border)' }}>
          <div>Intervention</div>
          <div>Results</div>
          <div>Status</div>
          <div>% Done</div>
          <div></div>
        </div>
        {kpis.map(kpi => (
          <KPIRow key={kpi.id} kpi={kpi} onUpdate={handleUpdate} canEdit={canEdit} />
        ))}
      </Card>
    </div>
  );
}
