import React, { useState, useEffect } from 'react';

export function useFontSize() {
  const [size, setSize] = useState(() => {
    const saved = localStorage.getItem('bchs_font_size');
    return saved ? parseInt(saved) : 13;
  });

  useEffect(() => {
    document.documentElement.style.setProperty('--base-font-size', `${size}px`);
    localStorage.setItem('bchs_font_size', String(size));
  }, [size]);

  const increase = () => setSize(s => Math.min(s + 2, 19));
  const decrease = () => setSize(s => Math.max(s - 2, 11));

  return { size, increase, decrease };
}

export function FontSizeControl({ size, increase, decrease }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      <button
        onClick={decrease}
        disabled={size <= 11}
        title="Decrease text size"
        style={{
          width: 24, height: 24, borderRadius: 5, cursor: size <= 11 ? 'not-allowed' : 'pointer',
          border: '0.5px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.05)',
          color: size <= 11 ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.6)',
          fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >−</button>
      <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', minWidth: 30, textAlign: 'center' }}>
        Text
      </span>
      <button
        onClick={increase}
        disabled={size >= 19}
        title="Increase text size"
        style={{
          width: 24, height: 24, borderRadius: 5, cursor: size >= 19 ? 'not-allowed' : 'pointer',
          border: '0.5px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.05)',
          color: size >= 19 ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.6)',
          fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >+</button>
    </div>
  );
}
