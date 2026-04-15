import Link from "next/link";
import { getFeaturedVideo, getAllVideos } from "@/lib/firebase/videos";
import YouTubePlayer from "@/components/YouTubePlayer";

export const dynamic = "force-dynamic";

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
  const featuredVideo = await getFeaturedVideo();
  const allVideos = await getAllVideos();
  
  // Filtrem els vídeos que s'han de mostrar al Home (galeria inferior)
  const homeVideos = allVideos.filter(v => v.showOnHome);

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
            Tecnologia, xarxes socials,<br /> notícies i coses random
          </h1>
          <p style={{ fontSize: '1.35rem', opacity: 0.9, marginBottom: '3rem', maxWidth: '650px', lineHeight: 1.6, fontWeight: 300 }}>
            Benvingut a <strong>Més enllà d&apos;Orió</strong>. Històries de fraus, criptomonedes, reflexions sobre el futur de la tecnologia i casos totalment <i>random</i> que et faran explotar el cap.
          </p>
          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
            <Link href="/blog" className="btn" style={{ background: 'white', color: 'var(--primary-dark)', fontSize: '1.1rem', padding: '1rem 2rem', borderRadius: '12px' }}>
              Llegir el Blog
            </Link>
            <a href="https://www.youtube.com/channel/UCxhIYuLtgo_apR3rzl82flA" target="_blank" rel="noopener noreferrer" className="btn" style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', fontSize: '1.1rem', padding: '1rem 2rem', borderRadius: '12px' }}>
              Canal de YouTube
            </a>
          </div>
        </div>
        <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 70%)', borderRadius: '50%', pointerEvents: 'none' }}></div>
      </section>
      
      {/* Featured Video Player - NOMÉS SI EXISTEIX */}
      {featuredVideo && (
        <section style={{ maxWidth: '950px', margin: '0 auto', width: '100%' }}>
          <YouTubePlayer 
            videoId={featuredVideo.videoId} 
            title={featuredVideo.title} 
            isFeatured={true} 
            customThumbnailUrl={featuredVideo.customThumbnailUrl}
          />
        </section>
      )}

      {/* Videos Section - NOMÉS SI N'HI HA MARCATS PER AL HOME */}
      {homeVideos.length > 0 && (
        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '2.5rem', color: 'var(--primary-dark)', fontWeight: 800, marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>Vídeos i Novetats</h2>
              <p style={{ color: 'rgba(0,0,0,0.6)', fontSize: '1.15rem' }}>Contingut seleccionat del nostre canal de YouTube.</p>
            </div>
            <Link href="/youtube" className="btn" style={{ background: 'transparent', color: 'var(--primary-blue)', border: '2px solid var(--primary-blue)', fontWeight: 600 }}>Veure tots &rarr;</Link>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2.5rem' }}>
            {homeVideos.map(video => (
              <div key={video.id} className="card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', borderRadius: '16px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', overflow: 'hidden' }}>
                  <img 
                    src={video.customThumbnailUrl || (video.videoId ? `https://img.youtube.com/vi/${video.videoId}/hqdefault.jpg` : "https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3?w=800&q=80")} 
                    alt={video.title} 
                    style={{ objectFit: 'cover', width: '100%', height: '100%', transition: 'transform 0.6s' }} 
                    className="zoom-on-hover" 
                  />
                  <div style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(0,0,0,0.7)', color: 'white', padding: '0.3rem 0.6rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                    {video.videoId ? 'Nou' : 'Anunci'}
                  </div>
                </div>
                <div style={{ padding: '1.75rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: 'white' }}>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '1.5rem', lineHeight: 1.4, color: 'var(--foreground)' }}>{video.title}</h3>
                  {video.videoId ? (
                    <a href={`https://youtube.com/watch?v=${video.videoId}`} target="_blank" rel="noopener noreferrer" className="btn" style={{ textAlign: 'center', background: '#FF0000', width: '100%', borderRadius: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
                      <svg style={{ width: 24, height: 24, fill: 'white' }} viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg>
                      Veure Vídeo
                    </a>
                  ) : (
                    <div className="btn" style={{ textAlign: 'center', background: 'var(--gray-300)', color: 'var(--gray-600)', width: '100%', borderRadius: '8px', cursor: 'default' }}>
                      Properament
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        .zoom-on-hover:hover {
           transform: scale(1.08);
        }
      `}} />
    </div>
  );
}
