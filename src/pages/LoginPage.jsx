import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../hooks/useAuth';

export default function LoginPage() {
  const { loginWithGoogle, loginAsGuest } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSuccess = async (credentialResponse) => {
    setLoading(true);
    setError('');
    try {
      await loginWithGoogle(credentialResponse);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--surface)', padding: 20,
    }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 12, background: 'var(--navy-light)',
            border: '0.5px solid var(--border-strong)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 14px',
          }}>
            <div style={{ color: 'var(--orange)', fontSize: 22 }}>◎</div>
          </div>
          <div style={{ fontSize: 10, fontWeight: 500, color: 'var(--orange)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 6 }}>
            Boston Community Hub Schools
          </div>
          <h1 style={{ fontSize: 20, fontWeight: 600, color: 'var(--text)', marginBottom: 5 }}>
            BCHS Pulse
          </h1>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6 }}>
            Boston Community Hub Schools<br />Sign in with your school Google account.
          </p>
        </div>

        <div style={{
          background: 'var(--card)', borderRadius: 'var(--radius-xl)',
          border: '0.5px solid var(--border-strong)', padding: '24px 22px',
          boxShadow: 'var(--shadow-md)',
        }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '14px 0', color: 'var(--text-muted)', fontSize: 12 }}>
              Signing you in…
            </div>
          ) : (
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <GoogleLogin
                onSuccess={handleSuccess}
                onError={() => setError('Google sign-in failed. Please try again.')}
                useOneTap
                text="signin_with"
                shape="rectangular"
                size="large"
                width={320}
                theme="filled_black"
              />
            </div>
          )}

          {error && (
            <div style={{
              marginTop: 12, padding: '9px 11px', background: 'rgba(163,45,45,0.15)', color: '#F09595',
              borderRadius: 'var(--radius-md)', fontSize: 11, lineHeight: 1.5, border: '0.5px solid rgba(163,45,45,0.3)',
            }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '18px 0 14px' }}>
            <div style={{ flex: 1, height: '0.5px', background: 'var(--border)' }} />
            <span style={{ fontSize: 10, color: 'var(--text-hint)' }}>or</span>
            <div style={{ flex: 1, height: '0.5px', background: 'var(--border)' }} />
          </div>

          <button
            onClick={loginAsGuest}
            style={{
              width: '100%', padding: '9px 14px', borderRadius: 'var(--radius-md)',
              border: '0.5px solid var(--border-strong)', background: 'rgba(255,255,255,0.03)',
              fontSize: 12, color: 'var(--text-muted)', cursor: 'pointer',
              transition: 'background 0.15s, color 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'var(--text)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
          >
            View as guest — read-only demo
          </button>

          <div style={{ marginTop: 14, fontSize: 10, color: 'var(--text-hint)', textAlign: 'center', lineHeight: 1.6 }}>
            Access is managed by your system administrator.<br />
            Contact the BCHS data team if you need access.
          </div>
        </div>

        <div style={{ marginTop: 16, textAlign: 'center', fontSize: 10, color: 'var(--text-hint)' }}>
          YMCA of Greater Boston · BCHS Pulse
        </div>
      </div>
    </div>
  );
}
