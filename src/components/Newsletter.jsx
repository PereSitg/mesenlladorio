'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';

export default function Newsletter() {
  const pathname = usePathname();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [errorMessage, setErrorMessage] = useState('');

  // No mostrem la newsletter al dashboard
  if (pathname?.startsWith('/dashboard')) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');

    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Alguna cosa ha anat malament');
      }

      setStatus('success');
      setEmail('');
    } catch (err) {
      setStatus('error');
      setErrorMessage(err.message);
    }
  };

  return (
    <section className="newsletter-section" style={{ padding: '4rem 0', background: 'var(--accent)' }}>
      <div className="layout-container">
        <div className="newsletter-card" style={{
          background: 'linear-gradient(135deg, var(--primary-blue) 0%, var(--primary-dark) 100%)',
          borderRadius: '32px',
          padding: '4rem 2rem',
          textAlign: 'center',
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 20px 40px rgba(27, 79, 114, 0.2)'
        }}>
          {/* Elements decoratius de fons */}
          <div style={{
            position: 'absolute',
            top: '-50px',
            right: '-50px',
            width: '200px',
            height: '200px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.05)',
            zIndex: 0
          }}></div>

          <div style={{ position: 'relative', zIndex: 1, maxWidth: '600px', margin: '0 auto' }}>
            <span style={{ 
              display: 'inline-block', 
              padding: '0.5rem 1rem', 
              background: 'rgba(255,255,255,0.1)', 
              borderRadius: '99px', 
              fontSize: '0.8rem', 
              fontWeight: 700, 
              textTransform: 'uppercase', 
              letterSpacing: '1px',
              marginBottom: '1.5rem'
            }}>
              🚀 No te'n perdis res
            </span>
            
            {status === 'success' ? (
              <div style={{ padding: '2rem 0' }}>
                <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem' }}>Benvingut a bord! 🎊</h2>
                <p style={{ fontSize: '1.2rem', opacity: 0.9 }}>T'has subscrit correctament. Aviat rebràs les nostres novetats.</p>
                <button 
                  onClick={() => setStatus('idle')}
                  style={{
                    marginTop: '2rem',
                    background: 'rgba(255,255,255,0.2)',
                    border: '1px solid white',
                    color: 'white',
                    padding: '0.5rem 1.5rem',
                    borderRadius: '12px',
                    cursor: 'pointer'
                  }}
                >
                  Tornar
                </button>
              </div>
            ) : (
              <>
                <h2 style={{ 
                  fontSize: '2.5rem', 
                  fontWeight: 800, 
                  marginBottom: '1rem',
                  lineHeight: 1.2
                }}>
                  Subscriu-te a la Newsletter
                </h2>
                
                <p style={{ 
                  fontSize: '1.1rem', 
                  opacity: 0.9, 
                  marginBottom: '2.5rem',
                  lineHeight: 1.6
                }}>
                  Rep directament al teu correu els nostres millors vídeos i les nostres històries.
                </p>

                <form 
                  onSubmit={handleSubmit}
                  style={{ 
                    display: 'flex', 
                    gap: '1rem', 
                    flexWrap: 'wrap', 
                    justifyContent: 'center',
                    background: 'rgba(255,255,255,0.1)',
                    padding: '0.5rem',
                    borderRadius: '16px',
                    backdropFilter: 'blur(10px)'
                  }}
                >
                  <input
                    type="email"
                    placeholder="El teu correu electrònic"
                    required
                    disabled={status === 'loading'}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{
                      flex: 1,
                      minWidth: '250px',
                      padding: '1rem 1.5rem',
                      borderRadius: '12px',
                      border: '1px solid rgba(255,255,255,0.2)',
                      background: 'rgba(255,255,255,0.1)',
                      color: 'white',
                      fontSize: '1rem',
                      outline: 'none',
                      transition: 'all 0.3s ease'
                    }}
                    className="newsletter-input"
                  />
                  <button
                    type="submit"
                    disabled={status === 'loading'}
                    className="btn-newsletter"
                    style={{
                      padding: '1rem 2rem',
                      borderRadius: '12px',
                      border: 'none',
                      background: 'white',
                      color: 'var(--primary-blue)',
                      fontWeight: 700,
                      fontSize: '1rem',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    {status === 'loading' ? 'Enviant...' : 'Subscriure\'m'}
                  </button>
                </form>

                {status === 'error' && (
                  <p style={{ marginTop: '1rem', color: '#ffb3b3', fontSize: '0.9rem', fontWeight: 600 }}>
                    ❌ {errorMessage}
                  </p>
                )}
                
                <p style={{ marginTop: '1.5rem', fontSize: '0.8rem', opacity: 0.6 }}>
                  Privacitat garantida. Pots donar-te de baixa en qualsevol moment.
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      <style jsx global>{`
        .newsletter-input::placeholder {
          color: rgba(255,255,255,0.6);
        }
        .newsletter-input:focus {
          background: rgba(255,255,255,0.2) !important;
          border-color: white !important;
        }
        .btn-newsletter:hover:not(:disabled) {
          background: var(--accent) !important;
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(0,0,0,0.1);
        }
        .btn-newsletter:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        @media (max-width: 768px) {
          .newsletter-card {
            padding: 3rem 1.5rem !important;
            border-radius: 24px !important;
          }
          h2 { font-size: 2rem !important; }
        }
      `}</style>
    </section>
  );
}
