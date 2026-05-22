import React, { useState, useEffect } from 'react';
import { MATHER_DATA, SCHOOL_OVERVIEWS, SYSTEM_DATA } from '../data/schoolData';
import { readSheet, writeSheet } from '../utils/sheets';
import { useAuth } from '../hooks/useAuth';

function Avatar({ name, role }) {
  const initials = name.split(' ').filter(p => p && !p.startsWith('Dr')).slice(0, 2).map(p => p[0]).join('').toUpperCase();
  const colors = {
    'Coordinator':   { bg: 'rgba(24,95,165,0.25)',  color: '#85B7EB' },
    'School Leader': { bg: 'rgba(186,117,23,0.25)', color: '#FAC775' },
    'Family':        { bg: 'rgba(29,158,117,0.25)', color: '#5DCAA5' },
    'Student':       { bg: 'rgba(83,74,183,0.25)',  color: '#AFA9EC' },
    'School Staff':  { bg: 'rgba(163,45,45,0.25)',  color: '#F09595' },
  };
  const s = colors[role] || { bg: 'rgba(255,255,255,0.08)', color: '#8b8885' };
  return (
    <div style={{ width: 36, height: 36, borderRadius: '50%', background: s.bg, color: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 500, margin: '0 auto 7px', flexShrink: 0 }}>
      {initials || '?'}
    </div>
  );
}

const typeColors = {
  'Hub':                           { bg: 'rgba(29,158,117,0.15)',  color: '#5DCAA5' },
  'Dual Language (ASL)':           { bg: 'rgba(24,95,165,0.15)',   color: '#85B7EB' },
  'Dual Language (Vietnamese)':    { bg: 'rgba(24,95,165,0.15)',   color: '#85B7EB' },
  'Dual Language (Spanish)':       { bg: 'rgba(24,95,165,0.15)',   color: '#85B7EB' },
  'Dual Language (Haitian Creole)':{ bg: 'rgba(24,95,165,0.15)',   color: '#85B7EB' },
  'Innovation':                    { bg: 'rgba(83,74,183,0.15)',   color: '#AFA9EC' },
  'Pilot':                         { bg: 'rgba(83,74,183,0.15)',   color: '#AFA9EC' },
  'Merged':                        { bg: 'rgba(186,117,23,0.15)',  color: '#FAC775' },
  'Merging':                       { bg: 'rgba(186,117,23,0.15)',  color: '#FAC775' },
};

const inp = { background: '#0f1623', border: '0.5px solid rgba(255,255,255,0.15)', borderRadius: 5, color: '#e2e0db', fontSize: 12, padding: '5px 8px', width: '100%', outline: 'none' };
const btnPrimary = { background: '#E07B3A', color: 'white', border: 'none', borderRadius: 5, padding: '5px 12px', fontSize: 11, fontWeight: 500, cursor: 'pointer' };
const btnGhost = { background: 'rgba(255,255,255,0.05)', color: '#8b8885', border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: 5, padding: '5px 12px', fontSize: 11, cursor: 'pointer' };
const editBtn = { background: 'rgba(255,255,255,0.05)', color: '#8b8885', border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: 5, padding: '3px 10px', fontSize: 10, cursor: 'pointer' };

function SectionHeader({ title, editing, onEdit, onSave, onCancel, saving, saved }) {
  return (
    <div style={{ fontSize: 11, fontWeight: 500, color: '#8b8885', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <span>{title}</span>
      <span style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        {saved && <span style={{ fontSize: 10, color: '#5DCAA5' }}>✓ Saved</span>}
        {editing ? (
          <>
            <button onClick={onSave} style={btnPrimary} disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
            <button onClick={onCancel} style={btnGhost}>Cancel</button>
          </>
        ) : (
          <button onClick={onEdit} style={editBtn}>Edit</button>
        )}
      </span>
    </div>
  );
}

export default function OverviewTab({ schoolId }) {
  const { user } = useAuth();
  const isEditor = user?.role === 'system_leader' || user?.role === 'admin';
  const baseOverview = SCHOOL_OVERVIEWS[schoolId] || MATHER_DATA.overview;
  const sysSchool = SYSTEM_DATA.find(s => s.id === schoolId);
  const enrollment = sysSchool ? sysSchool.enroll[2] : null;

  const [overview, setOverview] = useState(baseOverview);
  const [loadingProfile, setLoadingProfile] = useState(true);

  // Edit states per section
  const [editingInfo, setEditingInfo]     = useState(false);
  const [editingTeam, setEditingTeam]     = useState(false);
  const [editingLeaders, setEditingLeaders] = useState(false);
  const [editingQSP, setEditingQSP]       = useState(false);

  // Draft states
  const [draftInfo, setDraftInfo]         = useState({});
  const [draftTeam, setDraftTeam]         = useState([]);
  const [draftLeaders, setDraftLeaders]   = useState([]);
  const [draftQSP, setDraftQSP]           = useState([]);

  const [saving, setSaving]   = useState('');
  const [saved, setSaved]     = useState('');

  // Load saved profile from Sheets on mount
  useEffect(() => {
    async function load() {
      try {
        const rows = await readSheet('SchoolProfiles!A:C');
        const match = rows.find(r => r[0] === schoolId);
        if (match && match[1]) {
          const parsed = JSON.parse(match[1]);
          setOverview({ ...baseOverview, ...parsed });
        }
      } catch { /* fall back to static data */ }
      setLoadingProfile(false);
    }
    load();
  }, [schoolId]);

  async function saveSection(sectionKey, data) {
    setSaving(sectionKey);
    const updated = { ...overview, ...data };
    setOverview(updated);
    try {
      const payload = {
        name: updated.name, grades: updated.grades, address: updated.address,
        leadPartner: updated.leadPartner, coordinator: updated.coordinator,
        schoolLeader: updated.schoolLeader, types: updated.types,
        aoa_team: updated.aoa_team, teams: updated.teams, qspGoals: updated.qspGoals,
      };
      // Read existing to find row
      const rows = await readSheet('SchoolProfiles!A:C');
      const rowIdx = rows.findIndex(r => r[0] === schoolId);
      const range = rowIdx >= 0 ? `SchoolProfiles!A${rowIdx + 1}:C${rowIdx + 1}` : 'SchoolProfiles!A:C';
      const values = [[schoolId, JSON.stringify(payload), new Date().toISOString()]];
      if (rowIdx >= 0) {
        await writeSheet(range, values, user.accessToken);
      } else {
        const { appendSheet } = await import('../utils/sheets');
        await appendSheet('SchoolProfiles!A:C', values, user.accessToken);
      }
      setSaved(sectionKey);
      setTimeout(() => setSaved(''), 3000);
    } catch (e) {
      console.error('Save failed:', e);
      alert('Save failed — check that you are signed in with Google and have edit access to the sheet.');
    }
    setSaving('');
  }

  if (loadingProfile) return <div style={{ color: '#8b8885', fontSize: 13, padding: 24, textAlign: 'center' }}>Loading…</div>;

  const activeTeams = overview.teams ? overview.teams.filter(t => t.active).length : 0;
  const inactiveTeams = overview.teams ? overview.teams.filter(t => !t.active).length : 0;

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>

      {/* HERO */}
      <div style={{ background: '#1e2a3a', borderRadius: 10, padding: '22px 24px', marginBottom: 14, textAlign: 'center' }}>
        {editingInfo ? (
          <div style={{ textAlign: 'left', maxWidth: 540, margin: '0 auto' }}>
            {[['name','School Name'],['grades','Grades'],['address','Address'],['leadPartner','Lead Partner'],['schoolLeader','School Leader'],['coordinator','Coordinator']].map(([k, lbl]) => (
              <div key={k} style={{ marginBottom: 8 }}>
                <div style={{ fontSize: 11, color: '#8b8885', marginBottom: 3 }}>{lbl}</div>
                <input style={inp} value={draftInfo[k] ?? ''} onChange={e => setDraftInfo(d => ({ ...d, [k]: e.target.value }))} />
              </div>
            ))}
            <div style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 11, color: '#8b8885', marginBottom: 3 }}>School Types (comma-separated)</div>
              <input style={inp} value={(draftInfo.types || []).join(', ')} onChange={e => setDraftInfo(d => ({ ...d, types: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }))} />
            </div>
          </div>
        ) : (
          <>
            <div style={{ fontSize: 20, fontWeight: 600, color: '#e2e0db', marginBottom: 4 }}>{overview.name}</div>
            <div style={{ fontSize: 12, color: '#8b8885', marginBottom: 14, lineHeight: 1.6 }}>
              {[overview.address, overview.grades, overview.leadPartner ? `Lead Partner: ${overview.leadPartner}` : null, 'SY25-26'].filter(Boolean).join(' · ')}
            </div>
            {overview.types && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center' }}>
                {overview.types.map(t => {
                  const s = typeColors[t] || { bg: 'rgba(255,255,255,0.08)', color: '#8b8885' };
                  return <span key={t} style={{ fontSize: 10, fontWeight: 500, padding: '3px 10px', borderRadius: 4, background: s.bg, color: s.color }}>{t}</span>;
                })}
              </div>
            )}
          </>
        )}
        {isEditor && (
          <div style={{ marginTop: 12, display: 'flex', justifyContent: 'center', gap: 6 }}>
            {saved === 'info' && <span style={{ fontSize: 10, color: '#5DCAA5' }}>✓ Saved</span>}
            {editingInfo ? (
              <>
                <button style={btnPrimary} disabled={saving === 'info'} onClick={async () => { await saveSection('info', draftInfo); setEditingInfo(false); }}>{saving === 'info' ? 'Saving…' : 'Save'}</button>
                <button style={btnGhost} onClick={() => setEditingInfo(false)}>Cancel</button>
              </>
            ) : (
              <button style={editBtn} onClick={() => { setDraftInfo({ name: overview.name, grades: overview.grades, address: overview.address, leadPartner: overview.leadPartner, schoolLeader: overview.schoolLeader, coordinator: overview.coordinator, types: overview.types || [] }); setEditingInfo(true); }}>Edit school info</button>
            )}
          </div>
        )}
      </div>

      {/* AOA TEAM */}
      {isEditor ? (
        <SectionHeader title="AOA Team" editing={editingTeam} saving={saving === 'team'} saved={saved === 'team'}
          onEdit={() => { setDraftTeam((overview.aoa_team || []).map(m => ({ ...m }))); setEditingTeam(true); }}
          onCancel={() => setEditingTeam(false)}
          onSave={async () => { await saveSection('team', { aoa_team: draftTeam }); setEditingTeam(false); }} />
      ) : (
        <div style={{ fontSize: 11, fontWeight: 500, color: '#8b8885', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 8px' }}>AOA Team</div>
      )}

      {editingTeam ? (
        <div style={{ background: '#1e2a3a', borderRadius: 8, padding: '14px 16px', marginBottom: 14 }}>
          {draftTeam.map((m, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr auto', gap: 6, marginBottom: 8, alignItems: 'center' }}>
              <input style={inp} placeholder="First name" value={m.first || ''} onChange={e => setDraftTeam(d => d.map((x, j) => j === i ? { ...x, first: e.target.value } : x))} />
              <input style={inp} placeholder="Last name" value={m.last || ''} onChange={e => setDraftTeam(d => d.map((x, j) => j === i ? { ...x, last: e.target.value } : x))} />
              <select style={{ ...inp }} value={m.role || ''} onChange={e => setDraftTeam(d => d.map((x, j) => j === i ? { ...x, role: e.target.value } : x))}>
                {['Coordinator','School Leader','Family','School Staff','Student','Community Partner'].map(r => <option key={r}>{r}</option>)}
              </select>
              <input style={inp} placeholder="Email" value={m.email || ''} onChange={e => setDraftTeam(d => d.map((x, j) => j === i ? { ...x, email: e.target.value } : x))} />
              <button onClick={() => setDraftTeam(d => d.filter((_, j) => j !== i))} style={{ ...btnGhost, color: '#F09595', padding: '4px 8px' }}>✕</button>
            </div>
          ))}
          <button onClick={() => setDraftTeam(d => [...d, { first: '', last: '', role: 'Coordinator', email: '', pronouns: '' }])} style={{ ...btnGhost, marginTop: 4 }}>+ Add member</button>
        </div>
      ) : (
        overview.aoa_team && overview.aoa_team.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 14 }}>
            {overview.aoa_team.map((m, i) => (
              <div key={i} style={{ background: '#1e2a3a', borderRadius: 8, padding: '12px 10px', textAlign: 'center' }}>
                <Avatar name={`${m.first} ${m.last}`} role={m.role} />
                <div style={{ fontSize: 11, fontWeight: 500, color: '#e2e0db', marginBottom: 2 }}>{m.first} {m.last}</div>
                <div style={{ fontSize: 10, color: '#8b8885' }}>{m.role}{m.pronouns ? ` · ${m.pronouns}` : ''}</div>
                {m.email && <div style={{ fontSize: 9, color: '#555350', marginTop: 2, wordBreak: 'break-all' }}>{m.email}</div>}
              </div>
            ))}
          </div>
        )
      )}

      {/* SCHOOL INFO + LEADERSHIP */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
        <div style={{ background: '#1e2a3a', borderRadius: 8, padding: '14px 16px' }}>
          <div style={{ fontSize: 12, fontWeight: 500, color: '#e2e0db', marginBottom: 10 }}>School Information</div>
          {[['Lead Partner', overview.leadPartner],['School Leader', overview.schoolLeader],['Coordinator', overview.coordinator],['Address', overview.address],['Grades', overview.grades],['Enrollment', enrollment ? `${enrollment.toLocaleString()} students` : null]].filter(([,v]) => v).map(([label, value]) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '0.5px solid rgba(255,255,255,0.06)', fontSize: 12, gap: 8 }}>
              <span style={{ color: '#8b8885', flexShrink: 0 }}>{label}</span>
              <span style={{ fontWeight: 500, textAlign: 'right' }}>{value}</span>
            </div>
          ))}
        </div>

        {overview.teams ? (
          <div style={{ background: '#1e2a3a', borderRadius: 8, padding: '14px 16px' }}>
            {isEditor ? (
              <SectionHeader title="Leadership Teams" editing={editingLeaders} saving={saving === 'leaders'} saved={saved === 'leaders'}
                onEdit={() => { setDraftLeaders((overview.teams || []).map(t => ({ ...t }))); setEditingLeaders(true); }}
                onCancel={() => setEditingLeaders(false)}
                onSave={async () => { await saveSection('leaders', { teams: draftLeaders }); setEditingLeaders(false); }} />
            ) : (
              <div style={{ fontSize: 12, fontWeight: 500, color: '#e2e0db', marginBottom: 10, display: 'flex', justifyContent: 'space-between' }}>
                Leadership Teams <span style={{ fontSize: 10, color: '#8b8885', fontWeight: 400 }}>{activeTeams} active · {inactiveTeams} inactive</span>
              </div>
            )}
            {editingLeaders ? (
              <div>
                {draftLeaders.map((t, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
                    <input style={{ ...inp, flex: 1 }} value={t.name} onChange={e => setDraftLeaders(d => d.map((x, j) => j === i ? { ...x, name: e.target.value } : x))} />
                    <button onClick={() => setDraftLeaders(d => d.map((x, j) => j === i ? { ...x, active: !x.active } : x))} style={{ ...btnGhost, color: t.active ? '#5DCAA5' : '#8b8885', padding: '4px 8px', fontSize: 10, flexShrink: 0 }}>{t.active ? 'Active' : 'Inactive'}</button>
                    <button onClick={() => setDraftLeaders(d => d.filter((_, j) => j !== i))} style={{ ...btnGhost, color: '#F09595', padding: '4px 8px', flexShrink: 0 }}>✕</button>
                  </div>
                ))}
                <button onClick={() => setDraftLeaders(d => [...d, { name: '', active: true }])} style={{ ...btnGhost, marginTop: 4, fontSize: 10 }}>+ Add team</button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
                {overview.teams.map(t => (
                  <div key={t.name} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, padding: '3px 0' }}>
                    <span style={{ fontSize: 8, color: t.active ? '#5DCAA5' : '#555350', flexShrink: 0 }}>●</span>
                    <span style={{ color: t.active ? '#e2e0db' : '#555350' }}>{t.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div style={{ background: '#1e2a3a', borderRadius: 8, padding: '14px 16px' }}>
            <div style={{ fontSize: 12, fontWeight: 500, color: '#e2e0db', marginBottom: 10 }}>School Types</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {overview.types?.map(t => {
                const s = typeColors[t] || { bg: 'rgba(255,255,255,0.08)', color: '#8b8885' };
                return <span key={t} style={{ fontSize: 11, padding: '3px 10px', borderRadius: 4, background: s.bg, color: s.color }}>{t}</span>;
              })}
            </div>
          </div>
        )}
      </div>

      {/* QSP GOALS */}
      {isEditor ? (
        <SectionHeader title="SY26 QSP Priority Goals" editing={editingQSP} saving={saving === 'qsp'} saved={saved === 'qsp'}
          onEdit={() => { setDraftQSP([...(overview.qspGoals || [''])]); setEditingQSP(true); }}
          onCancel={() => setEditingQSP(false)}
          onSave={async () => { await saveSection('qsp', { qspGoals: draftQSP.filter(g => g.trim()) }); setEditingQSP(false); }} />
      ) : overview.qspGoals && (
        <div style={{ fontSize: 11, fontWeight: 500, color: '#8b8885', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 8px' }}>SY26 QSP Priority Goals</div>
      )}

      {editingQSP ? (
        <div style={{ background: '#1e2a3a', borderRadius: 8, padding: '14px 16px' }}>
          {draftQSP.map((g, i) => (
            <div key={i} style={{ display: 'flex', gap: 6, marginBottom: 8, alignItems: 'flex-start' }}>
              <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'rgba(224,123,58,0.15)', border: '1px solid rgba(224,123,58,0.35)', color: '#E07B3A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 600, flexShrink: 0, marginTop: 3 }}>{String(i + 1).padStart(2, '0')}</div>
              <textarea style={{ ...inp, resize: 'vertical', minHeight: 60 }} value={g} onChange={e => setDraftQSP(d => d.map((x, j) => j === i ? e.target.value : x))} />
              <button onClick={() => setDraftQSP(d => d.filter((_, j) => j !== i))} style={{ ...btnGhost, color: '#F09595', padding: '4px 8px', flexShrink: 0 }}>✕</button>
            </div>
          ))}
          <button onClick={() => setDraftQSP(d => [...d, ''])} style={{ ...btnGhost, fontSize: 10 }}>+ Add goal</button>
        </div>
      ) : overview.qspGoals && (
        <div style={{ background: '#1e2a3a', borderRadius: 8, padding: '14px 16px' }}>
          {overview.qspGoals.map((g, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '10px 0', borderBottom: i < overview.qspGoals.length - 1 ? '0.5px solid rgba(255,255,255,0.06)' : 'none' }}>
              <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'rgba(224,123,58,0.15)', border: '1px solid rgba(224,123,58,0.35)', color: '#E07B3A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 600, flexShrink: 0, marginTop: 1 }}>
                {String(i + 1).padStart(2, '0')}
              </div>
              <div>
                <div style={{ fontSize: 13, color: '#e2e0db', lineHeight: 1.6 }}>{g}</div>
                <div style={{ fontSize: 10, color: '#8b8885', marginTop: 3 }}>Track progress → Data Review tab</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!overview.qspGoals && !overview.teams && !editingTeam && (
        <div style={{ background: '#1e2a3a', borderRadius: 8, padding: '16px', textAlign: 'center', marginTop: 8 }}>
          <div style={{ fontSize: 12, color: '#8b8885', lineHeight: 1.7 }}>
            Full AOA profile coming soon for this school.<br />
            <span style={{ color: '#555350' }}>System leaders can edit this page to add profile information.</span>
          </div>
        </div>
      )}
    </div>
  );
}
