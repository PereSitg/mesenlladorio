import Link from "next/link";
import { getAllVideos } from "@/lib/firebase/videos";
import YouTubePlayer from "@/components/YouTubePlayer";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Canal de YouTube - Més enllà d'Orió",
  description: "Explora tots els vídeos del nostre canal de YouTube sobre tecnologia, estafes i curiositats.",
};

export default async function YouTubePage() {
  const videos = await getAllVideos();

  // Dades per defecte si Firestore està buit
  const defaultVideos = [
    { videoId: "s4ycv5hkAPk", title: "Benvinguts al canal: Més enllà d'Orió" },
    { videoId: "1", title: "La gran estafa de les Crypto: Com van robar milions" },
    { videoId: "2", title: "Gadgets inútils que la gent segueix comprant" },
    { videoId: "3", title: "El misteri d'Internet que ningú ha resolt" },
  ];

  const displayVideos = (videos.length > 0 ? videos : defaultVideos)
    .filter(v => v.showOnYoutube !== false);

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

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
        gap: '3rem' 
      }} className="video-grid-3">
        {displayVideos.map(video => (
          <div key={video.id || video.videoId} className="card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', borderRadius: '24px', border: 'none', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.1)', background: 'white' }}>
            <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', overflow: 'hidden' }}>
              <img 
                src={video.customThumbnailUrl || (video.videoId ? `https://img.youtube.com/vi/${video.videoId}/hqdefault.jpg` : "https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3?w=800&q=80")} 
                alt={video.title} 
                style={{ objectFit: 'cover', width: '100%', height: '100%' }} 
              />
              {(video.statusText || !video.videoId) && (
                <div style={{ 
                  position: 'absolute', 
                  top: '1rem', 
                  right: '1rem', 
                  background: video.videoId ? 'rgba(0,0,0,0.8)' : 'var(--primary-blue)', 
                  color: 'white', 
                  padding: '0.4rem 0.8rem', 
                  borderRadius: '8px', 
                  fontSize: '0.7rem', 
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  backdropFilter: 'blur(8px)'
                }}>
                  {video.statusText || "Properament"}
                </div>
              )}
            </div>
            <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.5rem', lineHeight: 1.4, color: 'var(--primary-dark)' }}>{video.title}</h3>
              {video.videoId ? (
                <a 
                  href={`https://youtube.com/watch?v=${video.videoId}`} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="btn" 
                  style={{ textAlign: 'center', background: 'var(--primary-blue)', width: '100%', borderRadius: '12px', fontSize: '0.9rem', fontWeight: 600, padding: '0.8rem' }}
                >
                  Veure Vídeo
                </a>
              ) : (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '0.8rem', 
                  background: 'var(--gray-50)', 
                  color: 'var(--gray-500)', 
                  width: '100%', 
                  borderRadius: '12px', 
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
      <style dangerouslySetInnerHTML={{__html: `
        @media (min-width: 1024px) {
          .video-grid-3 {
             grid-template-columns: repeat(3, 1fr) !important;
          }
        }
      `}} />
    </div>
  );
}
