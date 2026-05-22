import React from 'react';

// ── Status pill ──────────────────────────────────────────────
export function StatusPill({ status }) {
  const map = {
    'Active': { bg: 'var(--teal-bg)', color: 'var(--teal-dark)' },
    'Inactive': { bg: 'var(--red-bg)', color: 'var(--red)' },
    'Potential': { bg: 'var(--amber-bg)', color: 'var(--amber)' },
    'In Progress': { bg: 'var(--blue-bg)', color: 'var(--blue)' },
    'Done': { bg: 'var(--teal-bg)', color: 'var(--teal-dark)' },
    'Not Started': { bg: '#f3f4f6', color: 'var(--text-muted)' },
    'Meeting Expectations': { bg: 'var(--blue-bg)', color: 'var(--blue)' },
    'Exceeding Expectations': { bg: 'var(--teal-bg)', color: 'var(--teal-dark)' },
  };
  const style = map[status] || { bg: '#f3f4f6', color: 'var(--text-muted)' };
  return (
    <span style={{
      display: 'inline-block', background: style.bg, color: style.color,
      borderRadius: 4, padding: '2px 8px', fontSize: 11, fontWeight: 500,
    }}>
      {status}
    </span>
  );
}

// ── Maturity badge ──────────────────────────────────────────
export function MaturityBadge({ rating }) {
  if (!rating) return <span style={{ fontSize: 11, color: 'var(--text-hint)' }}>— Not assessed</span>;
  const map = {
    'Emerging': { bg: 'var(--amber-bg)', color: 'var(--amber)' },
    'Maturing': { bg: 'var(--blue-bg)', color: 'var(--blue)' },
    'Transforming': { bg: 'var(--teal-bg)', color: 'var(--teal-dark)' },
  };
  const s = map[rating] || { bg: '#f3f4f6', color: 'var(--text-muted)' };
  return (
    <span style={{
      display: 'inline-block', background: s.bg, color: s.color,
      borderRadius: 4, padding: '2px 10px', fontSize: 11, fontWeight: 500, flexShrink: 0,
    }}>
      {rating}
    </span>
  );
}

// ── Metric card ─────────────────────────────────────────────
export function MetricCard({ label, value, delta, deltaDir, accent }) {
  const accentColor = { orange: 'var(--orange)', teal: 'var(--teal)', blue: 'var(--blue)', red: 'var(--red)' }[accent] || 'var(--text)';
  const deltaColor = deltaDir === 'up' ? 'var(--teal)' : deltaDir === 'down' ? 'var(--red)' : 'var(--text-muted)';
  return (
    <div style={{
      background: 'var(--card)', border: '0.5px solid var(--border)', borderRadius: 'var(--radius-lg)',
      padding: '12px 14px',
    }}>
      <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 500, color: accentColor }}>{value}</div>
      {delta && <div style={{ fontSize: 11, marginTop: 3, color: deltaColor }}>{delta}</div>}
    </div>
  );
}

// ── Card wrapper ─────────────────────────────────────────────
export function Card({ title, children, style }) {
  return (
    <div style={{
      background: 'var(--card)', border: '0.5px solid var(--border)', borderRadius: 'var(--radius-lg)',
      padding: '14px 16px', marginBottom: 12, ...style,
    }}>
      {title && (
        <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', marginBottom: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {title}
        </div>
      )}
      {children}
    </div>
  );
}

// ── Section header ───────────────────────────────────────────
export function SectionHeader({ children }) {
  return (
    <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '8px 0 4px' }}>
      {children}
    </div>
  );
}

// ── Horizontal bar ───────────────────────────────────────────
export function HBar({ label, pct, color, maxPct = 100 }) {
  const width = Math.min((pct / maxPct) * 100, 100);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '3px 0' }}>
      <div style={{ width: 150, fontSize: 11, color: 'var(--text-muted)', textAlign: 'right', flexShrink: 0 }}>{label}</div>
      <div style={{ flex: 1, background: 'var(--surface-2)', borderRadius: 3, height: 14 }}>
        <div style={{ width: `${width}%`, height: '100%', borderRadius: 3, background: color || 'var(--blue)' }} />
      </div>
      <div style={{ width: 44, fontSize: 11, color: 'var(--text)', flexShrink: 0 }}>{typeof pct === 'number' ? (pct < 1 ? `${(pct * 100).toFixed(1)}%` : `${pct}%`) : pct}</div>
    </div>
  );
}

// ── Page header ──────────────────────────────────────────────
export function PageHeader({ title, sub }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 16, fontWeight: 500, color: 'var(--text)' }}>{title}</div>
      {sub && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

// ── Primary button ───────────────────────────────────────────
export function Button({ children, onClick, variant = 'primary', small, disabled, style }) {
  const base = {
    display: 'inline-flex', alignItems: 'center', gap: 6,
    padding: small ? '5px 12px' : '8px 16px',
    borderRadius: 'var(--radius-md)', fontSize: small ? 12 : 13, fontWeight: 500,
    cursor: disabled ? 'not-allowed', opacity: disabled ? 0.5 : 1,
    transition: 'background 0.15s', border: 'none',
  };
  const variants = {
    primary: { background: 'var(--navy)', color: 'white' },
    orange: { background: 'var(--orange)', color: 'white' },
    ghost: { background: 'transparent', color: 'var(--text)', border: '0.5px solid var(--border-strong)' },
    danger: { background: 'var(--red)', color: 'white' },
  };
  return (
    <button style={{ ...base, ...variants[variant], ...style }} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}

// ── Form field ───────────────────────────────────────────────
export function Field({ label, children, required, hint }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--text)', marginBottom: 5 }}>
        {label} {required && <span style={{ color: 'var(--red)' }}>*</span>}
      </label>
      {children}
      {hint && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3 }}>{hint}</div>}
    </div>
  );
}

// ── Delta indicator ──────────────────────────────────────────
export function Delta({ value, good = 'up' }) {
  if (value === null || value === undefined) return <span style={{ color: 'var(--text-hint)' }}>—</span>;
  const isPositive = value > 0;
  const isGood = (good === 'up' && isPositive) || (good === 'down' && !isPositive);
  const color = value === 0 ? 'var(--text-muted)' : isGood ? 'var(--teal)' : 'var(--red)';
  const arrow = value > 0 ? '▲' : value < 0 ? '▼' : '●';
  const formatted = value === 0 ? 'Stable' : `${value > 0 ? '+' : ''}${(value * 100).toFixed(1)}pp`;
  return <span style={{ color, fontSize: 11 }}>{arrow} {formatted}</span>;
}

// ── Team avatar ──────────────────────────────────────────────
export function Avatar({ name, role, size = 28 }) {
  const initials = name.split(' ').filter(p => p && !p.startsWith('Dr')).slice(0, 2).map(p => p[0]).join('').toUpperCase();
  const colors = {
    'Coordinator': { bg: 'var(--blue-bg)', color: 'var(--blue)' },
    'School Leader': { bg: 'var(--amber-bg)', color: 'var(--amber)' },
    'Family': { bg: 'var(--teal-bg)', color: 'var(--teal-dark)' },
    'Student': { bg: 'var(--purple-bg)', color: 'var(--purple)' },
    'School Staff': { bg: 'var(--red-bg)', color: 'var(--red)' },
  };
  const s = colors[role] || { bg: 'var(--surface-2)', color: 'var(--text-muted)' };
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', background: s.bg, color: s.color,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: Math.max(size * 0.38, 10), fontWeight: 500, flexShrink: 0,
    }}>
      {initials || '?'}
    </div>
  );
}

// ── Progress ring (for KPI completion) ──────────────────────
export function ProgressRing({ pct, size = 48, strokeWidth = 4, color = 'var(--orange)' }) {
  const r = (size - strokeWidth * 2) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - pct / 100);
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--surface-2)" strokeWidth={strokeWidth} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={strokeWidth}
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" />
    </svg>
  );
}
