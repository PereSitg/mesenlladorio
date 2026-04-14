import Link from "next/link";
import { getAllVideos } from "@/lib/firebase/videos";
import YouTubePlayer from "@/components/YouTubePlayer";

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

  const displayVideos = videos.length > 0 ? videos : defaultVideos;

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

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '2.5rem' }}>
        {displayVideos.map(video => (
          <div key={video.id || video.videoId} className="card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', borderRadius: '16px' }}>
            <YouTubePlayer 
              videoId={video.videoId} 
              title={video.title} 
              isFeatured={false}
              customThumbnailUrl={video.customThumbnailUrl}
            />
            <div style={{ padding: '1.5rem', background: 'white' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.2rem', lineHeight: 1.4 }}>{video.title}</h3>
              <a 
                href={`https://youtube.com/watch?v=${video.videoId}`} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="btn" 
                style={{ textAlign: 'center', background: '#f1f1f1', color: 'var(--primary-dark)', width: '100%', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600 }}
              >
                Veure a YouTube
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
