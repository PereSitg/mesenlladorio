"use client";

import { useState, useEffect } from "react";

export default function ShareButtons({ url, title, excerpt }) {
  const [shareUrl, setShareUrl] = useState("");

  useEffect(() => {
    // Ens assegurem que estem al client per obtenir la URL completa
    setShareUrl(encodeURIComponent(window.location.href));
  }, []);

  const encodedTitle = encodeURIComponent(title);
  const encodedExcerpt = encodeURIComponent(excerpt || "");

  const shareLinks = [
    {
      name: "WhatsApp",
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 24, height: 24 }}>
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      ),
      url: `https://wa.me/?text=${encodedTitle}%20${shareUrl}`,
      color: "#25D366"
    },

    {
      name: "Telegram",
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 24, height: 24 }}>
          <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.14-.26.26-.53.26l.204-2.924 5.33-4.814c.23-.21-.05-.33-.35-.125l-6.592 4.15-2.834-.886c-.615-.19-.627-.615.13-.913l11.07-4.265c.515-.19.965.12.77.915z"/>
        </svg>
      ),
      url: `https://t.me/share/url?url=${shareUrl}&text=${encodedTitle}`,
      color: "#0088cc"
    },
    {
      name: "Facebook",
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 24, height: 24 }}>
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      ),
      url: `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`,
      color: "#1877F2"
    }
  ];

  return (
    <div style={{ marginTop: '3rem', padding: '2rem 0', borderTop: '1px solid var(--gray-200)' }}>
      <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--primary-dark)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        Comparteix aquest article
      </p>
      <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
        {shareLinks.map(link => (
          <a
            key={link.name}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            title={`Compartir a ${link.name}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '45px',
              height: '45px',
              borderRadius: '12px',
              background: 'white',
              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)',
              color: link.color,
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              border: '1px solid var(--gray-100)'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0,0,0,0.1)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.1)';
            }}
          >
            {link.icon}
          </a>
        ))}
      </div>
    </div>
  );
}
