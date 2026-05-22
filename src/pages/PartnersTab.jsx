import React, { useState } from 'react';
import { Card, StatusPill, MetricCard, Button, Field } from '../components/UI';
import { MATHER_DATA, SCHOOL_PARTNERS, SCHOOLS } from '../data/schoolData';
import { useAuth } from '../hooks/useAuth';

const STATUSES   = ['Active', 'Potential', 'Inactive'];
const PROGRESSES = ['Exceeding Expectations', 'Meeting Expectations', 'Below Expectations', 'Far below expectations', ''];
const TYPES      = ['School-Based Partnership', 'Community-Based Partnership', 'Higher Education', 'Government', 'School Asset', 'Community Asset'];
const PRACTICES  = ['Collaborative Leadership, Shared Power and Voice', 'Expanded, Enriched Learning Opportunities', 'Rigorous Community-Connected Instruction', 'Culture of Belonging, Safety and Care', 'Integrated Systems of Support', 'Powerful Student & Family Engagement', ''];

const inp = {
  background: '#0f1623', border: '0.5px solid rgba(255,255,255,0.15)',
  borderRadius: 5, color: '#e2e0db', fontSize: 12, padding: '5px 8px',
  width: '100%', outline: 'none', fontFamily: 'inherit',
};

function PartnerRow({ partner, onUpdate, onDelete, canEdit }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm]       = useState({ ...partner });
  const f = v => e => setForm(p => ({ ...p, [v]: e.target.value }));

  return (
    <tr style={{ borderBottom: '0.5px solid var(--border)' }}
        onMouseEnter={e => !editing && (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
      {editing ? (
        <td colSpan={8} style={{ padding: '10px 8px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 8 }}>
            <Field label="Organization"><input style={inp} value={form.name || ''} onChange={f('name')} /></Field>
            <Field label="Type"><select style={inp} value={form.type || ''} onChange={f('type')}>{TYPES.map(v => <option key={v}>{v}</option>)}</select></Field>
            <Field label="Program Focus"><input style={inp} value={form.focus || ''} onChange={f('focus')} /></Field>
            <Field label="Key Practice"><select style={inp} value={form.practice || ''} onChange={f('practice')}>{PRACTICES.map(v => <option key={v} value={v}>{v || '— None —'}</option>)}</select></Field>
            <Field label="BOY Status"><select style={inp} value={form.boy || 'Active'} onChange={f('boy')}>{STATUSES.map(v => <option key={v}>{v}</option>)}</select></Field>
            <Field label="Mid-Year Status"><select style={inp} value={form.mid || 'Active'} onChange={f('mid')}>{STATUSES.map(v => <option key={v}>{v}</option>)}</select></Field>
            <Field label="Progress" style={{ gridColumn: '1 / -1' }}>
              <select style={inp} value={form.progress || ''} onChange={f('progress')}>{PROGRESSES.map(v => <option key={v} value={v}>{v || '— Not assessed —'}</option>)}</select>
            </Field>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => { onUpdate(form); setEditing(false); }} style={{ background: '#E07B3A', color: 'white', border: 'none', borderRadius: 5, padding: '4px 12px', fontSize: 11, fontWeight: 500, cursor: 'pointer' }}>Save</button>
            <button onClick={() => { setForm({ ...partner }); setEditing(false); }} style={{ background: 'rgba(255,255,255,0.05)', color: '#8b8885', border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: 5, padding: '4px 10px', fontSize: 11, cursor: 'pointer' }}>Cancel</button>
            <button onClick={onDelete} style={{ marginLeft: 'auto', background: 'rgba(163,45,45,0.18)', color: '#F09595', border: 'none', borderRadius: 5, padding: '4px 10px', fontSize: 11, cursor: 'pointer' }}>Delete</button>
          </div>
        </td>
      ) : (
        <>
          <td style={{ padding: '7px 8px', fontWeight: 500, fontSize: 12 }}>{form.name}</td>
          <td style={{ padding: '7px 8px', color: 'var(--text-muted)', fontSize: 11 }}>{form.type?.replace(' Partnership','')}</td>
          <td style={{ padding: '7px 8px', color: 'var(--text-muted)', fontSize: 11 }}>{form.focus}</td>
          <td style={{ padding: '7px 8px', color: 'var(--text-muted)', fontSize: 11, maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{form.practice}</td>
          <td style={{ padding: '7px 8px' }}><StatusPill status={form.boy} /></td>
          <td style={{ padding: '7px 8px' }}><StatusPill status={form.mid} /></td>
          <td style={{ padding: '7px 8px' }}>{form.progress ? <StatusPill status={form.progress} /> : <span style={{ color: '#8b8885', fontSize: 11 }}>—</span>}</td>
          {canEdit && <td style={{ padding: '7px 8px' }}>
            <button onClick={() => setEditing(true)} style={{ background: 'rgba(255,255,255,0.05)', color: '#8b8885', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: 4, padding: '2px 8px', fontSize: 10, cursor: 'pointer' }}>Edit</button>
          </td>}
        </>
      )}
    </tr>
  );
}

const EMPTY_PARTNER = { name: '', type: 'School-Based Partnership', focus: '', practice: '', boy: 'Active', mid: 'Active', progress: '' };

export default function PartnersTab({ schoolId }) {
  const { user } = useAuth();
  const canEdit   = user?.role === 'system_leader' || user?.role === 'admin';
  const schoolName = SCHOOLS.find(s => s.id === schoolId)?.name || schoolId;
  const isMather  = schoolId === 'mather';

  const [partners, setPartners] = useState(SCHOOL_PARTNERS[schoolId] || []);
  const [filter,   setFilter]   = useState('all');
  const [showAdd,  setShowAdd]  = useState(false);
  const [newP,     setNewP]     = useState({ ...EMPTY_PARTNER });

  const onUpdate = (updated) => setPartners(prev => prev.map(p => p === updated || p.name === updated.name ? updated : p));
  const onDelete = (partner) => setPartners(prev => prev.filter(p => p !== partner));
  const handleAdd = () => {
    if (!newP.name.trim()) return;
    setPartners(prev => [...prev, { ...newP, id: Date.now() }]);
    setNewP({ ...EMPTY_PARTNER });
    setShowAdd(false);
  };

  const active    = partners.filter(p => p.mid === 'Active').length;
  const inactive  = partners.filter(p => p.mid === 'Inactive').length;
  const potential = partners.filter(p => p.mid === 'Potential').length;
  const inkind    = isMather ? MATHER_DATA.roi.inkind.reduce((s, r) => s + r.value, 0) : 0;
  const grants    = isMather ? MATHER_DATA.roi.grants.reduce((s, r) => s + (r.awarded || 0), 0) : 0;

  const filtered = partners.filter(p => {
    if (filter === 'active')    return p.mid === 'Active';
    if (filter === 'inactive')  return p.mid === 'Inactive';
    if (filter === 'potential') return p.mid === 'Potential';
    return true;
  });

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 500, color: '#e2e0db' }}>Partner Quality — {schoolName}</div>
          <div style={{ fontSize: 12, color: '#8b8885', marginTop: 2 }}>
            Community and school-based partnerships · Mid-year status and progress tracking
            {' '}<span style={{ color: '#FAC775', background: 'rgba(186,117,23,0.12)', padding: '1px 6px', borderRadius: 3, fontSize: 11 }}>Data as of May 1, 2026</span>
          </div>
        </div>
        {canEdit && <button onClick={() => setShowAdd(true)} style={{ background: '#E07B3A', color: 'white', border: 'none', borderRadius: 6, padding: '6px 14px', fontSize: 12, fontWeight: 500, cursor: 'pointer', flexShrink: 0 }}>+ Add Partner</button>}
      </div>

      {/* Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${isMather ? 6 : 4},1fr)`, gap: 10, marginBottom: 14 }}>
        <MetricCard label="Total Partners" value={partners.length} />
        <MetricCard label="Active"    value={active}    accent="teal" />
        <MetricCard label="Inactive"  value={inactive}  accent="red" />
        <MetricCard label="Potential" value={potential} accent="orange" />
        {isMather && <MetricCard label="In-Kind Value"  value={`$${inkind.toLocaleString()}`}  accent="blue" />}
        {isMather && <MetricCard label="Grants Awarded" value={`$${grants.toLocaleString()}`} accent="teal" />}
      </div>

      {/* Add form */}
      {showAdd && (
        <Card title="Add New Partner" style={{ marginBottom: 12 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 8 }}>
            <Field label="Organization Name" required><input style={inp} value={newP.name} onChange={e => setNewP(p => ({ ...p, name: e.target.value }))} placeholder="Organization name" /></Field>
            <Field label="Type"><select style={inp} value={newP.type} onChange={e => setNewP(p => ({ ...p, type: e.target.value }))}>{TYPES.map(v => <option key={v}>{v}</option>)}</select></Field>
            <Field label="Program Focus"><input style={inp} value={newP.focus} onChange={e => setNewP(p => ({ ...p, focus: e.target.value }))} placeholder="e.g. Academic Enrichment" /></Field>
            <Field label="Key Practice"><select style={inp} value={newP.practice} onChange={e => setNewP(p => ({ ...p, practice: e.target.value }))}>{PRACTICES.map(v => <option key={v} value={v}>{v || '— None —'}</option>)}</select></Field>
            <Field label="BOY Status"><select style={inp} value={newP.boy} onChange={e => setNewP(p => ({ ...p, boy: e.target.value }))}>{STATUSES.map(v => <option key={v}>{v}</option>)}</select></Field>
            <Field label="Mid-Year Status"><select style={inp} value={newP.mid} onChange={e => setNewP(p => ({ ...p, mid: e.target.value }))}>{STATUSES.map(v => <option key={v}>{v}</option>)}</select></Field>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={handleAdd} style={{ background: '#E07B3A', color: 'white', border: 'none', borderRadius: 5, padding: '5px 14px', fontSize: 11, fontWeight: 500, cursor: 'pointer' }}>Save Partner</button>
            <button onClick={() => setShowAdd(false)} style={{ background: 'rgba(255,255,255,0.05)', color: '#8b8885', border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: 5, padding: '5px 12px', fontSize: 11, cursor: 'pointer' }}>Cancel</button>
          </div>
        </Card>
      )}

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 10 }}>
        {[['all','All'],['active','Active'],['inactive','Inactive'],['potential','Potential']].map(([v, label]) => (
          <button key={v} onClick={() => setFilter(v)} style={{ padding: '4px 12px', fontSize: 12, borderRadius: 6, cursor: 'pointer', border: 'none', background: filter === v ? '#1a2744' : 'rgba(255,255,255,0.05)', color: filter === v ? 'white' : '#8b8885' }}>{label}</button>
        ))}
      </div>

      {/* Partners table */}
      <Card>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead><tr style={{ borderBottom: '0.5px solid var(--border)' }}>
              {['Organization','Type','Focus','Key Practice','BOY','Mid-Year','Progress', canEdit ? '' : null].filter(Boolean).map(h => (
                <th key={h} style={{ textAlign: 'left', padding: '6px 8px', color: 'var(--text-muted)', fontWeight: 500, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {filtered.map((p, i) => (
                <PartnerRow
                  key={p.id || i}
                  partner={p}
                  canEdit={canEdit}
                  onUpdate={onUpdate}
                  onDelete={() => onDelete(p)}
                />
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={8} style={{ padding: 24, textAlign: 'center', color: '#8b8885', fontSize: 12 }}>No partners in this category.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Mather ROI */}
      {isMather && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12 }}>
          <Card title="In-Kind Donations (SY25-26)">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead><tr style={{ borderBottom: '0.5px solid var(--border)' }}>
                <th style={{ textAlign: 'left', padding: '5px 0', color: 'var(--text-muted)', fontSize: 10, fontWeight: 500, textTransform: 'uppercase' }}>Donor</th>
                <th style={{ textAlign: 'right', padding: '5px 0', color: 'var(--text-muted)', fontSize: 10, fontWeight: 500, textTransform: 'uppercase' }}>Est. Value</th>
              </tr></thead>
              <tbody>
                {MATHER_DATA.roi.inkind.map((r, i) => (
                  <tr key={i} style={{ borderBottom: '0.5px solid var(--border)' }}>
                    <td style={{ padding: '5px 0' }}><div style={{ fontWeight: 500 }}>{r.donor}</div><div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{r.purpose}</div></td>
                    <td style={{ padding: '5px 0', textAlign: 'right', fontWeight: 500 }}>${r.value.toLocaleString()}</td>
                  </tr>
                ))}
                <tr><td style={{ padding: '8px 0', fontWeight: 600 }}>Total</td><td style={{ padding: '8px 0', textAlign: 'right', fontWeight: 600, color: '#5DCAA5' }}>${inkind.toLocaleString()}</td></tr>
              </tbody>
            </table>
          </Card>
          <Card title="Grants (SY25-26)">
            {MATHER_DATA.roi.grants.map((g, i) => (
              <div key={i} style={{ padding: '8px 0', borderBottom: '0.5px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                  <span style={{ fontWeight: 500 }}>{g.name}</span>
                  <span style={{ color: g.awarded ? '#5DCAA5' : 'var(--text-muted)', fontWeight: g.awarded ? 600 : 400 }}>{g.awarded ? `$${g.awarded.toLocaleString()} awarded` : `$${g.requested.toLocaleString()} requested`}</span>
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{g.purpose}</div>
              </div>
            ))}
          </Card>
        </div>
      )}
    </div>
  );
}
