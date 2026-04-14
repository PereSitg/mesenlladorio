"use client";

import { useEffect, useState, useRef } from "react";
import { auth, provider } from "@/lib/firebase/config";
import { signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import { getAllPosts, createPost, updatePost, deletePost } from "@/lib/firebase/posts";
import { getAllVideos, createVideo, updateVideo, deleteVideo } from "@/lib/firebase/videos";
import { getAllPages, createPage, updatePage, deletePage } from "@/lib/firebase/pages";
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
  
  // Vistes: 'menu', 'list', 'form', 'videos', 'video-form', 'pages', 'page-form'
  const [view, setView] = useState('menu'); 
  
  // Articles
  const [posts, setPosts] = useState([]);
  const [currentPost, setCurrentPost] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    imageUrl: "",
    isIndexed: true
  });
  const [imageFile, setImageFile] = useState(null);

  // Vídeos
  const [videosList, setVideosList] = useState([]);
  const [currentVideo, setCurrentVideo] = useState(null);
  const [videoFormData, setVideoFormData] = useState({
    videoId: "",
    title: "",
    isFeatured: false
  });

  // Pàgines
  const [pagesList, setPagesList] = useState([]);
  const [currentPage, setCurrentPage] = useState(null);
  const [pageFormData, setPageFormData] = useState({
    title: "",
    slug: "",
    content: "",
    isIndexed: true
  });

  useEffect(() => {
    initPdf();
    const unsub = onAuthStateChanged(auth, (usr) => {
      if (usr && usr.email !== AUTHORIZED_EMAIL) {
        signOut(auth);
        setUser(null);
        setError("Accés denegat.");
      } else {
        setUser(usr);
        setError(null);
        if (usr) {
          loadPosts();
          loadVideos();
          loadPages();
        }
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const loadPosts = async () => { setPosts(await getAllPosts()); };
  const loadVideos = async () => { setVideosList(await getAllVideos()); };
  const loadPages = async () => { setPagesList(await getAllPages()); };

  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      if (result.user.email !== AUTHORIZED_EMAIL) await signOut(auth);
    } catch (err) { console.error(err); }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setView('menu');
  };

  const generateSlug = (title) => {
    return title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
  };

  // --- ARTICLES ---
  const openForm = (post = null) => {
    if (post) {
      setCurrentPost(post);
      setFormData({
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        content: post.content,
        imageUrl: post.imageUrl,
        isIndexed: post.isIndexed !== undefined ? post.isIndexed : true
      });
    } else {
      setCurrentPost(null);
      setFormData({ title: "", slug: "", excerpt: "", content: "", imageUrl: "", isIndexed: true });
    }
    setImageFile(null);
    setView('form');
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
    } catch (err) { alert("Error al guardar l'article."); }
    finally { setSubmitLoading(false); }
  };

  const handleDelete = async (id) => {
    if (confirm("Estàs segur?")) { await deletePost(id); loadPosts(); }
  };

  // --- VÍDEOS ---
  const openVideoForm = (video = null) => {
    if (video) {
      setCurrentVideo(video);
      setVideoFormData({ videoId: video.videoId, title: video.title, isFeatured: video.isFeatured || false });
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
      if (videoFormData.isFeatured) {
        const others = videosList.filter(v => v.isFeatured && v.id !== (currentVideo?.id));
        for (const v of others) await updateVideo(v.id, { isFeatured: false });
      }
      if (currentVideo) await updateVideo(currentVideo.id, videoFormData);
      else await createVideo(videoFormData);
      await loadVideos();
      setView('videos');
    } catch (err) { alert("Error al guardar vídeo."); }
    finally { setSubmitLoading(false); }
  };

  // --- PÀGINES ---
  const openPageForm = (page = null) => {
    if (page) {
      setCurrentPage(page);
      setPageFormData({
        title: page.title,
        slug: page.slug,
        content: page.content,
        isIndexed: page.isIndexed !== undefined ? page.isIndexed : true
      });
    } else {
      setCurrentPage(null);
      setPageFormData({ title: "", slug: "", content: "", isIndexed: true });
    }
    setView('page-form');
  };

  const handlePageSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    try {
      if (currentPage) await updatePage(currentPage.id, pageFormData);
      else await createPage(pageFormData);
      await loadPages();
      setView('pages');
    } catch (err) { alert("Error al guardar pàgina."); }
    finally { setSubmitLoading(false); }
  };

  const handleDeletePage = async (id) => {
    if (confirm("Vols esborrar aquesta pàgina?")) { await deletePage(id); loadPages(); }
  };

  if (loading) return <div className="layout-container" style={{ padding: '4rem 1rem', textAlign: 'center' }}>Carregant...</div>;

  if (!user) {
    return (
      <div className="layout-container" style={{ padding: '4rem 1rem', textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
        <div className="card">
          <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Administració</h1>
          <button onClick={handleLogin} className="btn" style={{ background: '#DB4437' }}>Entrar amb Google</button>
        </div>
      </div>
    );
  }

  return (
    <div className="layout-container" style={{ padding: '2rem 1rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', color: 'var(--primary-dark)', cursor: 'pointer' }} onClick={() => setView('menu')}>Panell de Control</h1>
        <button onClick={handleLogout} className="btn" style={{ background: 'transparent', border: '1px solid var(--primary-blue)', color: 'var(--primary-blue)', padding: '0.3rem 0.8rem', fontSize: '0.8rem' }}>Sortir</button>
      </header>

      {view === 'menu' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
          <div className="card" onClick={() => openForm()} style={{ cursor: 'pointer', textAlign: 'center' }}>
            <span style={{ fontSize: '2.5rem' }}>📝</span>
            <h3>Nou Article</h3>
          </div>
          <div className="card" onClick={() => setView('list')} style={{ cursor: 'pointer', textAlign: 'center' }}>
            <span style={{ fontSize: '2.5rem' }}>📚</span>
            <h3>Articles ({posts.length})</h3>
          </div>
          <div className="card" onClick={() => openPageForm()} style={{ cursor: 'pointer', textAlign: 'center' }}>
            <span style={{ fontSize: '2.5rem' }}>📄</span>
            <h3>Nova Pàgina</h3>
          </div>
          <div className="card" onClick={() => setView('pages')} style={{ cursor: 'pointer', textAlign: 'center' }}>
            <span style={{ fontSize: '2.5rem' }}>🗂️</span>
            <h3>Pàgines ({pagesList.length})</h3>
          </div>
          <div className="card" onClick={() => setView('videos')} style={{ cursor: 'pointer', textAlign: 'center' }}>
            <span style={{ fontSize: '2.5rem' }}>📺</span>
            <h3>Vídeos ({videosList.length})</h3>
          </div>
        </div>
      )}

      {/* ARTICLES LIST */}
      {view === 'list' && (
        <div className="card">
          <h2>Articles Publicats</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
            <tbody>
              {posts.map(post => (
                <tr key={post.id} style={{ borderBottom: '1px solid var(--gray-100)' }}>
                  <td style={{ padding: '0.8rem' }}>{post.title} {post.isIndexed === false && <span style={{fontSize: '0.7rem', color: 'red'} }>(No Indexat)</span>}</td>
                  <td style={{ textAlign: 'right' }}>
                    <button onClick={() => openForm(post)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>✏️</button>
                    <button onClick={() => handleDelete(post.id)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>🗑️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button className="btn" style={{ marginTop: '1rem' }} onClick={() => setView('menu')}>Tornar</button>
        </div>
      )}

      {/* ARTICLE FORM */}
      {view === 'form' && (
        <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2>{currentPost ? 'Editar Article' : 'Nou Article'}</h2>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', marginTop: '1.5rem' }}>
            <input type="text" placeholder="Títol" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value, slug: generateSlug(e.target.value)})} required style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--gray-300)' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input type="checkbox" id="isIndexedPost" checked={formData.isIndexed} onChange={e => setFormData({...formData, isIndexed: e.target.checked})} />
              <label htmlFor="isIndexedPost">Indexar a Google</label>
            </div>
            <textarea placeholder="Resum" value={formData.excerpt} onChange={e => setFormData({...formData, excerpt: e.target.value})} style={{ padding: '0.8rem', minHeight: '80px' }} />
            <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files[0])} />
            <textarea placeholder="Contingut (Markdown)" value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} required style={{ padding: '0.8rem', minHeight: '300px' }} />
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button type="submit" className="btn" style={{ flex: 1 }}>Desar</button>
              <button type="button" className="btn" onClick={() => setView('list')} style={{ background: 'var(--gray-200)', color: 'black' }}>Cancel·lar</button>
            </div>
          </form>
        </div>
      )}

      {/* PAGES LIST */}
      {view === 'pages' && (
        <div className="card">
          <h2>Pàgines Independents</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
            <tbody>
              {pagesList.map(p => (
                <tr key={p.id} style={{ borderBottom: '1px solid var(--gray-100)' }}>
                  <td style={{ padding: '0.8rem' }}>{p.title} {p.isIndexed === false && <span style={{fontSize: '0.7rem', color: 'red'} }>(No Indexat)</span>}</td>
                  <td style={{ textAlign: 'right' }}>
                    <button onClick={() => openPageForm(p)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>✏️</button>
                    <button onClick={() => handleDeletePage(p.id)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>🗑️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button className="btn" style={{ marginTop: '1rem' }} onClick={() => setView('menu')}>Tornar</button>
        </div>
      )}

      {/* PAGE FORM */}
      {view === 'page-form' && (
        <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2>{currentPage ? 'Editar Pàgina' : 'Nova Pàgina'}</h2>
          <form onSubmit={handlePageSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', marginTop: '1.5rem' }}>
            <input type="text" placeholder="Títol de la Pàgina" value={pageFormData.title} onChange={e => setPageFormData({...pageFormData, title: e.target.value, slug: generateSlug(e.target.value)})} required style={{ padding: '0.8rem', borderRadius: '8px' }} />
            <input type="text" placeholder="URL-slug" value={pageFormData.slug} onChange={e => setPageFormData({...pageFormData, slug: e.target.value})} required style={{ padding: '0.8rem' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input type="checkbox" id="isIndexedPage" checked={pageFormData.isIndexed} onChange={e => setPageFormData({...pageFormData, isIndexed: e.target.checked})} />
              <label htmlFor="isIndexedPage">Indexar a Google</label>
            </div>
            <textarea placeholder="Contingut (Markdown)" value={pageFormData.content} onChange={e => setPageFormData({...pageFormData, content: e.target.value})} required style={{ padding: '0.8rem', minHeight: '400px' }} />
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button type="submit" className="btn" style={{ flex: 1 }}>Desar Pàgina</button>
              <button type="button" className="btn" onClick={() => setView('pages')} style={{ background: 'var(--gray-200)', color: 'black' }}>Cancel·lar</button>
            </div>
          </form>
        </div>
      )}

      {/* VIDEOS LIST */}
      {view === 'videos' && (
        <div className="card">
          <h2>Vídeos</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>
              {videosList.map(v => (
                <tr key={v.id} style={{ borderBottom: '1px solid var(--gray-100)' }}>
                  <td style={{ padding: '0.8rem' }}>{v.title}</td>
                  <td style={{ textAlign: 'right' }}>
                    <button onClick={() => openVideoForm(v)} style={{ background: 'none' }}>✏️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button className="btn" style={{ marginTop: '1rem' }} onClick={() => setView('menu')}>Tornar</button>
        </div>
      )}

      {/* VIDEO FORM */}
      {view === 'video-form' && (
        <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h2>Editar Vídeo</h2>
          <form onSubmit={handleVideoSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', marginTop: '1.5rem' }}>
            <input type="text" value={videoFormData.videoId} onChange={e => setVideoFormData({...videoFormData, videoId: e.target.value})} />
            <input type="text" value={videoFormData.title} onChange={e => setVideoFormData({...videoFormData, title: e.target.value})} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input type="checkbox" checked={videoFormData.isFeatured} onChange={e => setVideoFormData({...videoFormData, isFeatured: e.target.checked})} />
              <label>Vídeo Destacat</label>
            </div>
            <button type="submit" className="btn">Desar</button>
          </form>
        </div>
      )}
    </div>
  );
}
