import Link from "next/link";

export const metadata = {
  title: "Més enllà d'Orió - Tecnologia, Estafes i Coses Random",
  description: "Tecnologia, històries increïbles, criptomonedes i curiositats. Parlem de tot allò que ens fascina i ens explota el cap.",
  openGraph: {
    title: "Més enllà d'Orió - Tecnologia, Estafes i Coses Random",
    description: "Tecnologia, històries increïbles, criptomonedes i curiositats. Parlem de tot allò que ens fascina i ens explota el cap.",
    images: ["https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=1200&q=80"],
  }
};

export default async function Home() {
  const mockVideos = [
    { id: "1", title: "La gran estafa de les Crypto: Com van robar milions", thumbnail: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=800&q=80" },
    { id: "2", title: "Gadgets inútils que la gent segueix comprant", thumbnail: "https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?w=800&q=80" },
    { id: "3", title: "El misteri d'Internet que ningú ha resolt", thumbnail: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80" },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '5rem', paddingBottom: '3rem' }}>
      {/* Hero Section */}
      <section style={{ 
        position: 'relative', 
        padding: '6rem 3rem', 
        borderRadius: '24px', 
        background: 'linear-gradient(135deg, var(--primary-dark) 0%, var(--primary-blue) 100%)',
        color: 'white',
        overflow: 'hidden',
        boxShadow: '0 25px 50px -12px rgba(27, 79, 114, 0.4)'
      }}>
        <div style={{ position: 'relative', zIndex: 10, maxWidth: '800px' }}>
          <h1 style={{ fontSize: '4rem', fontWeight: 800, lineHeight: 1.1, marginBottom: '1.5rem', letterSpacing: '-0.03em' }}>
            Tecnologia, estafes<br /> i coses random
          </h1>
          <p style={{ fontSize: '1.35rem', opacity: 0.9, marginBottom: '3rem', maxWidth: '650px', lineHeight: 1.6, fontWeight: 300 }}>
            Benvingut a <strong>Més enllà d&apos;Orió</strong>. Històries de fraus, criptomonedes, reflexions sobre el futur de la tecnologia i casos totalment <i>random</i> que et faran explotar el cap.
          </p>
          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
            <Link href="/blog" className="btn" style={{ background: 'white', color: 'var(--primary-dark)', fontSize: '1.1rem', padding: '1rem 2rem', borderRadius: '12px' }}>
              Llegir el Blog
            </Link>
            <a href="https://youtube.com" className="btn" style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', fontSize: '1.1rem', padding: '1rem 2rem', borderRadius: '12px' }}>
              Canal de YouTube
            </a>
          </div>
        </div>
        <div style={{ position: 'absolute', top: '-20%', right: '-10%', width: '700px', height: '700px', background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 60%)', borderRadius: '50%', pointerEvents: 'none' }}></div>
      </section>

      {/* Videos Section */}
      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '2.5rem', color: 'var(--primary-dark)', fontWeight: 800, marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>Descobreix els Videos</h2>
            <p style={{ color: 'rgba(0,0,0,0.6)', fontSize: '1.15rem' }}>Mira les novetats directament des del nostre canal de YouTube.</p>
          </div>
          <a href="#" className="btn" style={{ background: 'transparent', color: 'var(--primary-blue)', border: '2px solid var(--primary-blue)', fontWeight: 600 }}>Veure més a la llista &rarr;</a>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2.5rem' }}>
          {mockVideos.map(video => (
            <div key={video.id} className="card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', borderRadius: '16px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
              <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', overflow: 'hidden' }}>
                <img src={video.thumbnail} alt={video.title} style={{ objectFit: 'cover', width: '100%', height: '100%', transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)' }} className="zoom-on-hover" />
                <div style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(0,0,0,0.7)', color: 'white', padding: '0.3rem 0.6rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 'bold' }}>Nou</div>
              </div>
              <div style={{ padding: '1.75rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: 'white' }}>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '1.5rem', lineHeight: 1.4, color: 'var(--foreground)' }}>{video.title}</h3>
                <a href={`https://youtube.com/watch?v=${video.id}`} className="btn" style={{ textAlign: 'center', background: '#FF0000', width: '100%', borderRadius: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
                  <svg style={{ width: 24, height: 24, fill: 'white' }} viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg>
                  Veure Vídeo
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      <style dangerouslySetInnerHTML={{__html: `
        .zoom-on-hover:hover {
           transform: scale(1.08);
        }
      `}} />
    </div>
  );
}
