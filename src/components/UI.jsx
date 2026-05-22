import React from 'react';

export function StatusPill({ status }) {
  const map = {
    'Active':                { bg: 'rgba(29,158,117,0.15)', color: '#5DCAA5' },
    'Inactive':              { bg: 'rgba(163,45,45,0.15)',  color: '#F09595' },
    'Potential':             { bg: 'rgba(186,117,23,0.15)', color: '#FAC775' },
    'In Progress':           { bg: 'rgba(24,95,165,0.15)',  color: '#85B7EB' },
    'Done':                  { bg: 'rgba(29,158,117,0.15)', color: '#5DCAA5' },
    'Not Started':           { bg: 'rgba(255,255,255,0.05)', color: '#6b6966' },
    'Meeting Expectations':  { bg: 'rgba(24,95,165,0.15)',  color: '#85B7EB' },
    'Exceeding Expectations':{ bg: 'rgba(29,158,117,0.15)', color: '#5DCAA5' },
  };
  const s = map[status] || { bg: 'rgba(255,255,255,0.05)', color: '#6b6966' };
  return (
    <span style={{ display: 'inline-block', background: s.bg, color: s.color, borderRadius: 4, padding: '2px 8px', fontSize: 10, fontWeight: 500 }}>
      {status}
    </span>
  );
}

export function MaturityBadge({ rating }) {
  if (!rating) return <span style={{ fontSize: 10, color: 'var(--text-hint)' }}>— Not assessed</span>;
  const map = {
    'Emerging':    { bg: 'rgba(186,117,23,0.15)', color: '#FAC775' },
    'Maturing':    { bg: 'rgba(24,95,165,0.15)',  color: '#85B7EB' },
    'Transforming':{ bg: 'rgba(29,158,117,0.15)', color: '#5DCAA5' },
  };
  const s = map[rating] || { bg: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)' };
  return (
    <span style={{ display: 'inline-block', background: s.bg, color: s.color, borderRadius: 4, padding: '2px 10px', fontSize: 10, fontWeight: 500, flexShrink: 0 }}>
      {rating}
    </span>
  );
}

export function MetricCard({ label, value, delta, deltaDir, accent }) {
  const accentColor = { orange: 'var(--orange-light)', teal: '#5DCAA5', blue: '#85B7EB', red: '#F09595' }[accent] || 'var(--text)';
  const deltaColor = deltaDir === 'up' ? '#5DCAA5' : deltaDir === 'down' ? '#F09595' : 'var(--text-muted)';
  return (
    <div style={{ background: 'var(--card)', border: '0.5px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '10px 12px' }}>
      <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 3 }}>{label}</div>
      <div style={{ fontSize: 20, fontWeight: 500, color: accentColor, lineHeight: 1.2 }}>{value}</div>
      {delta && <div style={{ fontSize: 10, marginTop: 3, color: deltaColor }}>{delta}</div>}
    </div>
  );
}

export function Card({ title, children, style }) {
  return (
    <div style={{ background: 'var(--card)', border: '0.5px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '12px 14px', marginBottom: 10, ...style }}>
      {title && (
        <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text)', marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {title}
        </div>
      )}
      {children}
    </div>
  );
}

export function SectionHeader({ children }) {
  return (
    <div style={{ fontSize: 10, fontWeight: 500, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', padding: '6px 0 3px' }}>
      {children}
    </div>
  );
}

export function HBar({ label, pct, color, maxPct = 100 }) {
  const width = Math.min((pct / maxPct) * 100, 100);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '2px 0' }}>
      <div style={{ width: 140, fontSize: 10, color: 'var(--text-muted)', textAlign: 'right', flexShrink: 0 }}>{label}</div>
      <div style={{ flex: 1, background: 'rgba(255,255,255,0.06)', borderRadius: 3, height: 12 }}>
        <div style={{ width: `${width}%`, height: '100%', borderRadius: 3, background: color || '#85B7EB', opacity: 0.85 }} />
      </div>
      <div style={{ width: 40, fontSize: 10, color: 'var(--text)', flexShrink: 0 }}>{typeof pct === 'number' ? (pct < 1 ? `${(pct * 100).toFixed(1)}%` : `${pct.toFixed(1)}%`) : pct}</div>
    </div>
  );
}

export function PageHeader({ title, sub }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--text)' }}>{title}</div>
      {sub && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

export function Button({ children, onClick, variant = 'primary', small, disabled, style }) {
  const base = {
    display: 'inline-flex', alignItems: 'center', gap: 5,
    padding: small ? '4px 10px' : '7px 14px',
    borderRadius: 'var(--radius-md)', fontSize: small ? 11 : 12, fontWeight: 500,
    cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1,
    transition: 'background 0.15s', border: 'none',
  };
  const variants = {
    primary: { background: 'var(--navy-light)', color: 'var(--text)' },
    orange:  { background: 'var(--orange)', color: 'white' },
    ghost:   { background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)', border: '0.5px solid var(--border-strong)' },
    danger:  { background: 'rgba(163,45,45,0.3)', color: '#F09595' },
  };
  return (
    <button style={{ ...base, ...variants[variant], ...style }} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}

export function Field({ label, children, required, hint }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label style={{ display: 'block', fontSize: 11, fontWeight: 500, color: 'var(--text-muted)', marginBottom: 4 }}>
        {label} {required && <span style={{ color: '#F09595' }}>*</span>}
      </label>
      {children}
      {hint && <div style={{ fontSize: 10, color: 'var(--text-hint)', marginTop: 3 }}>{hint}</div>}
    </div>
  );
}

export function Delta({ value, good = 'up' }) {
  if (value === null || value === undefined) return <span style={{ color: 'var(--text-hint)' }}>—</span>;
  const isPositive = value > 0;
  const isGood = (good === 'up' && isPositive) || (good === 'down' && !isPositive);
  const color = value === 0 ? 'var(--text-muted)' : isGood ? '#5DCAA5' : '#F09595';
  const arrow = value > 0 ? '▲' : value < 0 ? '▼' : '●';
  const formatted = value === 0 ? 'Stable' : `${value > 0 ? '+' : ''}${(value * 100).toFixed(1)}pp`;
  return <span style={{ color, fontSize: 10 }}>{arrow} {formatted}</span>;
}

export function Avatar({ name, role, size = 26 }) {
  const initials = name.split(' ').filter(p => p && !p.startsWith('Dr')).slice(0, 2).map(p => p[0]).join('').toUpperCase();
  const colors = {
    'Coordinator':  { bg: 'rgba(24,95,165,0.25)',  color: '#85B7EB' },
    'School Leader':{ bg: 'rgba(186,117,23,0.25)', color: '#FAC775' },
    'Family':       { bg: 'rgba(29,158,117,0.25)', color: '#5DCAA5' },
    'Student':      { bg: 'rgba(83,74,183,0.25)',  color: '#AFA9EC' },
    'School Staff': { bg: 'rgba(163,45,45,0.25)',  color: '#F09595' },
  };
  const s = colors[role] || { bg: 'rgba(255,255,255,0.08)', color: 'var(--text-muted)' };
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: s.bg, color: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: Math.max(size * 0.36, 9), fontWeight: 500, flexShrink: 0 }}>
      {initials || '?'}
    </div>
  );
}

export function ProgressRing({ pct, size = 48, strokeWidth = 4, color = 'var(--orange)' }) {
  const r = (size - strokeWidth * 2) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - pct / 100);
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={strokeWidth} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={strokeWidth} strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" />
    </svg>
  );
}
