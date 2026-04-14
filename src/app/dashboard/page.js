"use client";

import { useEffect, useState, useRef } from "react";
import { auth, provider } from "@/lib/firebase/config";
import { signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import { getAllPosts, createPost, updatePost, deletePost } from "@/lib/firebase/posts";
import { getAllVideos, createVideo, updateVideo, deleteVideo } from "@/lib/firebase/videos";
import { uploadImage } from "@/lib/firebase/storage";
import mammoth from "mammoth";

// Carreguem dinàmicament PDF.js només al client
let pdfjsLib;
const initPdf = async () => {
  if (!pdfjsLib) {
    pdfjsLib = await import("pdfjs-dist/build/pdf");
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
  }
  return pdfjsLib;
};

export default function Dashboard() {
  const AUTHORIZED_EMAIL = "pbadialorenz@gmail.com";
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const docInputRef = useRef(null);
  
  // Estats per a la gestió d'articles
  const [view, setView] = useState('menu'); // 'menu', 'list', 'form', 'videos', 'video-form'
  const [posts, setPosts] = useState([]);
  const [currentPost, setCurrentPost] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);

  // Estats per a la gestió de vídeos
  const [videosList, setVideosList] = useState([]);
  const [currentVideo, setCurrentVideo] = useState(null);
  const [videoFormData, setVideoFormData] = useState({
    videoId: "",
    title: "",
    isFeatured: false
  });

  // Camps del formulari d'articles
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    imageUrl: ""
  });
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    initPdf(); // Inicialitzem PDF.js quan el component es carrega
    const unsub = onAuthStateChanged(auth, (usr) => {
      if (usr && usr.email !== AUTHORIZED_EMAIL) {
        signOut(auth);
        setUser(null);
        setError("Accés denegat. Aquest compte no està autoritzat.");
      } else {
        setUser(usr);
        setError(null);
        if (usr) {
          loadPosts();
          loadVideos();
        }
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const loadPosts = async () => {
    const data = await getAllPosts();
    setPosts(data);
  };

  const loadVideos = async () => {
    const data = await getAllVideos();
    setVideosList(data);
  };

  const handleLogin = async () => {
    setError(null);
    try {
      const result = await signInWithPopup(auth, provider);
      if (result.user.email !== AUTHORIZED_EMAIL) {
        await signOut(auth);
        setError("Accés denegat. Només el compte oficial pot entrar.");
      }
    } catch (err) {
      console.error(err);
      setError("S'ha produït un error al connectar amb Google.");
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setView('menu');
  };

  // --- LÒGICA ARTICLES ---
  const openForm = (post = null) => {
    if (post) {
      setCurrentPost(post);
      setFormData({
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        content: post.content,
        imageUrl: post.imageUrl
      });
    } else {
      setCurrentPost(null);
      setFormData({ title: "", slug: "", excerpt: "", content: "", imageUrl: "" });
    }
    setImageFile(null);
    setView('form');
  };

  const generateExcerpt = (text) => {
    if (!text) return "";
    const words = text.trim().split(/\s+/);
    if (words.length <= 20) return text.trim();
    return words.slice(0, 20).join(" ") + "...";
  };

  const generateSlug = (title) => {
    return title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
  };

  const handleDocumentUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsExtracting(true);
    const reader = new FileReader();

    try {
      if (file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
        reader.onload = async (event) => {
          const arrayBuffer = event.target.result;
          const result = await mammoth.extractRawText({ arrayBuffer });
          const text = result.value;
          const lines = text.split('\n').filter(l => l.trim().length > 0);
          const title = lines[0] || file.name.replace('.docx', '');
          const excerpt = generateExcerpt(text);
          setFormData({ ...formData, title, slug: generateSlug(title), content: text, excerpt });
          setIsExtracting(false);
        };
        reader.readAsArrayBuffer(file);
      } 
      else if (file.type === "application/pdf") {
        reader.onload = async (event) => {
          const typedarray = new Uint8Array(event.target.result);
          const pdf = await pdfjsLib.getDocument(typedarray).promise;
          let fullText = "";
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            fullText += textContent.items.map(item => item.str).join(" ") + "\n";
          }
          const title = fullText.split('\n')[0] || file.name.replace('.pdf', '');
          const excerpt = generateExcerpt(fullText);
          setFormData({ ...formData, title, slug: generateSlug(title), content: fullText, excerpt });
          setIsExtracting(false);
        };
        reader.readAsArrayBuffer(file);
      } else {
        alert("Només .docx o .pdf");
        setIsExtracting(false);
      }
    } catch (err) {
      alert("Error al processar document.");
      setIsExtracting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    try {
      let finalImageUrl = formData.imageUrl;
      if (imageFile) finalImageUrl = await uploadImage(imageFile);
      const postPayload = { ...formData, imageUrl: finalImageUrl, createdAt: currentPost ? currentPost.createdAt : new Date().toISOString() };
      if (currentPost) await updatePost(currentPost.id, postPayload);
      else await createPost(postPayload);
      await loadPosts();
      setView('list');
    } catch (err) {
      alert("Error al guardar l'article.");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Estàs segur?")) {
      await deletePost(id);
      await loadPosts();
    }
  };

  // --- LÒGICA VÍDEOS ---
  const openVideoForm = (video = null) => {
    if (video) {
      setCurrentVideo(video);
      setVideoFormData({
        videoId: video.videoId,
        title: video.title,
        isFeatured: video.isFeatured || false
      });
    } else {
      setCurrentVideo(null);
      setVideoFormData({ videoId: "", title: "", isFeatured: false });
    }
    setView('video-form');
  };

  const handleVideoSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    try {
      // Si marquem aquest com destacat, treurem el destacat de la resta
      if (videoFormData.isFeatured) {
        const others = videosList.filter(v => v.isFeatured && v.id !== (currentVideo?.id));
        for (const v of others) {
          await updateVideo(v.id, { isFeatured: false });
        }
      }

      if (currentVideo) {
        await updateVideo(currentVideo.id, videoFormData);
      } else {
        await createVideo(videoFormData);
      }
      await loadVideos();
      setView('videos');
    } catch (err) {
      alert("Error al guardar el vídeo.");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDeleteVideo = async (id) => {
    if (confirm("Vols esborrar aquest vídeo?")) {
      await deleteVideo(id);
      await loadVideos();
    }
  };

  if (loading) return <div className="layout-container" style={{ padding: '4rem 1rem', textAlign: 'center' }}>Carregant...</div>;

  if (!user) {
    return (
      <div className="layout-container" style={{ padding: '4rem 1rem', textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
        <div className="card">
          <h1 style={{ fontSize: '2rem', marginBottom: '1rem', color: 'var(--primary-dark)' }}>Accés Administració</h1>
          {error && <div style={{ background: '#FEE2E2', color: '#B91C1C', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1.5rem' }}>{error}</div>}
          <p style={{ marginBottom: '2rem', color: 'rgba(0,0,0,0.7)' }}>Has d&apos;iniciar sessió amb un compte autoritzat.</p>
          <button onClick={handleLogin} className="btn" style={{ background: '#DB4437' }}>Entrar amb Google</button>
        </div>
      </div>
    );
  }

  return (
    <div className="layout-container" style={{ padding: '2rem 1rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', color: 'var(--primary-dark)', cursor: 'pointer' }} onClick={() => setView('menu')}>Panell de Control</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ fontSize: '0.85rem' }}>Hola, <strong>{user.email}</strong></span>
          <button onClick={handleLogout} className="btn" style={{ background: 'transparent', border: '1px solid var(--primary-blue)', color: 'var(--primary-blue)', padding: '0.3rem 0.8rem', fontSize: '0.8rem' }}>Sortir</button>
        </div>
      </header>

      {view === 'menu' && (
        <div className="grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          <div className="card" onClick={() => openForm()} style={{ cursor: 'pointer', textAlign: 'center', padding: '3rem' }}>
            <span style={{ fontSize: '3rem' }}>📝</span>
            <h2 style={{ marginTop: '1rem' }}>Nou Article</h2>
            <p style={{ color: 'rgba(0,0,0,0.6)' }}>Crea un nou post manualment o des d&apos;un fitxer.</p>
          </div>
          <div className="card" onClick={() => setView('list')} style={{ cursor: 'pointer', textAlign: 'center', padding: '3rem' }}>
            <span style={{ fontSize: '3rem' }}>📚</span>
            <h2 style={{ marginTop: '1rem' }}>Gestionar Articles</h2>
            <p style={{ color: 'rgba(0,0,0,0.6)' }}>Edita o esborra publicacions ({posts.length}).</p>
          </div>
          <div className="card" onClick={() => setView('videos')} style={{ cursor: 'pointer', textAlign: 'center', padding: '3rem' }}>
            <span style={{ fontSize: '3rem' }}>📺</span>
            <h2 style={{ marginTop: '1rem' }}>Gestionar Vídeos</h2>
            <p style={{ color: 'rgba(0,0,0,0.6)' }}>Configura els vídeos de YouTube ({videosList.length}).</p>
          </div>
        </div>
      )}

      {/* VISTA LLISTA ARTICLES */}
      {view === 'list' && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2>Articles Publicats</h2>
            <button className="btn" onClick={() => openForm()}>+ Nou</button>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--gray-200)', textAlign: 'left' }}>
                  <th style={{ padding: '1rem' }}>Títol</th>
                  <th style={{ padding: '1rem' }}>Data</th>
                  <th style={{ padding: '1rem' }}>Accions</th>
                </tr>
              </thead>
              <tbody>
                {posts.map(post => (
                  <tr key={post.id} style={{ borderBottom: '1px solid var(--gray-100)' }}>
                    <td style={{ padding: '1rem' }}>{post.title}</td>
                    <td style={{ padding: '1rem', fontSize: '0.8rem' }}>{new Date(post.createdAt).toLocaleDateString()}</td>
                    <td style={{ padding: '1rem', display: 'flex', gap: '0.5rem' }}>
                      <button onClick={() => openForm(post)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>✏️</button>
                      <button onClick={() => handleDelete(post.id)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>🗑️</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button className="btn" style={{ background: 'var(--foreground)', marginTop: '1.5rem' }} onClick={() => setView('menu')}>Tornar</button>
        </div>
      )}

      {/* VISTA FORMULARI ARTICLE */}
      {view === 'form' && (
        <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2>{currentPost ? 'Editar Article' : 'Nou Article'}</h2>
            {!currentPost && (
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input type="file" ref={docInputRef} style={{ display: 'none' }} accept=".docx,.pdf" onChange={handleDocumentUpload} />
                <button type="button" className="btn" style={{ background: 'var(--primary-dark)', padding: '0.5rem 1rem' }} onClick={() => docInputRef.current.click()} disabled={isExtracting}>{isExtracting ? 'Processant...' : '📄 Importar Word/PDF'}</button>
              </div>
            )}
          </div>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <input type="text" placeholder="Títol del Post" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value, slug: generateSlug(e.target.value)})} required className="input" style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--gray-300)' }} />
            <textarea placeholder="Resum (20 paraules)" value={formData.excerpt} onChange={e => setFormData({...formData, excerpt: e.target.value})} required style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--gray-300)', minHeight: '80px' }} />
            <div>
              <label style={{ fontSize: '0.85rem', marginBottom: '0.5rem', display: 'block' }}>Imatge de portada:</label>
              <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files[0])} />
            </div>
            <textarea placeholder="Contingut en Markdown..." value={formData.content} onChange={e => setFormData({...formData, content: e.target.value, excerpt: generateExcerpt(e.target.value)})} required style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--gray-300)', minHeight: '300px', fontFamily: 'monospace' }} />
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button type="submit" className="btn" disabled={submitLoading} style={{ flex: 1 }}>{submitLoading ? 'Sincronitzant...' : 'Publicar'}</button>
              <button type="button" className="btn" onClick={() => setView('list')} style={{ background: 'var(--gray-200)', color: 'black' }}>Cancel·lar</button>
            </div>
          </form>
        </div>
      )}

      {/* VISTA LLISTA VÍDEOS */}
      {view === 'videos' && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2>Vídeos de YouTube</h2>
            <button className="btn" onClick={() => openVideoForm()}>+ Afegir Vídeo</button>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--gray-200)', textAlign: 'left' }}>
                  <th style={{ padding: '1rem' }}>Títol</th>
                  <th style={{ padding: '1rem' }}>Destacat?</th>
                  <th style={{ padding: '1rem' }}>Accions</th>
                </tr>
              </thead>
              <tbody>
                {videosList.map(v => (
                  <tr key={v.id} style={{ borderBottom: '1px solid var(--gray-100)' }}>
                    <td style={{ padding: '1rem' }}>{v.title}</td>
                    <td style={{ padding: '1rem' }}>{v.isFeatured ? '✅ Sí' : 'No'}</td>
                    <td style={{ padding: '1rem', display: 'flex', gap: '0.5rem' }}>
                      <button onClick={() => openVideoForm(v)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>✏️</button>
                      <button onClick={() => handleDeleteVideo(v.id)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>🗑️</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button className="btn" style={{ background: 'var(--foreground)', marginTop: '1.5rem' }} onClick={() => setView('menu')}>Tornar</button>
        </div>
      )}

      {/* VISTA FORMULARI VÍDEO */}
      {view === 'video-form' && (
        <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h2>{currentVideo ? 'Editar Vídeo' : 'Afegir Vídeo'}</h2>
          <form onSubmit={handleVideoSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '1.5rem' }}>
            <div>
              <label style={{ fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>ID del vídeo (ex: s4ycv5hkAPk):</label>
              <input type="text" value={videoFormData.videoId} onChange={e => setVideoFormData({...videoFormData, videoId: e.target.value})} required style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--gray-300)' }} />
            </div>
            <div>
              <label style={{ fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>Títol del vídeo:</label>
              <input type="text" value={videoFormData.title} onChange={e => setVideoFormData({...videoFormData, title: e.target.value})} required style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--gray-300)' }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input type="checkbox" id="isFeatured" checked={videoFormData.isFeatured} onChange={e => setVideoFormData({...videoFormData, isFeatured: e.target.checked})} />
              <label htmlFor="isFeatured">Vídeo Destacat (apareixerà al Home)</label>
            </div>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <button type="submit" className="btn" disabled={submitLoading} style={{ flex: 1 }}>{submitLoading ? 'Guardant...' : 'Desar'}</button>
              <button type="button" className="btn" style={{ background: 'var(--gray-200)', color: 'black' }} onClick={() => setView('videos')}>Cancel·lar</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
  </div>
      )}
    </div>
  );
}
