"use client";

import { useEffect, useState, useRef } from "react";
import { auth, provider } from "@/lib/firebase/config";
import { signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import { getAllPosts, createPost, updatePost, deletePost } from "@/lib/firebase/posts";
import { getAllVideos, createVideo, updateVideo, deleteVideo } from "@/lib/firebase/videos";
import { getAllPages, createPage, updatePage, deletePage } from "@/lib/firebase/pages";
import { uploadToCloudinary } from "@/lib/cloudinary";
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
  const [articleImageFile, setArticleImageFile] = useState(null);
  const [uploadingArticle, setUploadingArticle] = useState(false);

  // Vídeos
  const [videosList, setVideosList] = useState([]);
  const [currentVideo, setCurrentVideo] = useState(null);
  const [videoFormData, setVideoFormData] = useState({
    videoId: "",
    title: "",
    customThumbnailUrl: "",
    isFeatured: false,
    showOnHome: false
  });
  const [videoImageFile, setVideoImageFile] = useState(null);
  const [uploadingVideo, setUploadingVideo] = useState(false);

  // Pàgines
  const [pagesList, setPagesList] = useState([]);
  const [currentPage, setCurrentPage] = useState(null);
  const [pageFormData, setPageFormData] = useState({
    title: "",
    slug: "",
    content: "",
    imageUrl: "",
    isIndexed: true
  });
  const [pageImageFile, setPageImageFile] = useState(null);
  const [uploadingPage, setUploadingPage] = useState(false);

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

  const withTimeout = (promise, ms = 20000) => {
    const timeout = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Temps d'espera esgotat (20s). El servidor no respon.")), ms)
    );
    return Promise.race([promise, timeout]);
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
    setArticleImageFile(null);
    setView('form');
  };

  const handleArticleImageUpload = async () => {
    if (!articleImageFile) return;
    setUploadingArticle(true);
    try {
      const url = await withTimeout(uploadToCloudinary(articleImageFile));
      if (url) {
        setFormData(prev => ({ ...prev, imageUrl: url }));
        setArticleImageFile(null);
        alert("Imatge pujada a Cloudinary! 📷");
      }
    } catch (err) { alert(err.message || "Error al pujar la imatge."); }
    finally { setUploadingArticle(false); }
  };

  const handleDocUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsExtracting(true);
    try {
      if (file.type === "application/pdf") {
        const pdf = await pdfjsLib.getDocument(await file.arrayBuffer()).promise;
        let text = "";
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          text += content.items.map(item => item.str).join(" ") + "\n";
        }
        const titleMatch = text.trim().split("\n")[0];
        setFormData(prev => ({ ...prev, content: text, title: prev.title || titleMatch || "" }));
      } else {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        const text = result.value;
        const titleMatch = text.trim().split("\n")[0];
        setFormData(prev => ({ ...prev, content: text, title: prev.title || titleMatch || "" }));
      }
      setView('form'); // Obrim el formulari automàticament amb el contingut extret
    } catch (err) { 
      console.error(err);
      alert("Error al llegir el document."); 
    }
    finally { setIsExtracting(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitLoading) return;
    setSubmitLoading(true);
    try {
      const postPayload = { 
        ...formData, 
        createdAt: currentPost ? currentPost.createdAt : new Date().toISOString() 
      };
      const process = async () => {
        if (currentPost) await updatePost(currentPost.id, postPayload);
        else await createPost(postPayload);
        await loadPosts();
      };
      await withTimeout(process());
      setView('list');
      alert("Article guardat correctament! ✨");
    } catch (err) { alert(err.message || "Error al guardar l'article."); }
    finally { setSubmitLoading(false); }
  };

  const handleDelete = async (id) => {
    if (confirm("Estàs segur?")) { await deletePost(id); loadPosts(); }
  };

  // --- VÍDEOS ---
  const openVideoForm = (video = null) => {
    if (video) {
      setCurrentVideo(video);
      setVideoFormData({ 
        videoId: video.videoId || "", 
        title: video.title, 
        customThumbnailUrl: video.customThumbnailUrl || "",
        isFeatured: video.isFeatured || false,
        showOnHome: video.showOnHome || false
      });
    } else {
      setCurrentVideo(null);
      setVideoFormData({ videoId: "", title: "", customThumbnailUrl: "", isFeatured: false, showOnHome: false });
    }
    setVideoImageFile(null);
    setView('video-form');
  };

  const handleVideoImageUpload = async () => {
    if (!videoImageFile) return;
    setUploadingVideo(true);
    try {
      const url = await withTimeout(uploadToCloudinary(videoImageFile));
      if (url) {
        setVideoFormData(prev => ({ ...prev, customThumbnailUrl: url }));
        setVideoImageFile(null);
        alert("Imatge pujada a Cloudinary! 📷");
      }
    } catch (err) { alert(err.message || "Error al pujar la imatge."); }
    finally { setUploadingVideo(false); }
  };

  const handleVideoSubmit = async (e) => {
    e.preventDefault();
    if (submitLoading) return;
    setSubmitLoading(true);
    try {
      const payload = { 
        videoId: videoFormData.videoId ? videoFormData.videoId.trim() : "", 
        title: videoFormData.title ? videoFormData.title.trim() : "", 
        customThumbnailUrl: videoFormData.customThumbnailUrl ? videoFormData.customThumbnailUrl.trim() : "",
        isFeatured: !!videoFormData.isFeatured,
        showOnHome: !!videoFormData.showOnHome
      };

      const process = async () => {
        if (payload.isFeatured) {
          const others = videosList.filter(v => v.isFeatured && v.id !== currentVideo?.id);
          await Promise.all(others.map(v => updateVideo(v.id, { isFeatured: false })));
        }
        if (currentVideo) await updateVideo(currentVideo.id, payload);
        else await createVideo(payload);
        await loadVideos();
      };

      await withTimeout(process());
      setView('videos');
      alert("Vídeo/Anunci guardat correctament! ✨");
    } catch (err) { alert(err.message || "Error al guardar el vídeo."); }
    finally { setSubmitLoading(false); }
  };

  const handleDeleteVideo = async (id) => {
    if (confirm("Vols esborrar aquest vídeo?")) {
      await deleteVideo(id);
      await loadVideos();
    }
  };

  // --- PÀGINES ---
  const openPageForm = (page = null) => {
    if (page) {
      setCurrentPage(page);
      setPageFormData({
        title: page.title,
        slug: page.slug,
        content: page.content,
        imageUrl: page.imageUrl || "",
        isIndexed: page.isIndexed !== undefined ? page.isIndexed : true
      });
    } else {
      setCurrentPage(null);
      setPageFormData({ title: "", slug: "", content: "", imageUrl: "", isIndexed: true });
    }
    setPageImageFile(null);
    setView('page-form');
  };

  const handlePageImageUpload = async () => {
    if (!pageImageFile) return;
    setUploadingPage(true);
    try {
      const url = await withTimeout(uploadToCloudinary(pageImageFile));
      if (url) {
        setPageFormData(prev => ({ ...prev, imageUrl: url }));
        setPageImageFile(null);
        alert("Imatge pujada a Cloudinary! 📷");
      }
    } catch (err) { alert(err.message || "Error al pujar la imatge."); }
    finally { setUploadingPage(false); }
  };

  const handlePageSubmit = async (e) => {
    e.preventDefault();
    if (submitLoading) return;
    setSubmitLoading(true);
    try {
      const process = async () => {
        if (currentPage) await updatePage(currentPage.id, pageFormData);
        else await createPage(pageFormData);
        await loadPages();
      };
      await withTimeout(process());
      setView('pages');
      alert("Pàgina guardada correctament! ✨");
    } catch (err) { alert(err.message || "Error al guardar la pàgina."); }
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2>Articles Publicats</h2>
            <div style={{ padding: '1rem', background: 'var(--primary-light)', borderRadius: '12px', border: '1px solid var(--primary-blue)' }}>
               <label style={{ fontWeight: 700, display: 'block', marginBottom: '0.4rem', fontSize: '0.9rem' }}>📂 Importar des de PDF/DOC:</label>
               <input type="file" accept=".pdf,.doc,.docx" onChange={handleDocUpload} style={{ fontSize: '0.8rem' }} />
               {isExtracting && <p style={{ color: 'var(--primary-blue)', fontSize: '0.75rem', marginTop: '0.3rem' }}>Llegint dades...</p>}
            </div>
          </div>
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
          <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '2px solid var(--primary-blue)', paddingBottom: '0.5rem' }}>
             <h2 style={{ margin: 0 }}>{currentPost ? 'Editar Article' : 'Nou Article'}</h2>
             <span style={{ fontSize: '0.9rem', color: 'var(--gray-500)' }}>Detalls i Contingut</span>
          </header>

          {/* IMPORTACIÓ DE DOCUMENTS - RESTAURAT PER A L'USUARI */}
          <div style={{ padding: '1.2rem', background: 'var(--primary-light)', borderRadius: '12px', border: '1px solid var(--primary-blue)', marginBottom: '1.5rem' }}>
             <label style={{ fontWeight: 700, display: 'block', marginBottom: '0.6rem', fontSize: '1rem', color: 'var(--primary-dark)' }}>
                📂 Importar Contingut (Word o PDF):
             </label>
             <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <input type="file" accept=".pdf,.doc,.docx" onChange={handleDocUpload} style={{ fontSize: '0.9rem', flex: 1 }} />
                {isExtracting && <p style={{ color: 'var(--primary-blue)', fontSize: '0.8rem', fontWeight: 600 }}>⌛ Llegint document...</p>}
             </div>
             <p style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginTop: '0.5rem' }}>Això omplirà automàticament el títol i el cos de l'article.</p>
          </div>
          
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <input type="text" placeholder="Títol" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value, slug: generateSlug(e.target.value)})} required style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--gray-300)' }} />
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', padding: '1rem', background: '#f1f5f9', borderRadius: '8px' }}>
              <label style={{ fontWeight: 600 }}>📷 Pujar Foto a Cloudinary:</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input type="file" accept="image/*" onChange={e => setArticleImageFile(e.target.files[0])} style={{ flex: 1 }} />
                <button type="button" onClick={handleArticleImageUpload} className="btn" disabled={!articleImageFile || uploadingArticle} style={{ padding: '0.5rem 1rem', background: '#3b82f6', fontSize: '0.9rem' }}>
                  {uploadingArticle ? 'Pujant...' : 'Pujar'}
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              <label style={{ fontWeight: 600 }}>🔗 URL de la Imatge (s'omple sola en pujar):</label>
              <input type="text" placeholder="https://..." value={formData.imageUrl} onChange={e => setFormData({...formData, imageUrl: e.target.value})} style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--gray-300)' }} />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input type="checkbox" id="isIndexedPost" checked={formData.isIndexed} onChange={e => setFormData({...formData, isIndexed: e.target.checked})} />
              <label htmlFor="isIndexedPost">Indexar a Google</label>
            </div>
            <textarea placeholder="Resum" value={formData.excerpt} onChange={e => setFormData({...formData, excerpt: e.target.value})} style={{ padding: '0.8rem', minHeight: '80px', borderRadius: '8px' }} />
            
            <textarea placeholder="Contingut (Markdown)" value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} required style={{ padding: '0.8rem', minHeight: '300px', borderRadius: '8px' }} />
            
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button type="submit" className="btn" disabled={submitLoading} style={{ flex: 1 }}>
                {submitLoading ? 'S' + 'incronitzant...' : 'Desar finalment'}
              </button>
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
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', padding: '1rem', background: '#f1f5f9', borderRadius: '8px' }}>
              <label style={{ fontWeight: 600 }}>📷 Pujar Foto a Cloudinary:</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input type="file" accept="image/*" onChange={e => setPageImageFile(e.target.files[0])} style={{ flex: 1 }} />
                <button type="button" onClick={handlePageImageUpload} className="btn" disabled={!pageImageFile || uploadingPage} style={{ padding: '0.5rem 1rem', background: '#3b82f6', fontSize: '0.9rem' }}>
                  {uploadingPage ? 'Pujant...' : 'Pujar'}
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              <label style={{ fontWeight: 600 }}>🔗 URL de la Imatge:</label>
              <input type="text" placeholder="https://..." value={pageFormData.imageUrl} onChange={e => setPageFormData({...pageFormData, imageUrl: e.target.value})} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--gray-300)' }} />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input type="checkbox" id="isIndexedPage" checked={pageFormData.isIndexed} onChange={e => setPageFormData({...pageFormData, isIndexed: e.target.checked})} />
              <label htmlFor="isIndexedPage">Indexar a Google</label>
            </div>
            <textarea placeholder="Contingut (Markdown)" value={pageFormData.content} onChange={e => setPageFormData({...pageFormData, content: e.target.value})} required style={{ padding: '0.8rem', minHeight: '400px' }} />
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button type="submit" className="btn" disabled={submitLoading} style={{ flex: 1 }}>
                {submitLoading ? 'Sincronitzant...' : 'Desar Pàgina'}
              </button>
              <button type="button" className="btn" onClick={() => setView('pages')} style={{ background: 'var(--gray-200)', color: 'black' }}>Cancel·lar</button>
            </div>
          </form>
        </div>
      )}

      {/* VIDEOS LIST */}
      {view === 'videos' && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2>Vídeos</h2>
            <button className="btn" onClick={() => openVideoForm()}>+ Afegir Vídeo</button>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
            <tbody>
              {videosList.map(v => (
                <tr key={v.id} style={{ borderBottom: '1px solid var(--gray-100)' }}>
                  <td style={{ padding: '0.8rem' }}>
                    {v.title}
                    {v.customThumbnailUrl && <span style={{fontSize: '0.7rem', color: 'var(--primary-blue)', marginLeft: '10px'}}>(Amb foto pròpia)</span>}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button onClick={() => openVideoForm(v)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>✏️</button>
                    <button onClick={() => handleDeleteVideo(v.id)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>🗑️</button>
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
          <h2>{currentVideo ? 'Editar Vídeo/Anunci' : 'Nou Vídeo/Anunci'}</h2>
          <form onSubmit={handleVideoSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', marginTop: '1.5rem' }}>
            <div>
              <label style={{fontWeight: 600, display: 'block', marginBottom: '0.5rem'}}>ID de YouTube (deixa-ho buit si és només un anunci):</label>
              <input type="text" value={videoFormData.videoId} onChange={e => setVideoFormData({...videoFormData, videoId: e.target.value})} placeholder="Ex: s4ycv5hkAPk" style={{width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--gray-300)'}} />
            </div>
            <div>
              <label style={{fontWeight: 600, display: 'block', marginBottom: '0.5rem'}}>Títol:</label>
              <input type="text" value={videoFormData.title} onChange={e => setVideoFormData({...videoFormData, title: e.target.value})} required style={{width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--gray-300)'}} />
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', padding: '1rem', background: '#f1f5f9', borderRadius: '8px' }}>
              <label style={{ fontWeight: 600 }}>📷 Pujar Foto a Cloudinary:</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input type="file" accept="image/*" onChange={e => setVideoImageFile(e.target.files[0])} style={{ flex: 1 }} />
                <button type="button" onClick={handleVideoImageUpload} className="btn" disabled={!videoImageFile || uploadingVideo} style={{ padding: '0.5rem 1rem', background: '#3b82f6', fontSize: '0.9rem' }}>
                  {uploadingVideo ? 'Pujant...' : 'Pujar'}
                </button>
              </div>
            </div>

            <div>
              <label style={{fontWeight: 600, display: 'block', marginBottom: '0.5rem'}}>🔗 URL de la Foto (s'omple sola en pujar):</label>
              <input type="text" value={videoFormData.customThumbnailUrl} onChange={e => setVideoFormData({...videoFormData, customThumbnailUrl: e.target.value})} placeholder="https://..." style={{width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--gray-300)'}} />
            </div>
            <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input type="checkbox" id="vFeatured" checked={videoFormData.isFeatured} onChange={e => setVideoFormData({...videoFormData, isFeatured: e.target.checked})} />
                <label htmlFor="vFeatured">Vídeo Destacat (Principal)</label>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input type="checkbox" id="vHome" checked={videoFormData.showOnHome} onChange={e => setVideoFormData({...videoFormData, showOnHome: e.target.checked})} />
                <label htmlFor="vHome">Mostrar al Home</label>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <button type="submit" className="btn" disabled={submitLoading} style={{ flex: 1 }}>{submitLoading ? 'Sincronitzant...' : 'Desar'}</button>
              <button type="button" className="btn" onClick={() => setView('videos')} style={{ background: 'var(--gray-200)', color: 'black' }}>Cancel·lar</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
