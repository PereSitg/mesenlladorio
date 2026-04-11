export default function Footer() {
  return (
    <footer style={{ 
      background: 'var(--primary-dark)', 
      color: 'white', 
      padding: '2rem 0', 
      marginTop: 'auto' 
    }}>
      <div className="layout-container" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
        <div>
          <p style={{ fontWeight: 'bold', fontSize: '1.2rem', marginBottom: '0.5rem' }}>Més enllà d&apos;Orió</p>
          <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)' }}>&copy; {new Date().getFullYear()} Tots els drets reservats.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          {/* Aquests enllaços es connectaran formalment un cop sapiguem les URLs o d'entrada es deixen així */}
          <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" style={{ padding: '0.5rem', background: 'rgba(255,255,255,0.1)', borderRadius: '50%' }}>
            📺 YT
          </a>
          <a href="https://x.com" target="_blank" rel="noopener noreferrer" style={{ padding: '0.5rem', background: 'rgba(255,255,255,0.1)', borderRadius: '50%' }}>
             ✖️ X
          </a>
          <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" style={{ padding: '0.5rem', background: 'rgba(255,255,255,0.1)', borderRadius: '50%' }}>
            🎵 TT
          </a>
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" style={{ padding: '0.5rem', background: 'rgba(255,255,255,0.1)', borderRadius: '50%' }}>
            📸 IG
          </a>
        </div>
      </div>
    </footer>
  );
}
