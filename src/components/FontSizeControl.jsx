import React, { useState, useEffect } from 'react';

const SIZES = [
  { label: 'A-', value: 11, title: 'Small' },
  { label: 'A',  value: 13, title: 'Medium (default)' },
  { label: 'A+', value: 15, title: 'Large' },
];

export function useFontSize() {
  const [size, setSize] = useState(() => {
    const saved = localStorage.getItem('bchs_font_size');
    return saved ? parseInt(saved) : 13;
  });

  useEffect(() => {
    document.documentElement.style.setProperty('--base-font-size', `${size}px`);
    localStorage.setItem('bchs_font_size', size);
  }, [size]);

  return { size, setSize };
}

export function FontSizeControl({ size, setSize }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      {SIZES.map(s => (
        <button
          key={s.value}
          title={s.title}
          onClick={() => setSize(s.value)}
          style={{
            width: 26, height: 26, borderRadius: 5,
            border: '0.5px solid',
            borderColor: size === s.value ? 'var(--orange)' : 'rgba(255,255,255,0.15)',
            background: size === s.value ? 'rgba(224,123,58,0.2)' : 'rgba(255,255,255,0.05)',
            color: size === s.value ? 'var(--orange)' : 'rgba(255,255,255,0.5)',
            fontSize: s.label === 'A-' ? 10 : s.label === 'A+' ? 14 : 12,
            fontWeight: 500, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.15s',
          }}
        >
          {s.label}
        </button>
      ))}
    </div>
  );
}
