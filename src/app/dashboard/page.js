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
    imageTitle: "",
    imageAlt: "",
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
    showOnHome: false,
    statusText: ""
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
  
  // Diagnòstic de connexió
  const [diagStatus, setDiagStatus] = useState(null); // { firebase: 'pending' | 'ok' | 'err', cloudinary: 'pending' | 'ok' | 'err', msg: string }
  const [isCheckingDiag, setIsCheckingDiag] = useState(false);

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

  const withTimeout = (promise, ms = 20000, actionName = "operació") => {
    const timeout = new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`❌ Temps d'espera esgotat (20s) per a: ${actionName}. Revisa si has redesplegat a Vercel.`)), ms)
    );
    return Promise.race([promise, timeout]);
  };

  const testConnection = async () => {
    setIsCheckingDiag(true);
    setDiagStatus({ firebase: 'pending', cloudinary: 'pending', msg: 'Verificant serveis...' });
    
    let fbRes = 'pending';
    let clRes = 'pending';
    let errorMsg = '';

    // Test Firebase Directe (sense passar per loadPosts)
    try {
      const { getDoc, doc } = await import("firebase/firestore");
      // Intentem llegir un doc que no existeixi, només per veure si Firebase respon
      await withTimeout(getDoc(doc(db, "posts", "ping_test")), 8000, "prova de xarxa Firebase");
      fbRes = 'ok';
    } catch (e) {
      if (e.code === 'permission-denied') fbRes = 'ok'; // Si respon permission-denied, és que HI HA CONNEXIÓ
      else {
        fbRes = 'err';
        errorMsg += `Firebase: ${e.code || e.message}. `;
      }
    }

    // Test Cloudinary
    try {
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || '';
      if (!cloudName) throw new Error("Falta NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME");
      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/config`);
      clRes = (res.status < 500) ? 'ok' : 'err';
    } catch (e) {
      clRes = 'err';
      errorMsg += `Cloudinary: ${e.message}. `;
    }

    setDiagStatus({ firebase: fbRes, cloudinary: clRes, msg: errorMsg || 'Tot correcte! Si Firebase surt OK i no veus dades, revisa les Firestore Rules.' });
    setIsCheckingDiag(false);
  };

  const generateSlug = (text) => {
    if (!text) return "";
    return text
      .toString()
      .normalize('NFD')                   // Descompon caràcters amb accents (ex: à -> a + `)
      .replace(/[\u0300-\u036f]/g, '')     // Elimina els accents
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')                // Espais per guions
      .replace(/[^\w-]+/g, '')             // Elimina caràcters especials
      .replace(/--+/g, '-');               // Elimina guions dobles
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
        imageTitle: post.imageTitle || "",
        imageAlt: post.imageAlt || "",
        isIndexed: post.isIndexed !== undefined ? post.isIndexed : true
      });
    } else {
      setCurrentPost(null);
      setFormData({ title: "", slug: "", excerpt: "", content: "", imageUrl: "", imageTitle: "", imageAlt: "", isIndexed: true });
    }
    setArticleImageFile(null);
    setView('form');
  };

  const handleArticleImageUpload = async (file) => {
    if (!file) return;
    setUploadingArticle(true);
    try {
      const url = await withTimeout(uploadToCloudinary(file), 20000, "pujada d'imatge d'article");
      if (url) {
        setFormData(prev => ({ ...prev, imageUrl: url }));
        setArticleImageFile(file);
        // alert("Imatge pujada correctament! 📷");
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
      // Ens assegurem que el slug no estigui buit
      const cleanSlug = formData.slug || generateSlug(formData.title) || `post-${Date.now()}`;
      
      const postPayload = { 
        ...formData, 
        slug: cleanSlug,
        createdAt: currentPost ? currentPost.createdAt : new Date().toISOString() 
      };
      
      const process = async () => {
        if (currentPost) await updatePost(currentPost.id, postPayload);
        else await createPost(postPayload);
        await loadPosts();
      };
      await withTimeout(process(), 20000, "guardar l'article");
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
        showOnHome: video.showOnHome || false,
        statusText: video.statusText || ""
      });
    } else {
      setCurrentVideo(null);
      setVideoFormData({ videoId: "", title: "", customThumbnailUrl: "", isFeatured: false, showOnHome: false, statusText: "" });
    }
    setVideoImageFile(null);
    setView('video-form');
  };

  const handleVideoImageUpload = async (file) => {
    if (!file) return;
    setUploadingVideo(true);
    try {
      const url = await withTimeout(uploadToCloudinary(file), 20000, "pujada d'imatge de vídeo");
      if (url) {
        setVideoFormData(prev => ({ ...prev, customThumbnailUrl: url }));
        setVideoImageFile(file);
        // alert("Imatge pujada correctament! 📷");
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
        showOnHome: !!videoFormData.showOnHome,
        statusText: videoFormData.statusText ? videoFormData.statusText.trim() : ""
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
      await withTimeout(process(), 20000, "guardar el vídeo");
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

  const handlePageImageUpload = async (file) => {
    if (!file) return;
    setUploadingPage(true);
    try {
      const url = await withTimeout(uploadToCloudinary(file), 20000, "pujada d'imatge de pàgina");
      if (url) {
        setPageFormData(prev => ({ ...prev, imageUrl: url }));
        setPageImageFile(file);
        // alert("Imatge pujada correctament! 📷");
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
      await withTimeout(process(), 20000, "guardar la pàgina");
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
      <style>{`
        input[type="file"] {
          display: none !important;
        }
        .diag-ok { color: #166534; background: #dcfce7; border-color: #16a34a; }
        .diag-err { color: #991b1b; background: #fee2e2; border-color: #ef4444; }
      `}</style>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h1 style={{ fontSize: '1.8rem', color: 'var(--primary-dark)', cursor: 'pointer' }} onClick={() => setView('menu')}>Panell de Control</h1>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={testConnection} disabled={isCheckingDiag} className="btn" style={{ background: 'var(--gray-200)', color: 'var(--primary-blue)', fontSize: '0.75rem', padding: '0.3rem 0.8rem' }}>
            {isCheckingDiag ? 'Verificant...' : '🔍 Test Connexió'}
          </button>
          <button onClick={handleLogout} className="btn" style={{ background: 'transparent', border: '1px solid var(--primary-blue)', color: 'var(--primary-blue)', padding: '0.3rem 0.8rem', fontSize: '0.8rem' }}>Sortir</button>
        </div>
      </header>

      {/* RESULTAT DIAGNÒSTIC */}
      {diagStatus && (
        <div className={`card ${diagStatus.firebase === 'ok' && diagStatus.cloudinary === 'ok' ? 'diag-ok' : 'diag-err'}`} style={{ padding: '1.2rem', borderRadius: '12px', marginBottom: '1.5rem', border: '2px solid' }}>
          <h3 style={{ marginTop: 0, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {diagStatus.firebase === 'ok' && diagStatus.cloudinary === 'ok' ? '✅ Connexió Establerta' : '⚠️ Alerta de Configuració'}
          </h3>
          <p style={{ fontSize: '0.95rem', marginBottom: '1rem' }}>{diagStatus.msg}</p>
          
          <div style={{ background: 'rgba(0,0,0,0.05)', padding: '0.8rem', borderRadius: '8px', fontSize: '0.75rem', marginBottom: '1rem' }}>
            <div style={{ fontWeight: 'bold', marginBottom: '0.3rem' }}>Taula de Claus (Browser Sees):</div>
            <div>API KEY: {process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? '✅ Carregada' : '❌ NO TROBADA'}</div>
            <div>PROJ. ID: {process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? `✅ ${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}` : '❌ NO TROBADA'}</div>
            <div>CLOUD NAME: {process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ? `✅ ${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}` : '❌ NO TROBADA'}</div>
            <div>UPL. PRESET: {process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET ? '✅ Carregada' : '❌ NO TROBADA'}</div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={{ padding: '0.7rem', background: 'rgba(255,255,255,0.5)', borderRadius: '8px', textAlign: 'center' }}>
               <strong>Firebase:</strong> {diagStatus.firebase === 'ok' ? '🟢 OK' : diagStatus.firebase === 'err' ? '🔴 ERROR' : '🟡 ...'}
            </div>
            <div style={{ padding: '0.7rem', background: 'rgba(255,255,255,0.5)', borderRadius: '8px', textAlign: 'center' }}>
               <strong>Cloudinary:</strong> {diagStatus.cloudinary === 'ok' ? '🟢 OK' : diagStatus.cloudinary === 'err' ? '🔴 ERROR' : '🟡 ...'}
            </div>
          </div>
        </div>
      )}

      {/* VERIFICACIÓ DE CLAUS */}
      {(() => {
        const missingKeys = [];
        if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY) missingKeys.push("Firebase API Key");
        if (!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME) missingKeys.push("Cloudinary Cloud Name");
        if (!process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET) missingKeys.push("Cloudinary Upload Preset");
        
        if (missingKeys.length > 0) {
          return (
            <div style={{ padding: '1rem', background: '#fee2e2', border: '1px solid #ef4444', borderRadius: '8px', marginBottom: '2rem', color: '#b91c1c' }}>
              <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>⚠️ Atenció: Falten claus de configuració!</p>
              <p style={{ fontSize: '0.9rem' }}>Les següents dades no estan configurades a Vercel/entorn: <strong>{missingKeys.join(", ")}</strong>. Algunes funcions (pujada de fotos o base de dades) podrien fallar.</p>
            </div>
          );
        }
        return null;
      })()}

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
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                   <label className="btn" style={{ background: 'var(--primary-blue)', fontSize: '0.75rem', padding: '0.4rem 0.8rem', cursor: 'pointer' }}>
                     Triar Document
                     <input type="file" accept=".pdf,.doc,.docx" onChange={handleDocUpload} style={{ display: 'none' }} />
                   </label>
                   {isExtracting && <p style={{ color: 'var(--primary-blue)', fontSize: '0.75rem' }}>Llegint dades...</p>}
                </div>
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
                <label className="btn" style={{ background: 'var(--primary-blue)', fontSize: '0.9rem', padding: '0.6rem 1.2rem', cursor: 'pointer' }}>
                  Triar Document
                  <input type="file" accept=".pdf,.doc,.docx" onChange={handleDocUpload} style={{ display: 'none' }} />
                </label>
                {isExtracting && <p style={{ color: 'var(--primary-blue)', fontSize: '0.8rem', fontWeight: 600 }}>⌛ Llegint document...</p>}
             </div>
             <p style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginTop: '0.5rem' }}>Això omplirà automàticament el títol i el cos de l'article.</p>
          </div>
          
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <input type="text" placeholder="Títol" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value, slug: generateSlug(e.target.value)})} required style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--gray-300)' }} />
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', padding: '1rem', background: '#f1f5f9', borderRadius: '8px' }}>
              <label style={{ fontWeight: 600 }}>📷 Foto del capçalera:</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                <label className="btn" style={{ background: uploadingArticle ? 'var(--gray-300)' : 'var(--primary-blue)', color: 'white', fontSize: '0.8rem', padding: '0.6rem 1.2rem', cursor: uploadingArticle ? 'default' : 'pointer', margin: 0 }}>
                  {uploadingArticle ? 'Pujant...' : 'Triar Foto'}
                  <input type="file" accept="image/*" onChange={e => handleArticleImageUpload(e.target.files[0])} disabled={uploadingArticle} style={{ display: 'none' }} />
                </label>
                
                {formData.imageUrl && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'white', padding: '0.3rem 0.6rem', borderRadius: '6px', border: '1px solid var(--gray-200)' }}>
                    <img src={formData.imageUrl} alt="Preview" style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
                    <span style={{ fontSize: '0.75rem', color: '#166534', fontWeight: 600 }}>✅ Foto activa</span>
                  </div>
                )}
                
                {uploadingArticle && <span style={{ fontSize: '0.8rem', color: 'var(--primary-blue)', fontWeight: 600 }}>⌛ S'està pujant a Cloudinary...</span>}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', flex: 1, minWidth: '200px' }}>
                <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>🏷️ Títol de la Imatge (Title):</label>
                <input type="text" placeholder="El nom de la imatge" value={formData.imageTitle} onChange={e => setFormData({...formData, imageTitle: e.target.value})} style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--gray-300)' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', flex: 1, minWidth: '200px' }}>
                <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>🔍 Text Alternatiu (Alt Text):</label>
                <input type="text" placeholder="Descripció per a SEO" value={formData.imageAlt} onChange={e => setFormData({...formData, imageAlt: e.target.value})} style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--gray-300)' }} />
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input type="checkbox" id="isIndexedPost" checked={formData.isIndexed} onChange={e => setFormData({...formData, isIndexed: e.target.checked})} />
              <label htmlFor="isIndexedPost">Indexar a Google</label>
            </div>
            <textarea 
              placeholder="Resum (S'omple sol si no escrius res)" 
              value={formData.excerpt} 
              onChange={e => setFormData({...formData, excerpt: e.target.value})} 
              style={{ padding: '0.8rem', minHeight: '80px', borderRadius: '8px' }} 
            />
            
            <textarea 
              placeholder="Contingut (Markdown)" 
              value={formData.content} 
              onChange={e => {
                const newContent = e.target.value;
                const words = newContent.trim().split(/\s+/).slice(0, 20).join(" ");
                setFormData({
                  ...formData, 
                  content: newContent,
                  excerpt: words + (newContent.split(/\s+/).length > 20 ? "..." : "")
                });
              }} 
              required 
              style={{ padding: '0.8rem', minHeight: '300px', borderRadius: '8px' }} 
            />
            
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button 
                type="submit" 
                className="btn" 
                disabled={submitLoading || uploadingArticle} 
                style={{ flex: 1, background: (uploadingArticle || submitLoading) ? 'var(--gray-300)' : 'var(--primary-blue)' }}
              >
                {submitLoading ? 'Sincronitzant...' : uploadingArticle ? 'S\'està pujant la foto...' : 'Desar finalment'}
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
              <label style={{ fontWeight: 600 }}>📷 Foto de la Pàgina:</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                <label className="btn" style={{ background: uploadingPage ? 'var(--gray-300)' : 'var(--primary-blue)', color: 'white', fontSize: '0.8rem', padding: '0.6rem 1.2rem', cursor: uploadingPage ? 'default' : 'pointer', margin: 0 }}>
                  {uploadingPage ? 'Pujant...' : 'Triar Foto'}
                  <input type="file" accept="image/*" onChange={e => handlePageImageUpload(e.target.files[0])} disabled={uploadingPage} style={{ display: 'none' }} />
                </label>
                
                {pageFormData.imageUrl && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'white', padding: '0.3rem 0.6rem', borderRadius: '6px', border: '1px solid var(--gray-200)' }}>
                    <img src={pageFormData.imageUrl} alt="Preview" style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
                    <span style={{ fontSize: '0.75rem', color: '#166534', fontWeight: 600 }}>✅ Foto activa</span>
                  </div>
                )}
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
            <div>
              <label style={{fontWeight: 600, display: 'block', marginBottom: '0.5rem'}}>🏷️ Text d'estat (ex: "Properament", "Aquest divendres"):</label>
              <input type="text" value={videoFormData.statusText} onChange={e => setVideoFormData({...videoFormData, statusText: e.target.value})} placeholder="Deixa-ho buit si el vídeo ja està publicat" style={{width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--gray-300)'}} />
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', padding: '1rem', background: '#f1f5f9', borderRadius: '8px' }}>
              <label style={{ fontWeight: 600 }}>📷 Foto del Vídeo/Anunci:</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                <label className="btn" style={{ background: uploadingVideo ? 'var(--gray-300)' : 'var(--primary-blue)', color: 'white', fontSize: '0.8rem', padding: '0.6rem 1.2rem', cursor: uploadingVideo ? 'default' : 'pointer', margin: 0 }}>
                  {uploadingVideo ? 'Pujant...' : 'Triar Foto'}
                  <input type="file" accept="image/*" onChange={e => handleVideoImageUpload(e.target.files[0])} disabled={uploadingVideo} style={{ display: 'none' }} />
                </label>
                
                {videoFormData.customThumbnailUrl && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'white', padding: '0.3rem 0.6rem', borderRadius: '6px', border: '1px solid var(--gray-200)' }}>
                    <img src={videoFormData.customThumbnailUrl} alt="Preview" style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
                    <span style={{ fontSize: '0.75rem', color: '#166534', fontWeight: 600 }}>✅ Foto activa</span>
                  </div>
                )}
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
