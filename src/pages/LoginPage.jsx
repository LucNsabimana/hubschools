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
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 12, background: 'var(--navy)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px', boxShadow: 'var(--shadow-md)',
          }}>
            <div style={{ color: 'var(--orange)', fontSize: 26 }}>◎</div>
          </div>
          <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--orange)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>
            Boston Community Hub Schools
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 600, color: 'var(--navy)', marginBottom: 6 }}>
            AOA Platform
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>
            Assets & Opportunity Assessment<br />Sign in with your school Google account.
          </p>
        </div>

        <div style={{
          background: 'var(--card)', borderRadius: 'var(--radius-xl)',
          border: '0.5px solid var(--border)', padding: '28px 24px',
          boxShadow: 'var(--shadow-md)',
        }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '16px 0', color: 'var(--text-muted)', fontSize: 13 }}>
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
              />
            </div>
          )}

          {error && (
            <div style={{
              marginTop: 14, padding: '10px 12px', background: 'var(--red-bg)', color: 'var(--red)',
              borderRadius: 'var(--radius-md)', fontSize: 12, lineHeight: 1.5,
            }}>
              {error}
            </div>
          )}

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '20px 0 16px' }}>
            <div style={{ flex: 1, height: '0.5px', background: 'var(--border)' }} />
            <span style={{ fontSize: 11, color: 'var(--text-hint)' }}>or</span>
            <div style={{ flex: 1, height: '0.5px', background: 'var(--border)' }} />
          </div>

          {/* Guest access */}
          <button
            onClick={loginAsGuest}
            style={{
              width: '100%', padding: '10px 16px', borderRadius: 'var(--radius-md)',
              border: '0.5px solid var(--border-strong)', background: 'transparent',
              fontSize: 13, color: 'var(--text-muted)', cursor: 'pointer',
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--surface)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            View as guest — read-only demo
          </button>

          <div style={{ marginTop: 16, fontSize: 11, color: 'var(--text-hint)', textAlign: 'center', lineHeight: 1.6 }}>
            Access is managed by your system administrator.<br />
            Contact the BCHS data team if you need access.
          </div>
        </div>

        <div style={{ marginTop: 20, textAlign: 'center', fontSize: 11, color: 'var(--text-hint)' }}>
          YMCA of Greater Boston · Boston Community Hub Schools
        </div>
      </div>
    </div>
  );
}
