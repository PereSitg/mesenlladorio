import Link from "next/link";

export default function Footer() {
  return (
    <footer style={{ 
      background: 'var(--primary-dark)', 
      color: 'white', 
      padding: '4rem 0', 
      marginTop: 'auto' 
    }}>
      <div className="layout-container" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '2rem' }}>
        <div>
          <p style={{ fontWeight: 'bold', fontSize: '1.4rem', marginBottom: '0.5rem' }}>Més enllà d&apos;Orió</p>
          <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1rem' }}>
            <Link href="/youtube" style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none', fontSize: '1.1rem', fontWeight: 600 }}>Youtube Videos</Link>
          </div>
          <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)' }}>&copy; {new Date().getFullYear()} Tots els drets reservats.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
          <a href="https://www.youtube.com/channel/UCxhIYuLtgo_apR3rzl82flA" target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="YouTube">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
          </a>
          <a href="https://x.com/mesenlladorio" target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="X">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
          </a>
          <a href="https://www.tiktok.com/@mesenlladorio" target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="TikTok">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12.525.02c1.31-.032 2.612.353 3.746 1.055 1.255.772 2.103 2.1 2.4 3.568 1.132-.016 2.261-.17 3.35-.46a.07.07 0 0 1 .094.062v4.444a.07.07 0 0 1-.059.07 7.02 7.02 0 0 1-4.06-1.18V13.5a7.5 7.5 0 1 1-10.5-6.91v4.44a3.02 3.02 0 1 0 3.02 4.02v-15a.07.07 0 0 1 .07-.07h2.51z"/></svg>
          </a>
          <a href="https://www.instagram.com/mesenlladorio/" target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="Instagram">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4.162 4.162 0 1 1 0-8.324A4.162 4.162 0 0 1 12 16zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg>
          </a>
        </div>
        <style dangerouslySetInnerHTML={{__html: `
          .social-icon { 
            width: 38px; 
            height: 38px; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            background: rgba(255,255,255,0.1); 
            border-radius: 50%; 
            color: white; 
            transition: all 0.3s ease; 
            padding: 8px;
          }
          .social-icon:hover { 
            background: var(--primary-blue); 
            transform: translateY(-3px); 
            box-shadow: 0 4px 12px rgba(0,0,0,0.2); 
          }
          .social-icon svg { width: 100%; height: 100%; }
        `}} />
      </div>
    </footer>
  );
}
