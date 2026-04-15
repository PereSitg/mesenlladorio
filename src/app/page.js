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
            Tecnologia, xarxes socials, notícies <br /> i coses random
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
        <section style={{ background: 'var(--gray-50)', padding: '5rem 2rem', borderRadius: '32px', margin: '0 -1rem' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3.5rem', flexWrap: 'wrap', gap: '1.5rem' }}>
              <div>
                <h2 style={{ fontSize: '3rem', color: 'var(--primary-dark)', fontWeight: 800, marginBottom: '0.5rem', letterSpacing: '-0.03em' }}>Últims vídeos i novetats</h2>
                <p style={{ color: 'rgba(0,0,0,0.6)', fontSize: '1.2rem' }}>No et perdis el contingut més recent i les nostres properes estrenes.</p>
              </div>
              <Link href="/youtube" className="btn" style={{ background: 'transparent', color: 'var(--primary-blue)', border: '2px solid var(--primary-blue)', fontWeight: 600, padding: '0.8rem 1.5rem', borderRadius: '12px' }}>Veure tots &rarr;</Link>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '3rem' }}>
              {homeVideos.map(video => (
                <div key={video.id} className="card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', borderRadius: '24px', border: 'none', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.1)', background: 'white', transition: 'transform 0.3s ease' }}>
                  <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', overflow: 'hidden' }}>
                    <img 
                      src={video.customThumbnailUrl || (video.videoId ? `https://img.youtube.com/vi/${video.videoId}/hqdefault.jpg` : "https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3?w=800&q=80")} 
                      alt={video.title} 
                      style={{ objectFit: 'cover', width: '100%', height: '100%', transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)' }} 
                      className="zoom-on-hover" 
                    />
                    {(video.statusText || !video.videoId) && (
                      <div style={{ 
                        position: 'absolute', 
                        top: '1.25rem', 
                        right: '1.25rem', 
                        background: video.videoId ? 'rgba(0,0,0,0.8)' : 'var(--primary-blue)', 
                        color: 'white', 
                        padding: '0.4rem 0.9rem', 
                        borderRadius: '8px', 
                        fontSize: '0.75rem', 
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                        backdropFilter: 'blur(8px)',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                      }}>
                        {video.statusText || "Properament"}
                      </div>
                    )}
                  </div>
                  <div style={{ padding: '2rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <h3 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '2rem', lineHeight: 1.3, color: 'var(--primary-dark)' }}>{video.title}</h3>
                    {video.videoId ? (
                      <a href={`https://youtube.com/watch?v=${video.videoId}`} target="_blank" rel="noopener noreferrer" className="btn" style={{ textAlign: 'center', background: 'var(--primary-blue)', width: '100%', borderRadius: '14px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.75rem', padding: '1rem', fontWeight: 600 }}>
                        <svg style={{ width: 20, height: 20, fill: 'white' }} viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg>
                        Veure Vídeo
                      </a>
                    ) : (
                      <div style={{ 
                        textAlign: 'center', 
                        padding: '1rem', 
                        background: 'var(--gray-50)', 
                        color: 'var(--gray-500)', 
                        width: '100%', 
                        borderRadius: '14px', 
                        cursor: 'default',
                        fontWeight: 600,
                        border: '2px dashed var(--gray-200)'
                      }}>
                        Disponible aviat
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
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
