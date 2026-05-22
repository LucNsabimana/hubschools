import React, { useState, useEffect } from 'react';
import { MATHER_DATA, SCHOOL_OVERVIEWS, SYSTEM_DATA } from '../data/schoolData';
import { readSheet, writeSheet, appendSheet } from '../utils/sheets';
import { useAuth } from '../hooks/useAuth';

function Avatar({ name, role, size = 44 }) {
  const parts = name.split(' ').filter(p => p && p !== 'Dr.' && p !== 'Dr');
  const initials = parts.slice(0, 2).map(p => p[0]).join('').toUpperCase();
  const colors = {
    'Coordinator':   { bg: '#185FA5', color: '#ffffff' },
    'School Leader': { bg: '#854F0B', color: '#ffffff' },
    'Family':        { bg: '#0F6E56', color: '#ffffff' },
    'Student':       { bg: '#3C3489', color: '#ffffff' },
    'School Staff':  { bg: '#791F1F', color: '#ffffff' },
    'Community Partner': { bg: '#444441', color: '#ffffff' },
  };
  const s = colors[role] || { bg: '#444441', color: '#ffffff' };
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: s.bg, color: s.color,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.36, fontWeight: 600,
      margin: '0 auto 10px', flexShrink: 0, letterSpacing: '0.02em',
    }}>
      {initials || '?'}
    </div>
  );
}

const typeColors = {
  'Hub':                           { bg: 'rgba(29,158,117,0.2)',  color: '#5DCAA5', border: 'rgba(29,158,117,0.4)' },
  'Dual Language (ASL)':           { bg: 'rgba(24,95,165,0.2)',   color: '#85B7EB', border: 'rgba(24,95,165,0.4)' },
  'Dual Language (Vietnamese)':    { bg: 'rgba(24,95,165,0.2)',   color: '#85B7EB', border: 'rgba(24,95,165,0.4)' },
  'Dual Language (Spanish)':       { bg: 'rgba(24,95,165,0.2)',   color: '#85B7EB', border: 'rgba(24,95,165,0.4)' },
  'Dual Language (Haitian Creole)':{ bg: 'rgba(24,95,165,0.2)',   color: '#85B7EB', border: 'rgba(24,95,165,0.4)' },
  'Innovation':                    { bg: 'rgba(83,74,183,0.2)',   color: '#AFA9EC', border: 'rgba(83,74,183,0.4)' },
  'Pilot':                         { bg: 'rgba(83,74,183,0.2)',   color: '#AFA9EC', border: 'rgba(83,74,183,0.4)' },
  'Merged':                        { bg: 'rgba(186,117,23,0.2)',  color: '#FAC775', border: 'rgba(186,117,23,0.4)' },
  'Merging':                       { bg: 'rgba(186,117,23,0.2)',  color: '#FAC775', border: 'rgba(186,117,23,0.4)' },
};

const inp = { background: '#0f1623', border: '0.5px solid rgba(255,255,255,0.15)', borderRadius: 5, color: '#e2e0db', fontSize: 12, padding: '6px 9px', width: '100%', outline: 'none', fontFamily: 'inherit' };
const btnSave   = { background: '#E07B3A', color: 'white', border: 'none', borderRadius: 5, padding: '5px 14px', fontSize: 11, fontWeight: 500, cursor: 'pointer' };
const btnCancel = { background: 'rgba(255,255,255,0.05)', color: '#8b8885', border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: 5, padding: '5px 12px', fontSize: 11, cursor: 'pointer' };
const btnEdit   = { background: 'rgba(255,255,255,0.05)', color: '#8b8885', border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: 5, padding: '3px 10px', fontSize: 10, cursor: 'pointer' };

function SecHeader({ label, isEditor, editing, saving, saved, onEdit, onSave, onCancel }) {
  return (
    <div style={{ fontSize: 11, fontWeight: 500, color: '#8b8885', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <span>{label}</span>
      {isEditor && (
        <span style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          {saved && <span style={{ fontSize: 10, color: '#5DCAA5' }}>✓ Saved</span>}
          {editing ? (
            <>
              <button style={btnSave} disabled={saving} onClick={onSave}>{saving ? 'Saving…' : 'Save'}</button>
              <button style={btnCancel} onClick={onCancel}>Cancel</button>
            </>
          ) : (
            <button style={btnEdit} onClick={onEdit}>Edit</button>
          )}
        </span>
      )}
    </div>
  );
}

export default function OverviewTab({ schoolId }) {
  const { user } = useAuth();
  const isEditor = user?.role === 'system_leader' || user?.role === 'admin';
  const base = SCHOOL_OVERVIEWS[schoolId] || MATHER_DATA.overview;
  const sys = SYSTEM_DATA.find(s => s.id === schoolId);
  const enrollment = sys ? sys.enroll[2] : null;

  const [ov, setOv] = useState(base);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fresh = SCHOOL_OVERVIEWS[schoolId] || MATHER_DATA.overview;
    setOv(fresh);
    setLoading(true);
    async function load() {
      try {
        const rows = await readSheet('SchoolProfiles!A:C');
        const match = rows.find(r => r[0] === schoolId);
        if (match?.[1]) setOv({ ...fresh, ...JSON.parse(match[1]) });
      } catch {}
      setLoading(false);
    }
    load();
  }, [schoolId]);

  const [editInfo,    setEditInfo]    = useState(false);
  const [editTeam,    setEditTeam]    = useState(false);
  const [editLeaders, setEditLeaders] = useState(false);
  const [editQSP,     setEditQSP]     = useState(false);

  const [draftInfo,    setDraftInfo]    = useState({});
  const [draftTeam,    setDraftTeam]    = useState([]);
  const [draftLeaders, setDraftLeaders] = useState([]);
  const [draftQSP,     setDraftQSP]     = useState([]);

  const [saving, setSaving] = useState('');
  const [saved,  setSaved]  = useState('');

  async function persist(key, patch) {
    setSaving(key);
    const updated = { ...ov, ...patch };
    setOv(updated);
    try {
      const payload = JSON.stringify({
        name: updated.name, grades: updated.grades, address: updated.address,
        leadPartner: updated.leadPartner, coordinator: updated.coordinator,
        schoolLeader: updated.schoolLeader, types: updated.types,
        aoa_team: updated.aoa_team, teams: updated.teams, qspGoals: updated.qspGoals,
      });
      const rows = await readSheet('SchoolProfiles!A:C');
      const idx = rows.findIndex(r => r[0] === schoolId);
      if (idx >= 0) {
        await writeSheet(`SchoolProfiles!A${idx+1}:C${idx+1}`, [[schoolId, payload, new Date().toISOString()]], user.accessToken);
      } else {
        await appendSheet('SchoolProfiles!A:C', [[schoolId, payload, new Date().toISOString()]], user.accessToken);
      }
      setSaved(key); setTimeout(() => setSaved(''), 3000);
    } catch(e) {
      alert('Save failed — make sure you are signed in with Google and the SchoolProfiles tab exists in the sheet.');
    }
    setSaving('');
  }

  if (loading) return <div style={{ color: '#8b8885', fontSize: 13, padding: 32, textAlign: 'center' }}>Loading…</div>;

  const activeCount   = (ov.teams || []).filter(t => t.active).length;
  const inactiveCount = (ov.teams || []).filter(t => !t.active).length;

  return (
    <div style={{ maxWidth: 920, margin: '0 auto' }}>

      {/* ── HERO ── */}
      <div style={{ background: '#1e2a3a', borderRadius: 12, padding: '24px 28px', marginBottom: 16, textAlign: 'center' }}>
        {editInfo ? (
          <div style={{ textAlign: 'left', maxWidth: 560, margin: '0 auto' }}>
            {[['name','School Name'],['grades','Grades'],['address','Address'],['leadPartner','Lead Partner'],['schoolLeader','School Leader'],['coordinator','Coordinator']].map(([k,lbl]) => (
              <div key={k} style={{ marginBottom: 9 }}>
                <div style={{ fontSize: 11, color: '#8b8885', marginBottom: 3 }}>{lbl}</div>
                <input style={inp} value={draftInfo[k] ?? ''} onChange={e => setDraftInfo(d => ({...d,[k]:e.target.value}))} />
              </div>
            ))}
            <div style={{ marginBottom: 9 }}>
              <div style={{ fontSize: 11, color: '#8b8885', marginBottom: 3 }}>School Types (comma-separated)</div>
              <input style={inp} value={(draftInfo.types||[]).join(', ')} onChange={e => setDraftInfo(d => ({...d, types: e.target.value.split(',').map(s=>s.trim()).filter(Boolean)}))} />
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <button style={btnSave} disabled={saving==='info'} onClick={async()=>{ await persist('info',draftInfo); setEditInfo(false); }}>{saving==='info'?'Saving…':'Save'}</button>
              <button style={btnCancel} onClick={()=>setEditInfo(false)}>Cancel</button>
              {saved==='info' && <span style={{fontSize:10,color:'#5DCAA5',alignSelf:'center'}}>✓ Saved</span>}
            </div>
          </div>
        ) : (
          <>
            <div style={{ fontSize: 22, fontWeight: 600, color: '#e2e0db', marginBottom: 5 }}>{ov.name}</div>
            <div style={{ fontSize: 13, color: '#8b8885', marginBottom: 16, lineHeight: 1.6 }}>
              {[ov.address, ov.grades, ov.leadPartner ? `Lead Partner: ${ov.leadPartner}` : null, 'SY25-26'].filter(Boolean).join(' · ')}
            </div>
            {ov.types && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, justifyContent: 'center', marginBottom: isEditor ? 14 : 0 }}>
                {ov.types.map(t => {
                  const s = typeColors[t] || { bg: 'rgba(255,255,255,0.08)', color: '#8b8885', border: 'rgba(255,255,255,0.15)' };
                  return <span key={t} style={{ fontSize: 11, fontWeight: 500, padding: '4px 12px', borderRadius: 5, background: s.bg, color: s.color, border: `0.5px solid ${s.border}` }}>{t}</span>;
                })}
              </div>
            )}
            {isEditor && (
              <div style={{ marginTop: 14 }}>
                <button style={btnEdit} onClick={() => { setDraftInfo({ name:ov.name, grades:ov.grades, address:ov.address, leadPartner:ov.leadPartner, schoolLeader:ov.schoolLeader, coordinator:ov.coordinator, types:ov.types||[] }); setEditInfo(true); }}>Edit school info</button>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── AOA TEAM ── */}
      <SecHeader label="AOA Team" isEditor={isEditor} editing={editTeam} saving={saving==='team'} saved={saved==='team'}
        onEdit={()=>{ setDraftTeam((ov.aoa_team||[]).map(m=>({...m}))); setEditTeam(true); }}
        onCancel={()=>setEditTeam(false)}
        onSave={async()=>{ await persist('team',{aoa_team:draftTeam}); setEditTeam(false); }} />

      {editTeam ? (
        <div style={{ background:'#1e2a3a', borderRadius:8, padding:'14px 16px', marginBottom:16 }}>
          <div style={{ fontSize:11, color:'#8b8885', marginBottom:8 }}>First · Last · Role · Email · Pronouns</div>
          {draftTeam.map((m,i) => (
            <div key={i} style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1.2fr 1.5fr 0.8fr auto', gap:6, marginBottom:7, alignItems:'center' }}>
              <input style={inp} placeholder="First" value={m.first||''} onChange={e=>setDraftTeam(d=>d.map((x,j)=>j===i?{...x,first:e.target.value}:x))} />
              <input style={inp} placeholder="Last"  value={m.last||''} onChange={e=>setDraftTeam(d=>d.map((x,j)=>j===i?{...x,last:e.target.value}:x))} />
              <select style={{...inp}} value={m.role||''} onChange={e=>setDraftTeam(d=>d.map((x,j)=>j===i?{...x,role:e.target.value}:x))}>
                {['Coordinator','School Leader','Family','School Staff','Student','Community Partner'].map(r=><option key={r}>{r}</option>)}
              </select>
              <input style={inp} placeholder="Email" value={m.email||''} onChange={e=>setDraftTeam(d=>d.map((x,j)=>j===i?{...x,email:e.target.value}:x))} />
              <input style={inp} placeholder="she/her" value={m.pronouns||''} onChange={e=>setDraftTeam(d=>d.map((x,j)=>j===i?{...x,pronouns:e.target.value}:x))} />
              <button onClick={()=>setDraftTeam(d=>d.filter((_,j)=>j!==i))} style={{...btnCancel,color:'#F09595',padding:'5px 9px'}}>✕</button>
            </div>
          ))}
          <button onClick={()=>setDraftTeam(d=>[...d,{first:'',last:'',role:'Coordinator',email:'',pronouns:''}])} style={{...btnCancel,marginTop:6,fontSize:11}}>+ Add member</button>
        </div>
      ) : (ov.aoa_team && ov.aoa_team.length > 0) && (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10, marginBottom:16 }}>
          {ov.aoa_team.map((m,i) => (
            <div key={i} style={{ background:'#1e2a3a', borderRadius:8, padding:'16px 12px', textAlign:'center' }}>
              <Avatar name={`${m.first} ${m.last}`} role={m.role} size={48} />
              <div style={{ fontSize:13, fontWeight:500, color:'#e2e0db', marginBottom:3 }}>{m.first} {m.last}</div>
              <div style={{ fontSize:11, color:'#8b8885' }}>{m.role}{m.pronouns ? ` · ${m.pronouns}` : ''}</div>
              {m.email && <div style={{ fontSize:10, color:'#555350', marginTop:3, wordBreak:'break-all' }}>{m.email}</div>}
            </div>
          ))}
        </div>
      )}

      {/* ── SCHOOL INFO + LEADERSHIP ── */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:16 }}>
        <div style={{ background:'#1e2a3a', borderRadius:8, padding:'16px 18px' }}>
          <div style={{ fontSize:13, fontWeight:500, color:'#e2e0db', marginBottom:12 }}>School Information</div>
          {[['Lead Partner',ov.leadPartner],['School Leader',ov.schoolLeader],['Coordinator',ov.coordinator],['Address',ov.address],['Grades',ov.grades],['Enrollment',enrollment?`${enrollment.toLocaleString()} students`:null]].filter(([,v])=>v).map(([l,v])=>(
            <div key={l} style={{ display:'flex', justifyContent:'space-between', padding:'6px 0', borderBottom:'0.5px solid rgba(255,255,255,0.06)', fontSize:13, gap:8 }}>
              <span style={{ color:'#8b8885', flexShrink:0 }}>{l}</span>
              <span style={{ fontWeight:500, textAlign:'right' }}>{v}</span>
            </div>
          ))}
        </div>

        <div style={{ background:'#1e2a3a', borderRadius:8, padding:'16px 18px' }}>
          {ov.teams ? (
            <>
              <SecHeader label="Leadership Teams" isEditor={isEditor} editing={editLeaders} saving={saving==='leaders'} saved={saved==='leaders'}
                onEdit={()=>{ setDraftLeaders((ov.teams||[]).map(t=>({...t}))); setEditLeaders(true); }}
                onCancel={()=>setEditLeaders(false)}
                onSave={async()=>{ await persist('leaders',{teams:draftLeaders}); setEditLeaders(false); }} />
              {!editLeaders && <div style={{ fontSize:11, color:'#8b8885', marginTop:-6, marginBottom:10 }}>{activeCount} active · {inactiveCount} inactive</div>}
              {editLeaders ? (
                <div>
                  {draftLeaders.map((t,i)=>(
                    <div key={i} style={{ display:'flex', alignItems:'center', gap:6, marginBottom:6 }}>
                      <input style={{...inp,flex:1}} value={t.name} onChange={e=>setDraftLeaders(d=>d.map((x,j)=>j===i?{...x,name:e.target.value}:x))} />
                      <button onClick={()=>setDraftLeaders(d=>d.map((x,j)=>j===i?{...x,active:!x.active}:x))} style={{...btnEdit,color:t.active?'#5DCAA5':'#8b8885',flexShrink:0,padding:'5px 10px'}}>{t.active?'Active':'Inactive'}</button>
                      <button onClick={()=>setDraftLeaders(d=>d.filter((_,j)=>j!==i))} style={{...btnCancel,color:'#F09595',padding:'5px 8px',flexShrink:0}}>✕</button>
                    </div>
                  ))}
                  <button onClick={()=>setDraftLeaders(d=>[...d,{name:'',active:true}])} style={{...btnCancel,marginTop:6,fontSize:11}}>+ Add team</button>
                </div>
              ) : (
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:5 }}>
                  {ov.teams.map(t=>(
                    <div key={t.name} style={{ display:'flex', alignItems:'center', gap:5, fontSize:12, padding:'3px 0' }}>
                      <span style={{ fontSize:8, color:t.active?'#5DCAA5':'#555350', flexShrink:0 }}>●</span>
                      <span style={{ color:t.active?'#e2e0db':'#555350' }}>{t.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <>
              <div style={{ fontSize:13, fontWeight:500, color:'#e2e0db', marginBottom:12 }}>School Types</div>
              <div style={{ display:'flex', flexWrap:'wrap', gap:7 }}>
                {ov.types?.map(t=>{ const s=typeColors[t]||{bg:'rgba(255,255,255,0.08)',color:'#8b8885',border:'rgba(255,255,255,0.15)'}; return <span key={t} style={{ fontSize:12,padding:'4px 12px',borderRadius:5,background:s.bg,color:s.color,border:`0.5px solid ${s.border}` }}>{t}</span>; })}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── QSP GOALS ── */}
      <SecHeader label="SY26 QSP Priority Goals" isEditor={isEditor} editing={editQSP} saving={saving==='qsp'} saved={saved==='qsp'}
        onEdit={()=>{ setDraftQSP([...(ov.qspGoals||[''])]); setEditQSP(true); }}
        onCancel={()=>setEditQSP(false)}
        onSave={async()=>{ await persist('qsp',{qspGoals:draftQSP.filter(g=>g.trim())}); setEditQSP(false); }} />

      {editQSP ? (
        <div style={{ background:'#1e2a3a', borderRadius:8, padding:'14px 16px' }}>
          {draftQSP.map((g,i)=>(
            <div key={i} style={{ display:'flex', gap:8, marginBottom:10, alignItems:'flex-start' }}>
              <div style={{ width:26,height:26,borderRadius:'50%',background:'rgba(224,123,58,0.15)',border:'1px solid rgba(224,123,58,0.35)',color:'#E07B3A',display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:600,flexShrink:0,marginTop:4 }}>{String(i+1).padStart(2,'0')}</div>
              <textarea style={{...inp,resize:'vertical',minHeight:64}} value={g} onChange={e=>setDraftQSP(d=>d.map((x,j)=>j===i?e.target.value:x))} />
              <button onClick={()=>setDraftQSP(d=>d.filter((_,j)=>j!==i))} style={{...btnCancel,color:'#F09595',padding:'5px 9px',flexShrink:0}}>✕</button>
            </div>
          ))}
          <button onClick={()=>setDraftQSP(d=>[...d,''])} style={{...btnCancel,fontSize:11}}>+ Add goal</button>
        </div>
      ) : ov.qspGoals && ov.qspGoals.length > 0 ? (
        <div style={{ background:'#1e2a3a', borderRadius:8, padding:'14px 16px' }}>
          {ov.qspGoals.map((g,i)=>(
            <div key={i} style={{ display:'flex', gap:14, alignItems:'flex-start', padding:'11px 0', borderBottom:i<ov.qspGoals.length-1?'0.5px solid rgba(255,255,255,0.06)':'none' }}>
              <div style={{ width:26,height:26,borderRadius:'50%',background:'rgba(224,123,58,0.15)',border:'1px solid rgba(224,123,58,0.35)',color:'#E07B3A',display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:600,flexShrink:0,marginTop:1 }}>{String(i+1).padStart(2,'0')}</div>
              <div>
                <div style={{ fontSize:13, color:'#e2e0db', lineHeight:1.6 }}>{g}</div>
                <div style={{ fontSize:11, color:'#8b8885', marginTop:3 }}>Track progress → Data Review tab</div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ background:'#1e2a3a', borderRadius:8, padding:'16px', textAlign:'center' }}>
          <div style={{ fontSize:13, color:'#8b8885', lineHeight:1.7 }}>
            No QSP goals added yet.{isEditor && <><br /><span style={{ color:'#555350' }}>Click Edit above to add priority goals for this school.</span></>}
          </div>
        </div>
      )}
    </div>
  );
}
