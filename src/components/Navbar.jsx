import Link from 'next/link';

export default function Navbar() {
  return (
    <header style={{ 
      background: 'var(--primary-blue)', 
      color: 'white', 
      padding: '1rem 0',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      position: 'sticky',
      top: 0,
      zIndex: 50
    }}>
      <div className="layout-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link href="/" style={{ fontSize: '1.5rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span>Més enllà d&apos;Orió</span>
        </Link>
        <nav style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
          <Link href="/" style={{ fontWeight: 500 }}>Inici</Link>
          <Link href="/blog" style={{ fontWeight: 500 }}>Blog</Link>
          <Link href="/youtube" style={{ fontWeight: 500 }}>YouTube</Link>
          <Link href="/about" style={{ fontWeight: 500 }}>Sobre nosaltres</Link>
          <div style={{ paddingLeft: '1rem', borderLeft: '1px solid rgba(255,255,255,0.3)' }}>
            <Link href="/dashboard" className="btn" style={{ padding: '0.4rem 1rem', background: 'white', color: 'var(--primary-blue)', fontSize: '0.9rem' }}>
              Login
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
