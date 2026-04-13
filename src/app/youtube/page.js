import Link from "next/link";

export const metadata = {
  title: "Canal de YouTube - Més enllà d'Orió",
  description: "Explora tots els vídeos del nostre canal de YouTube sobre tecnologia, estafes i curiositats.",
};

export default function YouTubePage() {
  const videos = [
    { id: "s4ycv5hkAPk", title: "Benvinguts al canal: Més enllà d'Orió", thumbnail: "https://img.youtube.com/vi/s4ycv5hkAPk/maxresdefault.jpg" },
    { id: "1", title: "La gran estafa de les Crypto: Com van robar milions", thumbnail: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=800&q=80" },
    { id: "2", title: "Gadgets inútils que la gent segueix comprant", thumbnail: "https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?w=800&q=80" },
    { id: "3", title: "El misteri d'Internet que ningú ha resolt", thumbnail: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80" },
  ];

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
      <header style={{ marginBottom: '4rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '3.5rem', fontWeight: 800, color: 'var(--primary-dark)', marginBottom: '1rem', letterSpacing: '-0.03em' }}>
          El nostre Canal de YouTube
        </h1>
        <p style={{ fontSize: '1.25rem', color: 'rgba(0,0,0,0.6)', maxWidth: '700px', margin: '0 auto 2.5rem' }}>
          Subscriu-te per no perdre&apos;t cap història sobre tecnologia, fraus i tot allò que ens fa explotar el cap.
        </p>
        <a 
          href="https://www.youtube.com/channel/UCxhIYuLtgo_apR3rzl82flA?sub_confirmation=1" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="btn" 
          style={{ background: '#FF0000', color: 'white', padding: '1rem 2.5rem', fontSize: '1.1rem', borderRadius: '12px', display: 'inline-flex', alignItems: 'center', gap: '0.75rem' }}
        >
          <svg style={{ width: 24, height: 24, fill: 'white' }} viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg>
          Subscriu-te al Canal
        </a>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2.5rem' }}>
        {videos.map(video => (
          <div key={video.id} className="card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', borderRadius: '16px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
            <a 
              href={`https://youtube.com/watch?v=${video.id}`} 
              target="_blank" 
              rel="noopener noreferrer" 
              style={{ display: 'block', position: 'relative', width: '100%', aspectRatio: '16/9', overflow: 'hidden' }}
            >
              <img 
                src={video.thumbnail} 
                alt={video.title} 
                style={{ objectFit: 'cover', width: '100%', height: '100%', transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)' }} 
                className="zoom-on-hover" 
              />
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'rgba(255,0,0,0.9)', borderRadius: '50%', width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.9 }}>
                 <svg style={{ width: 30, height: 30, fill: 'white', marginLeft: '4px' }} viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
              </div>
            </a>
            <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: 'white' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1rem', lineHeight: 1.4, color: 'var(--foreground)' }}>{video.title}</h3>
              <a 
                href={`https://youtube.com/watch?v=${video.id}`} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="btn" 
                style={{ textAlign: 'center', background: '#f1f1f1', color: 'var(--primary-dark)', width: '100%', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 600 }}
              >
                Veure a YouTube
              </a>
            </div>
          </div>
        ))}
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .zoom-on-hover:hover {
           transform: scale(1.08);
        }
      `}} />
    </div>
  );
}
