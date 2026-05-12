"use client";

import { useState } from "react";
import { getYouTubeId } from "@/lib/youtube";

export default function YouTubePlayer({ videoId: rawVideoId, title, isFeatured = false, customThumbnailUrl = null }) {
  const [isPlaying, setIsPlaying] = useState(false);
  
  const videoId = getYouTubeId(rawVideoId);

  // Si no hi ha videoId, és un anunci (només foto)
  const isAnnouncement = !videoId;

  // Si tenim una miniatura personalitzada, la fem servir. 
  // Si no, fem servir la de YouTube per defecte
  const thumbnailUrl = customThumbnailUrl || (videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=1200&q=80");
  const embedUrl = videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0` : "";

  if (isPlaying && videoId) {
    return (
      <div style={{ 
        position: 'relative', 
        paddingBottom: '56.25%', 
        height: 0, 
        overflow: 'hidden', 
        borderRadius: isFeatured ? '24px' : '16px', 
        boxShadow: '0 20px 40px rgba(0,0,0,0.15)', 
        background: '#000' 
      }}>
        <iframe 
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
          src={embedUrl}
          title={title}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
          allowFullScreen>
        </iframe>
      </div>
    );
  }

  return (
    <div 
      onClick={() => !isAnnouncement && setIsPlaying(true)}
      style={{ 
        position: 'relative', 
        width: '100%', 
        aspectRatio: '16/9', 
        overflow: 'hidden', 
        borderRadius: isFeatured ? '24px' : '16px', 
        cursor: isAnnouncement ? 'default' : 'pointer',
        boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
        background: 'var(--gray-200)'
      }}
      className="yt-player-container"
    >
      <img 
        src={thumbnailUrl} 
        alt={title} 
        style={{ 
          objectFit: 'cover', 
          width: '100%', 
          height: '100%', 
          transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)' 
        }} 
        className="zoom-on-hover" 
        onError={(e) => {
          if (videoId) e.target.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
        }}
      />
      
      {/* Play Button Overlay - NOMÉS SI NO ÉS ANUNCI */}
      {!isAnnouncement && (
        <div style={{ 
          position: 'absolute', 
          top: '50%', 
          left: '50%', 
          transform: 'translate(-50%, -50%)', 
          background: 'rgba(255,0,0,0.9)', 
          borderRadius: '50%', 
          width: isFeatured ? '80px' : '60px', 
          height: isFeatured ? '80px' : '60px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          opacity: 0.9,
          transition: 'all 0.3s ease',
          boxShadow: '0 10px 20px rgba(255,0,0,0.3)'
        }} className="play-btn">
           <svg style={{ width: isFeatured ? 40 : 30, height: isFeatured ? 40 : 30, fill: 'white', marginLeft: '4px' }} viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
        </div>
      )}

      {/* Info Overlay */}
      <div style={{ 
        position: 'absolute', 
        bottom: 0, 
        left: 0, 
        right: 0, 
        padding: isFeatured ? '1.5rem' : '1rem', 
        background: 'linear-gradient(to top, rgba(0,0,0,0.85), transparent)',
        color: 'white'
      }}>
        <p style={{ margin: 0, fontSize: isFeatured ? '0.8rem' : '0.7rem', opacity: 0.8, textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 600 }}>
          {isAnnouncement ? 'Pròxim Vídeo' : `Vídeo ${isFeatured ? 'Destacat' : ''}`}
        </p>
        <h3 style={{ margin: '0.2rem 0 0', fontSize: isFeatured ? '1.3rem' : '1rem', fontWeight: 700, lineHeight: 1.2 }}>{title}</h3>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .yt-player-container:hover .zoom-on-hover {
           transform: ${isAnnouncement ? 'none' : 'scale(1.05)'};
        }
        .yt-player-container:hover .play-btn {
           transform: translate(-50%, -50%) scale(1.15);
           background: #FF0000;
        }
      `}} />
    </div>
  );
}
