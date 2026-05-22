import React, { useState } from 'react';
import { Card, StatusPill, MetricCard, Button, Field } from '../components/UI';
import { MATHER_DATA } from '../data/schoolData';

export default function PartnersTab({ schoolId }) {
  const [partners, setPartners] = useState(MATHER_DATA.partners);
  const [filter, setFilter] = useState('all');
  const [showAdd, setShowAdd] = useState(false);
  const [newPartner, setNewPartner] = useState({ name: '', type: 'Community-Based', focus: '', practice: '', boy: 'Potential', mid: 'Potential', progress: '' });

  const active = partners.filter(p => p.boy === 'Active' || p.mid === 'Active').length;
  const inactive = partners.filter(p => p.mid === 'Inactive').length;
  const potential = partners.filter(p => p.mid === 'Potential').length;

  const inkindTotal = MATHER_DATA.roi.inkind.reduce((s, r) => s + r.value, 0);
  const grantTotal = MATHER_DATA.roi.grants.reduce((s, r) => s + (r.awarded || 0), 0);

  const filtered = partners.filter(p => {
    if (filter === 'active') return p.mid === 'Active';
    if (filter === 'inactive') return p.mid === 'Inactive';
    if (filter === 'potential') return p.mid === 'Potential';
    return true;
  });

  const handleAdd = () => {
    setPartners(prev => [...prev, { ...newPartner, id: Date.now() }]);
    setShowAdd(false);
    setNewPartner({ name: '', type: 'Community-Based', focus: '', practice: '', boy: 'Potential', mid: 'Potential', progress: '' });
  };

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 500 }}>Partner Quality — Mather Elementary</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Community and school-based partnerships. Mid-year status and progress tracking.</div>
        </div>
        <Button variant="orange" small onClick={() => setShowAdd(true)}>+ Add Partner</Button>
      </div>

      {/* Summary metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px,1fr))', gap: 10, marginBottom: 14 }}>
        <MetricCard label="Total Partners" value={partners.length} />
        <MetricCard label="Active" value={active} accent="teal" />
        <MetricCard label="Inactive" value={inactive} accent="red" />
        <MetricCard label="Potential" value={potential} accent="orange" />
        <MetricCard label="In-Kind Value" value={`$${inkindTotal.toLocaleString()}`} accent="blue" />
        <MetricCard label="Grants Awarded" value={`$${grantTotal.toLocaleString()}`} accent="teal" />
      </div>

      {/* Add partner form */}
      {showAdd && (
        <Card title="Add New Partner" style={{ marginBottom: 12 }}>
          <div className="grid-2">
            <Field label="Organization Name" required>
              <input value={newPartner.name} onChange={e => setNewPartner(p => ({ ...p, name: e.target.value }))} placeholder="e.g. YMCA Greater Boston" />
            </Field>
            <Field label="Type">
              <select value={newPartner.type} onChange={e => setNewPartner(p => ({ ...p, type: e.target.value }))}>
                <option>Community-Based</option>
                <option>School-Based</option>
                <option>Higher Education</option>
                <option>Government</option>
              </select>
            </Field>
            <Field label="Program Focus">
              <input value={newPartner.focus} onChange={e => setNewPartner(p => ({ ...p, focus: e.target.value }))} placeholder="e.g. Academic Enrichment" />
            </Field>
            <Field label="Key Practice">
              <select value={newPartner.practice} onChange={e => setNewPartner(p => ({ ...p, practice: e.target.value }))}>
                {['Collaborative Leadership','Expanded Learning','Community-Connected Instruction','Culture of Belonging','Integrated Systems','Student & Family Engagement',''].map(v => <option key={v} value={v}>{v || '— Select —'}</option>)}
              </select>
            </Field>
            <Field label="BOY Status">
              <select value={newPartner.boy} onChange={e => setNewPartner(p => ({ ...p, boy: e.target.value }))}>
                {['Active','Potential','Inactive'].map(v => <option key={v}>{v}</option>)}
              </select>
            </Field>
            <Field label="Mid-Year Status">
              <select value={newPartner.mid} onChange={e => setNewPartner(p => ({ ...p, mid: e.target.value }))}>
                {['Active','Potential','Inactive'].map(v => <option key={v}>{v}</option>)}
              </select>
            </Field>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Button variant="orange" small onClick={handleAdd}>Save Partner</Button>
            <Button variant="ghost" small onClick={() => setShowAdd(false)}>Cancel</Button>
          </div>
        </Card>
      )}

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>
        {[['all','All'],['active','Active'],['inactive','Inactive'],['potential','Potential']].map(([v, label]) => (
          <button key={v} onClick={() => setFilter(v)} style={{
            padding: '5px 12px', fontSize: 12, borderRadius: 6, cursor: 'pointer', border: 'none',
            background: filter === v ? 'var(--navy)' : 'var(--surface-2)',
            color: filter === v ? 'white' : 'var(--text-muted)',
          }}>
            {label}
          </button>
        ))}
      </div>

      {/* Partners table */}
      <Card>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: '0.5px solid var(--border)' }}>
                {['Organization', 'Type', 'Focus', 'Key Practice', 'BOY', 'Mid-Year', 'Progress'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '6px 8px', color: 'var(--text-muted)', fontWeight: 500, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, i) => (
                <tr key={i} style={{ borderBottom: '0.5px solid var(--border)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--surface)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: '7px 8px', fontWeight: 500 }}>{p.name}</td>
                  <td style={{ padding: '7px 8px', color: 'var(--text-muted)' }}>{p.type}</td>
                  <td style={{ padding: '7px 8px', color: 'var(--text-muted)' }}>{p.focus}</td>
                  <td style={{ padding: '7px 8px', color: 'var(--text-muted)' }}>{p.practice}</td>
                  <td style={{ padding: '7px 8px' }}><StatusPill status={p.boy} /></td>
                  <td style={{ padding: '7px 8px' }}><StatusPill status={p.mid} /></td>
                  <td style={{ padding: '7px 8px' }}>{p.progress ? <StatusPill status={p.progress} /> : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ROI section */}
      <div className="grid-2">
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
              <tr><td style={{ padding: '8px 0', fontWeight: 600 }}>Total</td><td style={{ padding: '8px 0', textAlign: 'right', fontWeight: 600, color: 'var(--teal)' }}>${inkindTotal.toLocaleString()}</td></tr>
            </tbody>
          </table>
        </Card>
        <Card title="Grants (SY25-26)">
          {MATHER_DATA.roi.grants.map((g, i) => (
            <div key={i} style={{ padding: '8px 0', borderBottom: '0.5px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                <span style={{ fontWeight: 500 }}>{g.name}</span>
                <span style={{ color: g.awarded ? 'var(--teal)' : 'var(--text-muted)', fontWeight: g.awarded ? 600 : 400 }}>
                  {g.awarded ? `$${g.awarded.toLocaleString()} awarded` : `$${g.requested.toLocaleString()} requested`}
                </span>
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{g.purpose}</div>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}
