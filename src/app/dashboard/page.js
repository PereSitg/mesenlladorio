"use client";

import { useEffect, useState } from "react";
import { auth, provider } from "@/lib/firebase/config";
import { signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";

export default function Dashboard() {
  const AUTHORIZED_EMAIL = "mesenlladorio@gmail.com";
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (usr) => {
      if (usr && usr.email !== AUTHORIZED_EMAIL) {
        signOut(auth);
        setUser(null);
        setError("Accés denegat. Aquest compte no està autoritzat.");
      } else {
        setUser(usr);
        setError(null);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleLogin = async () => {
    setError(null);
    try {
      const result = await signInWithPopup(auth, provider);
      if (result.user.email !== AUTHORIZED_EMAIL) {
        await signOut(auth);
        setError("Accés denegat. Només el compte oficial pot entrar.");
      }
    } catch (err) {
      console.error(err);
      setError("S'ha produït un error al connectar amb Google.");
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  if (loading) return <div className="layout-container" style={{ padding: '4rem 1rem', textAlign: 'center' }}>Carregant...</div>;

  if (!user) {
    return (
      <div className="layout-container" style={{ padding: '4rem 1rem', textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
        <div className="card">
          <h1 style={{ fontSize: '2rem', marginBottom: '1rem', color: 'var(--primary-dark)' }}>Accés Administració</h1>
          
          {error && (
            <div style={{ background: '#FEE2E2', color: '#B91C1C', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
              {error}
            </div>
          )}

          <p style={{ marginBottom: '2rem', color: 'rgba(0,0,0,0.7)' }}>Has d&apos;iniciar sessió amb un compte de Gmail autoritzat per gestionar els continguts de la web i el blog.</p>
          <button onClick={handleLogin} className="btn" style={{ fontSize: '1.1rem', background: '#DB4437', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
            <svg style={{ width: '20px', height: '20px', fill: 'white' }} viewBox="0 0 24 24"><path d="M12.24 10.285V14.4h6.806c-.275 1.765-2.056 5.174-6.806 5.174-4.095 0-7.439-3.389-7.439-7.574s3.345-7.574 7.439-7.574c2.33 0 3.891.989 4.785 1.849l3.254-3.138C18.189 1.186 15.479 0 12.24 0c-6.635 0-12 5.365-12 12s5.365 12 12 12c6.926 0 11.52-4.869 11.52-11.726 0-.788-.085-1.39-.189-1.989H12.24z"/></svg>
            Entrar amb Google
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="layout-container" style={{ padding: '2rem 1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h1 style={{ fontSize: '2rem', color: 'var(--primary-dark)' }}>Panell de Control</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ fontSize: '0.9rem' }}>Connectat com: <strong>{user.email}</strong></span>
          <button onClick={handleLogout} className="btn" style={{ background: 'transparent', border: '1px solid var(--primary-blue)', color: 'var(--primary-blue)', padding: '0.5rem 1rem' }}>
            Sortir
          </button>
        </div>
      </div>
      
      <div className="card" style={{ marginBottom: '2rem' }}>
        <h2 style={{ marginBottom: '1rem', color: 'var(--primary-blue)' }}>Gestió del Blog</h2>
        <p style={{ marginBottom: '1.5rem' }}>Des d&apos;aquí podràs crear, editar i esborrar articles del teu blog de Més enllà d&apos;Orió, així com pujar-hi fotografies.</p>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
           <button className="btn">📝 Nou Article</button>
           <button className="btn" style={{ background: 'var(--foreground)' }}>📚 Veure Publicacions</button>
        </div>
      </div>
    </div>
  );
}
