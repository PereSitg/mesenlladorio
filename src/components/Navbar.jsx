'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();

  const handleLogoClick = (e) => {
    if (pathname === '/') {
      e.preventDefault();
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  };

  return (
    <header style={{ 
      background: 'rgba(27, 79, 114, 0.95)', 
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      color: 'white', 
      padding: '1.5rem 0',
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      width: '100%',
      zIndex: 1000,
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    }}>
      <div className="layout-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link href="/" className="nav-logo-container" onClick={handleLogoClick}>
          <span className="nav-text-logo">Més enllà d&apos;Orió</span>
          <img src="/logo_owl.png" alt="Logo" className="nav-image-logo" />
        </Link>
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }} className="nav-links-wrapper">
          <nav className="main-nav">
            <Link href="/" style={{ fontWeight: 500 }} onClick={handleLogoClick}>Inici</Link>
            <Link href="/blog" style={{ fontWeight: 500 }}>Blog</Link>
            <Link href="/youtube" style={{ fontWeight: 500 }}>YouTube</Link>
            <Link href="/about" style={{ fontWeight: 500 }}>Nosaltres</Link>
          </nav>
          
          <div className="social-links-nav">
            <a href="https://www.youtube.com/channel/UCxhIYuLtgo_apR3rzl82flA" target="_blank" rel="noopener noreferrer" className="social-icon-nav" aria-label="YouTube">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
            </a>

            <a href="https://www.tiktok.com/@mesenlladorio" target="_blank" rel="noopener noreferrer" className="social-icon-nav" aria-label="TikTok">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12.525.02c1.31-.032 2.612.353 3.746 1.055 1.255.772 2.103 2.1 2.4 3.568 1.132-.016 2.261-.17 3.35-.46a.07.07 0 0 1 .094.062v4.444a.07.07 0 0 1-.059.07 7.02 7.02 0 0 1-4.06-1.18V13.5a7.5 7.5 0 1 1-10.5-6.91v4.44a3.02 3.02 0 1 0 3.02 4.02v-15a.07.07 0 0 1 .07-.07h2.51z"/></svg>
            </a>
            <a href="https://www.instagram.com/mesenlladorio/" target="_blank" rel="noopener noreferrer" className="social-icon-nav" aria-label="Instagram">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4.162 4.162 0 1 1 0-8.324A4.162 4.162 0 0 1 12 16zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg>
            </a>
          </div>
        </div>
        <style dangerouslySetInnerHTML={{__html: `
          .nav-logo-container {
            font-size: 1.5rem;
            font-weight: bold;
            display: flex;
            align-items: center;
            text-decoration: none;
            color: inherit;
            cursor: pointer;
            position: relative;
            z-index: 10;
            transition: opacity 0.3s ease;
          }
          .nav-logo-container:hover {
            opacity: 0.8;
          }
          .nav-image-logo {
            display: none;
            height: 45px;
            width: auto;
          }
          .nav-text-logo {
            display: block;
          }
          .main-nav {
            display: flex;
            gap: 1.25rem;
            align-items: center;
          }
          .social-links-nav {
            display: flex;
            gap: 0.6rem;
            align-items: center;
            margin-left: 0.5rem;
            padding-left: 1rem;
            border-left: 1px solid rgba(255,255,255,0.2);
          }
          .social-icon-nav { 
            width: 32px; 
            height: 32px; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            background: rgba(255,255,255,0.1); 
            border-radius: 50%; 
            color: white; 
            transition: all 0.3s ease; 
            padding: 7px;
          }
          .social-icon-nav:hover { 
            background: rgba(255,255,255,0.2); 
            transform: translateY(-2px); 
          }
          .social-icon-nav svg { width: 100%; height: 100%; }

          @media (max-width: 1024px) {
            .nav-text-logo { display: none; }
            .nav-image-logo { display: block; }
            .main-nav { gap: 1.25rem; }
            .main-nav a { font-size: 1.2rem; }
            .nav-links-wrapper { gap: 1.25rem !important; }
          }

          @media (max-width: 768px) {
            .nav-logo-container {
              margin-right: 1.5rem;
            }
            .nav-image-logo { 
              height: 40px; 
            }
            .main-nav { 
              gap: 1.2rem; 
            }
            .main-nav a { font-size: 1.05rem; }
            .social-links-nav { display: none; }
          }
        `}} />
      </div>
    </header>
  );
}
