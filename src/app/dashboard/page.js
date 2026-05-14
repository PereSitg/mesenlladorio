"use client";

import { useEffect, useState, useRef } from "react";
import { auth, provider } from "@/lib/firebase/config";
import { signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import { getAllPosts, createPost, updatePost, deletePost } from "@/lib/firebase/posts";
import { getAllVideos, createVideo, updateVideo, deleteVideo } from "@/lib/firebase/videos";
import { getAllPages, createPage, updatePage, deletePage } from "@/lib/firebase/pages";
import { getHomeSEO, updateHomeSEO, getBlogSEO, updateBlogSEO, getYoutubeSEO, updateYoutubeSEO } from '@/lib/firebase/settings';
import { uploadToCloudinary } from "@/lib/cloudinary";
import { getYouTubeId } from "@/lib/youtube";
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
  const contentRef = useRef(null);
  const pageContentRef = useRef(null);
  const [contentImageSnippet, setContentImageSnippet] = useState("");
  const [uploadingContentImage, setUploadingContentImage] = useState(false);
  
  // Vistes: 'menu', 'list', 'form', 'videos', 'video-form', 'pages', 'page-form', 'seo-home', 'seo-blog', 'seo-youtube'
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
    isIndexed: true,
    seoTitle: "",
    seoDescription: ""
  });
  const [homeSEO, setHomeSEO] = useState({ title: "", description: "", imageUrl: "" });
  const [blogSEO, setBlogSEO] = useState({ title: "", description: "" });
  const [youtubeSEO, setYoutubeSEO] = useState({ title: "", description: "" });
  const [loadingHomeSEO, setLoadingHomeSEO] = useState(false);
  const [loadingBlogSEO, setLoadingBlogSEO] = useState(false);
  const [loadingYoutubeSEO, setLoadingYoutubeSEO] = useState(false);
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
    showOnYoutube: true,
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
    imageTitle: "",
    imageAlt: "",
    isIndexed: true,
    seoTitle: "",
    seoDescription: ""
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
          loadHomeSEO();
          loadBlogSEO();
          loadYoutubeSEO();
        }
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const loadPosts = async () => { setPosts(await getAllPosts()); };
  const loadVideos = async () => { setVideosList(await getAllVideos()); };
  const loadPages = async () => { setPagesList(await getAllPages()); };
  const loadHomeSEO = async () => { const data = await getHomeSEO(); if (data) setHomeSEO(data); };
  const loadBlogSEO = async () => { const data = await getBlogSEO(); if (data) setBlogSEO(data); };
  const loadYoutubeSEO = async () => { const data = await getYoutubeSEO(); if (data) setYoutubeSEO(data); };

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

  const applyStyle = (prefix, suffix = "", isPage = false) => {
    const textarea = isPage ? pageContentRef.current : contentRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = isPage ? pageFormData.content : formData.content;
    const selectedText = text.substring(start, end);
    
    const before = text.substring(0, start);
    const after = text.substring(end);
    
    const newContent = `${before}${prefix}${selectedText}${suffix}${after}`;
    
    if (isPage) {
      setPageFormData(prev => ({ ...prev, content: newContent }));
    } else {
      setFormData(prev => ({ ...prev, content: newContent }));
    }

    // Restaurar el focus i la selecció
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, end + prefix.length);
    }, 0);
  };

  const handleYouTubeInsert = (isPage = false) => {
    const url = prompt("Enganxa la URL de YouTube o l'ID del vídeo:");
    if (!url) return;
    
    const videoId = getYouTubeId(url);
    if (!videoId) {
      alert("No s'ha pogut extreure un ID de vídeo vàlid.");
      return;
    }
    
    const embedCode = `\n<iframe src="https://www.youtube.com/embed/${videoId}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>\n`;
    
    const textarea = isPage ? pageContentRef.current : contentRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const text = isPage ? (isPage ? pageFormData.content : formData.content) : formData.content; 
    // Corregim la lògica de text per si de cas
    const currentText = isPage ? pageFormData.content : formData.content;
    
    const before = currentText.substring(0, start);
    const after = currentText.substring(start);
    const newContent = `${before}${embedCode}${after}`;

    if (isPage) {
      setPageFormData(prev => ({ ...prev, content: newContent }));
    } else {
      setFormData(prev => ({ ...prev, content: newContent }));
    }
  };

  const handleAmazonInsert = (isPage = false) => {
    const title = prompt("Títol del producte:");
    if (!title) return;
    const link = prompt("Enllaç d'afiliat d'Amazon (ex: https://amzn.to/...):");
    if (!link) return;
    const imageUrl = prompt("URL de la imatge del producte (opcional):");
    const price = prompt("Preu (opcional, ex: 19,99€):");

    const amazonHtml = `\n<a href="${link}" target="_blank" rel="noopener noreferrer" class="amazon-card">
  <div class="amazon-card-image">
    <img src="${imageUrl || 'https://via.placeholder.com/200x200?text=Sense+Imatge'}" alt="${title}">
  </div>
  <div class="amazon-card-content">
    <h3>${title}</h3>
    ${price ? `<p class="amazon-card-price">${price}</p>` : ''}
    <div class="amazon-card-button">
      <svg style="width:16px;height:16px" viewBox="0 0 24 24"><path fill="currentColor" d="M17.2,12.5L20.3,15.6C20.9,16.2 20.9,17.1 20.3,17.7L17.7,20.3C17.1,20.9 16.2,20.9 15.6,20.3L12.5,17.2L17.2,12.5M15.1,10.4L10.4,15.1L4.3,9L9,4.3L15.1,10.4M12.3,13.2L13.7,11.8L9.7,7.8L8.3,9.2L12.3,13.2Z" /></svg>
      Veure a Amazon
    </div>
  </div>
</a>\n`;
    
    const textarea = isPage ? pageContentRef.current : contentRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const currentText = isPage ? pageFormData.content : formData.content;
    
    const before = currentText.substring(0, start);
    const after = currentText.substring(start);
    const newContent = `${before}${amazonHtml}${after}`;

    if (isPage) {
      setPageFormData(prev => ({ ...prev, content: newContent }));
    } else {
      setFormData(prev => ({ ...prev, content: newContent }));
    }
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
        isIndexed: post.isIndexed !== undefined ? post.isIndexed : true,
        seoTitle: post.seoTitle || "",
        seoDescription: post.seoDescription || ""
      });
    } else {
      setCurrentPost(null);
      setFormData({ 
        title: "", 
        slug: "", 
        excerpt: "", 
        content: "", 
        imageUrl: "", 
        imageTitle: "", 
        imageAlt: "", 
        isIndexed: true,
        seoTitle: "",
        seoDescription: ""
      });
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
      }
    } catch (err) { alert(err.message || "Error al pujar la imatge."); }
    finally { setUploadingArticle(false); }
  };

  const handleContentImageUpload = async (file) => {
    if (!file) return;
    setUploadingContentImage(true);
    setContentImageSnippet("");
    try {
      const url = await withTimeout(uploadToCloudinary(file), 20000, "pujada d'imatge de contingut");
      if (url) {
        const snippet = `![Imatge](${url})`;
        setContentImageSnippet(snippet);
      }
    } catch (err) { alert(err.message || "Error al pujar la imatge de contingut."); }
    finally { setUploadingContentImage(false); }
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
      setView('form'); 
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
      const cleanSlug = formData.slug || generateSlug(formData.title) || `post-${Date.now()}`;
      
      // Generem el resum automàticament si no en tenim cap de guardat (o per assegurar sincronia)
      const autoExcerpt = formData.content.trim().split(/\s+/).slice(0, 25).join(" ") + "...";

      const postPayload = { 
        ...formData, 
        excerpt: formData.excerpt || autoExcerpt, // Respectem el que ja hi hagi o generem nou
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
        showOnYoutube: video.showOnYoutube !== undefined ? video.showOnYoutube : true,
        statusText: video.statusText || ""
      });
    } else {
      setCurrentVideo(null);
      setVideoFormData({ videoId: "", title: "", customThumbnailUrl: "", isFeatured: false, showOnHome: false, showOnYoutube: true, statusText: "" });
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
        videoId: videoFormData.videoId ? getYouTubeId(videoFormData.videoId) : "", 
        title: videoFormData.title ? videoFormData.title.trim() : "", 
        customThumbnailUrl: videoFormData.customThumbnailUrl ? videoFormData.customThumbnailUrl.trim() : "",
        isFeatured: !!videoFormData.isFeatured,
        showOnHome: !!videoFormData.showOnHome,
        showOnYoutube: !!videoFormData.showOnYoutube,
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
        imageTitle: page.imageTitle || "",
        imageAlt: page.imageAlt || "",
        isIndexed: page.isIndexed !== undefined ? page.isIndexed : true,
        seoTitle: page.seoTitle || "",
        seoDescription: page.seoDescription || ""
      });
    } else {
      setCurrentPage(null);
      setPageFormData({ title: "", slug: "", content: "", imageUrl: "", imageTitle: "", imageAlt: "", isIndexed: true, seoTitle: "", seoDescription: "" });
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



  const handleHomeSEOSubmit = async (e) => {
    e.preventDefault();
    setLoadingHomeSEO(true);
    try {
      await updateHomeSEO(homeSEO);
      alert("SEO de l'inici actualitzat!");
    } catch (err) { alert("Error al guardar SEO."); }
    finally { setLoadingHomeSEO(false); }
  };
  
  const handleBlogSEOSubmit = async (e) => {
    e.preventDefault();
    setLoadingBlogSEO(true);
    try {
      await updateBlogSEO(blogSEO);
      alert("SEO del Blog actualitzat!");
    } catch (err) { alert("Error al guardar SEO del Blog."); }
    finally { setLoadingBlogSEO(false); }
  };

  const handleYoutubeSEOSubmit = async (e) => {
    e.preventDefault();
    setLoadingYoutubeSEO(true);
    try {
      await updateYoutubeSEO(youtubeSEO);
      alert("SEO de YouTube actualitzat!");
    } catch (err) { alert("Error al guardar SEO de YouTube."); }
    finally { setLoadingYoutubeSEO(false); }
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <h1 style={{ fontSize: '1.8rem', color: 'var(--primary-dark)', cursor: 'pointer', margin: 0 }} onClick={() => setView('menu')}>Panell de Control</h1>
           <span style={{ background: '#1d4ed8', color: 'white', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 700 }}>v1.4 SEO & NEWSLETTER FIX</span>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={handleLogout} className="btn" style={{ background: 'transparent', border: '1px solid var(--primary-blue)', color: 'var(--primary-blue)', padding: '0.3rem 0.8rem', fontSize: '0.8rem' }}>Sortir</button>
        </div>
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
          <div className="card" onClick={() => setView('seo-home')} style={{ cursor: 'pointer', textAlign: 'center', border: '1px solid var(--primary-blue)', background: '#eff6ff' }}>
            <span style={{ fontSize: '2.5rem' }}>🏠</span>
            <h3>SEO Pàgina d&apos;Inici</h3>
          </div>
          <div className="card" onClick={() => setView('seo-blog')} style={{ cursor: 'pointer', textAlign: 'center', border: '1px solid var(--primary-blue)', background: '#eff6ff' }}>
            <span style={{ fontSize: '2.5rem' }}>📝</span>
            <h3>SEO Blog</h3>
          </div>
          <div className="card" onClick={() => setView('seo-youtube')} style={{ cursor: 'pointer', textAlign: 'center', border: '1px solid var(--primary-blue)', background: '#eff6ff' }}>
            <span style={{ fontSize: '2.5rem' }}>📺</span>
            <h3>SEO YouTube</h3>
          </div>
          <a href="/" target="_blank" className="card" style={{ cursor: 'pointer', textAlign: 'center', textDecoration: 'none', color: 'inherit' }}>
            <span style={{ fontSize: '2.5rem' }}>🚀</span>
            <h3>Veure Web Pública</h3>
            <p style={{ fontSize: '0.7rem', color: 'var(--gray-500)' }}>Obre la pantalla d'inici</p>
          </a>
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

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontWeight: 700, color: 'var(--primary-dark)' }}>Títol de l&apos;Article:</label>
              <input type="text" placeholder="Escriu el títol aquí..." value={formData.title} onChange={e => setFormData({...formData, title: e.target.value, slug: generateSlug(e.target.value)})} required style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--gray-300)', fontSize: '1.1rem' }} />
            </div>
            
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

            <div style={{ padding: '1.2rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid var(--gray-200)' }}>
              <h4 style={{ margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>🔍 SEO i Visibilitat</h4>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '0.5rem', background: 'white', borderRadius: '8px', border: '1px solid var(--gray-100)' }}>
                <input type="checkbox" id="isIndexedPost" checked={formData.isIndexed} onChange={e => setFormData({...formData, isIndexed: e.target.checked})} style={{ width: '1.2rem', height: '1.2rem', cursor: 'pointer' }} />
                <label htmlFor="isIndexedPost" style={{ fontWeight: 600, cursor: 'pointer' }}>Indexar a Google i apareixer a l'índex web</label>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginTop: '0.5rem', paddingLeft: '2rem' }}>
                Si està marcat, l'article serà visible per cercadors i apareixerà automàticament a la pàgina d'índex.
              </p>
            </div>

            {/* EINA DE PUJADA D'IMATGES DE CONTINGUT */}
            <div style={{ padding: '1rem', background: '#ecfdf5', borderRadius: '12px', border: '1px solid #10b981', marginBottom: '0.5rem' }}>
               <h4 style={{ margin: '0 0 0.5rem 0', color: '#065f46', fontSize: '1rem' }}>📷 Afegir Imatges al Text</h4>
               <p style={{ fontSize: '0.8rem', color: '#065f46', marginBottom: '1rem' }}>Puja fotos aquí per obtenir el codi que podràs enganxar dins de l&apos;article.</p>
               <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <label className="btn" style={{ background: '#10b981', color: 'white', fontSize: '0.8rem', padding: '0.6rem 1.2rem', cursor: uploadingContentImage ? 'default' : 'pointer' }}>
                    {uploadingContentImage ? 'Pujant...' : 'Pujar Foto de Contingut'}
                    <input type="file" accept="image/*" onChange={e => handleContentImageUpload(e.target.files[0])} disabled={uploadingContentImage} style={{ display: 'none' }} />
                  </label>
                  {contentImageSnippet && (
                    <div style={{ flex: 1, minWidth: '200px' }}>
                       <p style={{ fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.3rem', color: '#065f46' }}>Còpia i enganxa això al text:</p>
                       <code style={{ display: 'block', background: 'white', padding: '0.5rem', borderRadius: '4px', border: '1px solid #10b981', fontSize: '0.8rem', wordBreak: 'break-all' }}>
                         {contentImageSnippet}
                       </code>
                    </div>
                  )}
               </div>
            </div>
            {/* El camp 'Resum' s'ha eliminat per evitar duplicats amb el camp SEO de sota */}

            {/* SECCIÓ SEO AVANÇAT - GOOGLE PREVIEW */}
            <div style={{ padding: '1.5rem', background: '#f0f9ff', borderRadius: '12px', border: '1px solid #7dd3fc', margin: '0.5rem 0' }}>
               <h4 style={{ margin: '0 0 1rem 0', color: '#0369a1', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>🔍 Control de SEO (Google)</h4>
               
               <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'white', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                  <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Previsualització del resultat:</p>
                  <div style={{ fontSize: '18px', color: '#1a0dab', marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {formData.seoTitle || formData.title || "El títol sortirà aquí..."}
                  </div>
                  <div style={{ fontSize: '14px', color: '#006621', marginBottom: '4px' }}>
                    mesenlladorio.vercel.app › blog › {formData.slug || "el-teu-article"}
                  </div>
                  <div style={{ fontSize: '14px', color: '#545454', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: '1.4' }}>
                    <span style={{ color: '#70757a' }}>{new Date().toLocaleDateString('ca-ES')} — </span>
                    {formData.seoDescription || formData.excerpt || "Escriu una descripció específica per atraure clics a Google..."}
                  </div>
               </div>

               <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                    <label style={{ fontWeight: 600, fontSize: '0.9rem', color: '#0369a1' }}>Títol Personalitzat Google:</label>
                    <input type="text" placeholder="Sobreescriu el títol de l'article" value={formData.seoTitle} onChange={e => setFormData({...formData, seoTitle: e.target.value})} style={{ padding: '0.7rem', borderRadius: '8px', border: '1px solid #7dd3fc' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                    <label style={{ fontWeight: 600, fontSize: '0.9rem', color: '#0369a1' }}>Descripció Personalitzada Google:</label>
                    <textarea placeholder="Descripció atractiva per a cercadors..." value={formData.seoDescription} onChange={e => setFormData({...formData, seoDescription: e.target.value})} style={{ padding: '0.7rem', borderRadius: '8px', border: '1px solid #7dd3fc', minHeight: '60px' }} />
                  </div>
               </div>
            </div>

             {/* BARRA D'EINES DE FORMAT - Ara més separada i visible */}
             <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', background: '#f1f5f9', padding: '0.8rem', borderRadius: '12px 12px 0 0', border: '2px solid var(--primary-blue)', borderBottom: 'none', marginTop: '1rem' }}>
               <button type="button" onClick={() => applyStyle("# ")} className="btn-tool" title="Encapçalament 1">H1</button>
               <button type="button" onClick={() => applyStyle("## ")} className="btn-tool" title="Encapçalament 2">H2</button>
               <button type="button" onClick={() => applyStyle("### ")} className="btn-tool" title="Encapçalament 3">H3</button>
               <button type="button" onClick={() => applyStyle("#### ")} className="btn-tool" title="Encapçalament 4">H4</button>
               <div style={{ width: '1px', background: 'var(--gray-300)', margin: '0 0.5rem' }}></div>
               <button type="button" onClick={() => applyStyle("**", "**")} className="btn-tool" style={{ fontWeight: 800 }} title="Negreta">B</button>
               <button type="button" onClick={() => applyStyle("*", "*")} className="btn-tool" style={{ fontStyle: 'italic' }} title="Cursiva">I</button>
                <div style={{ width: '1px', background: 'var(--gray-300)', margin: '0 0.5rem' }}></div>
                <button type="button" onClick={() => handleYouTubeInsert(false)} className="btn-tool" title="Inserir Vídeo de YouTube">📺 YouTube</button>
                <button type="button" onClick={() => handleAmazonInsert(false)} className="btn-tool" title="Inserir Producte Amazon">📦 Amazon</button>
               <style>{`
                  .btn-tool {
                    background: white;
                    border: 1px solid var(--gray-300);
                    color: var(--primary-dark);
                    padding: 0.3rem 0.8rem;
                    border-radius: 4px;
                    cursor: pointer;
                    font-weight: 600;
                    font-size: 0.85rem;
                    transition: all 0.2s;
                  }
                  .btn-tool:hover {
                    background: var(--primary-blue);
                    color: white;
                    border-color: var(--primary-blue);
                  }
               `}</style>
            </div>
            
            <textarea 
              ref={contentRef}
              placeholder="Contingut (Markdown)" 
              value={formData.content} 
              onChange={e => {
                setFormData({
                  ...formData, 
                  content: e.target.value
                });
              }} 
              required 
              style={{ padding: '0.8rem', minHeight: '300px', borderRadius: '0 0 8px 8px', border: '1px solid var(--gray-300)', marginTop: '-1px' }} 
            />
            
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <button 
                type="submit" 
                className="btn" 
                disabled={submitLoading || uploadingArticle} 
                style={{ flex: 1, background: (uploadingArticle || submitLoading) ? 'var(--gray-300)' : 'var(--primary-blue)', fontSize: '1.1rem', fontWeight: 700, padding: '1rem' }}
              >
                {submitLoading ? 'Sincronitzant...' : uploadingArticle ? 'S\'està pujant la foto...' : 'DESAR ARTICLE ✨'}
              </button>
              <button type="button" className="btn" onClick={() => setView('list')} style={{ background: 'var(--gray-200)', color: 'black' }}>Cancel·lar</button>
            </div>

            {/* IMPORTACIÓ DE DOCUMENTS - ARA AL FINAL PER NO CONFONDRE */}
            <div style={{ marginTop: '2rem', padding: '1.2rem', background: '#f1f5f9', borderRadius: '12px', border: '1px solid var(--gray-300)' }}>
               <label style={{ fontWeight: 700, display: 'block', marginBottom: '0.6rem', fontSize: '0.9rem', color: 'var(--gray-600)' }}>
                  📂 Opcional: Importar des de Word o PDF
               </label>
               <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <label className="btn" style={{ background: 'var(--gray-500)', fontSize: '0.8rem', padding: '0.5rem 1rem', cursor: 'pointer' }}>
                     Triar Document
                     <input type="file" accept=".pdf,.doc,.docx" onChange={handleDocUpload} style={{ display: 'none' }} />
                  </label>
                  {isExtracting && <p style={{ color: 'var(--primary-blue)', fontSize: '0.8rem', fontWeight: 600 }}>⌛ Llegint...</p>}
               </div>
               <p style={{ fontSize: '0.7rem', color: 'var(--gray-500)', marginTop: '0.4rem' }}>Això substituirà el títol i el text actuals pel contingut del fitxer.</p>
            </div>
          </form>
        </div>
      )}

      {/* PAGES LIST */}
      {view === 'pages' && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2>Pàgines Independents</h2>
            <button className="btn" onClick={() => openPageForm()}>+ Nova Pàgina</button>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
            <tbody>
              {pagesList.map(p => (
                <tr key={p.id} style={{ borderBottom: '1px solid var(--gray-100)' }}>
                  <td style={{ padding: '0.8rem' }}>
                    <strong>{p.title}</strong>
                    <div style={{ fontSize: '0.8rem', color: 'var(--gray-500)', marginTop: '0.2rem' }}>
                       URL: /{p.slug} • {p.isIndexed !== false ? <span style={{color: '#166534'}}>🟢 Indexada</span> : <span style={{color: '#991b1b'}}>🔴 No Indexada</span>}
                    </div>
                  </td>
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

            <div style={{ padding: '1.2rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid var(--gray-200)' }}>
              <h4 style={{ margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>🔍 SEO i Visibilitat</h4>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '0.5rem', background: 'white', borderRadius: '8px', border: '1px solid var(--gray-100)' }}>
                <input type="checkbox" id="isIndexedPage" checked={pageFormData.isIndexed} onChange={e => setPageFormData({...pageFormData, isIndexed: e.target.checked})} style={{ width: '1.2rem', height: '1.2rem', cursor: 'pointer' }} />
                <label htmlFor="isIndexedPage" style={{ fontWeight: 600, cursor: 'pointer' }}>Indexar a Google i apareixer a l'índex web</label>
              </div>

               {/* GOOGLE PREVIEW PER PÀGINES */}
               <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'white', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                  <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Previsualització Google:</p>
                  <div style={{ fontSize: '18px', color: '#1a0dab', marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {pageFormData.seoTitle || pageFormData.title || "Títol de la pàgina..."}
                  </div>
                  <div style={{ fontSize: '14px', color: '#006621', marginBottom: '4px' }}>
                    mesenlladorio.vercel.app › {pageFormData.slug || "la-teva-pagina"}
                  </div>
                  <div style={{ fontSize: '14px', color: '#545454' }}>
                    {pageFormData.seoDescription || "Descripció especial per a aquesta pàgina..."}
                  </div>
               </div>
               
               <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                  <input type="text" placeholder="Títol SEO Google" value={pageFormData.seoTitle} onChange={e => setPageFormData({...pageFormData, seoTitle: e.target.value})} style={{ padding: '0.7rem', borderRadius: '8px', border: '1px solid #7dd3fc' }} />
                  <textarea placeholder="Descripció SEO Google" value={pageFormData.seoDescription} onChange={e => setPageFormData({...pageFormData, seoDescription: e.target.value})} style={{ padding: '0.7rem', borderRadius: '8px', border: '1px solid #7dd3fc', minHeight: '60px' }} />
               </div>
            </div>
             {/* BARRA D'EINES DE PÀGINA */}
             <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', background: '#f1f5f9', padding: '0.8rem', borderRadius: '12px 12px 0 0', border: '2px solid var(--primary-blue)', borderBottom: 'none', marginTop: '1rem' }}>
               <button type="button" onClick={() => applyStyle("# ", "", true)} className="btn-tool" title="Encapçalament 1">H1</button>
               <button type="button" onClick={() => applyStyle("## ", "", true)} className="btn-tool" title="Encapçalament 2">H2</button>
               <button type="button" onClick={() => applyStyle("### ", "", true)} className="btn-tool" title="Encapçalament 3">H3</button>
               <button type="button" onClick={() => applyStyle("**", "**", true)} className="btn-tool" style={{ fontWeight: 800 }} title="Negreta">B</button>
               <button type="button" onClick={() => applyStyle("*", "*", true)} className="btn-tool" style={{ fontStyle: 'italic' }} title="Cursiva">I</button>
                <div style={{ width: '1px', background: 'var(--gray-300)', margin: '0 0.5rem' }}></div>
                <button type="button" onClick={() => handleYouTubeInsert(true)} className="btn-tool" title="Inserir Vídeo de YouTube">📺 YouTube</button>
                <button type="button" onClick={() => handleAmazonInsert(true)} className="btn-tool" title="Inserir Producte Amazon">📦 Amazon</button>
            </div>
            <textarea 
              ref={pageContentRef}
              placeholder="Contingut (Markdown)" 
              value={pageFormData.content} 
              onChange={e => setPageFormData({...pageFormData, content: e.target.value})} 
              required 
              style={{ padding: '0.8rem', minHeight: '400px', borderRadius: '0 0 8px 8px', border: '1px solid var(--gray-300)', marginTop: '-1px' }} 
            />
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
              <input 
                type="text" 
                value={videoFormData.videoId} 
                onChange={e => setVideoFormData({...videoFormData, videoId: e.target.value})} 
                onBlur={e => setVideoFormData({...videoFormData, videoId: getYouTubeId(e.target.value)})}
                placeholder="Ex: s4ycv5hkAPk o la URL completa" 
                style={{width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--gray-300)'}} 
              />
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input type="checkbox" id="vYoutube" checked={videoFormData.showOnYoutube} onChange={e => setVideoFormData({...videoFormData, showOnYoutube: e.target.checked})} />
                <label htmlFor="vYoutube">Mostrar a la pàgina YouTube</label>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <button type="submit" className="btn" disabled={submitLoading} style={{ flex: 1 }}>{submitLoading ? 'Sincronitzant...' : 'Desar'}</button>
              <button type="button" className="btn" onClick={() => setView('videos')} style={{ background: 'var(--gray-200)', color: 'black' }}>Cancel·lar</button>
            </div>
          </form>
        </div>
      )}
      {/* SEO HOME EDITOR */}
      {view === 'seo-home' && (
        <div className="card" style={{ maxWidth: '700px', margin: '0 auto' }}>
          <header style={{ marginBottom: '2rem', borderBottom: '2px solid var(--primary-blue)', paddingBottom: '0.5rem' }}>
             <h2 style={{ margin: 0 }}>SEO Pàgina d&apos;Inici</h2>
             <p style={{ color: 'var(--gray-500)', fontSize: '0.9rem' }}>Configuració global de com es veu la teva web a Google.</p>
          </header>

          <form onSubmit={handleHomeSEOSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
             {/* PREVISUALITZACIÓ GOOGLE HOME */}
             <div style={{ padding: '1.5rem', background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.8rem' }}>Així es veurà a Google:</p>
                <div style={{ fontSize: '20px', color: '#1a0dab', marginBottom: '4px' }}>
                  {homeSEO.title || "Títol del lloc..."}
                </div>
                <div style={{ fontSize: '14px', color: '#006621', marginBottom: '4px' }}>
                  https://mesenlladorio.vercel.app
                </div>
                <div style={{ fontSize: '14px', color: '#545454', lineHeight: '1.5' }}>
                  {homeSEO.description || "Descripció global de la teva web..."}
                </div>
             </div>

             <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
               <label style={{ fontWeight: 700 }}>Títol Global (Inici):</label>
               <input 
                 type="text" 
                 value={homeSEO.title} 
                 onChange={e => setHomeSEO({...homeSEO, title: e.target.value})} 
                 placeholder="Més enllà d'Orió - ..."
                 style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--gray-300)', fontSize: '1.1rem' }} 
               />
             </div>

             <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
               <label style={{ fontWeight: 700 }}>Descripció Global (Inici):</label>
               <textarea 
                 value={homeSEO.description} 
                 onChange={e => setHomeSEO({...homeSEO, description: e.target.value})} 
                 placeholder="Explica de què va la teva web..."
                 style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--gray-300)', minHeight: '120px' }} 
               />
             </div>

             <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="submit" className="btn" disabled={loadingHomeSEO} style={{ flex: 1, padding: '1rem' }}>
                  {loadingHomeSEO ? 'Guardant...' : 'Desar Configuració SEO'}
                </button>
                <button type="button" className="btn" onClick={() => setView('menu')} style={{ background: 'var(--gray-200)', color: 'black' }}>Tornar</button>
             </div>
          </form>
        </div>
      )}

      {/* SEO BLOG EDITOR */}
      {view === 'seo-blog' && (
        <div className="card" style={{ maxWidth: '700px', margin: '0 auto' }}>
          <header style={{ marginBottom: '2rem', borderBottom: '2px solid var(--primary-blue)', paddingBottom: '0.5rem' }}>
             <h2 style={{ margin: 0 }}>SEO Pàgina de Blog</h2>
             <p style={{ color: 'var(--gray-500)', fontSize: '0.9rem' }}>Configuració de com es veu l&apos;índex del blog a Google.</p>
          </header>

          <form onSubmit={handleBlogSEOSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
             <div style={{ padding: '1.5rem', background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.8rem' }}>Així es veurà a Google:</p>
                <div style={{ fontSize: '20px', color: '#1a0dab', marginBottom: '4px' }}>
                  {blogSEO.title || "Títol del blog..."}
                </div>
                <div style={{ fontSize: '14px', color: '#006621', marginBottom: '4px' }}>
                  https://mesenlladorio.vercel.app/blog
                </div>
                <div style={{ fontSize: '14px', color: '#545454', lineHeight: '1.5' }}>
                  {blogSEO.description || "Descripció del blog..."}
                </div>
             </div>

             <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
               <label style={{ fontWeight: 700 }}>Títol Blog:</label>
               <input 
                 type="text" 
                 value={blogSEO.title} 
                 onChange={e => setBlogSEO({...blogSEO, title: e.target.value})} 
                 placeholder="Blog | Més enllà d'Orió"
                 style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--gray-300)', fontSize: '1.1rem' }} 
               />
             </div>

             <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
               <label style={{ fontWeight: 700 }}>Descripció Blog:</label>
               <textarea 
                 value={blogSEO.description} 
                 onChange={e => setBlogSEO({...blogSEO, description: e.target.value})} 
                 placeholder="Explica de què va el teu blog..."
                 style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--gray-300)', minHeight: '120px' }} 
               />
             </div>

             <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="submit" className="btn" disabled={loadingBlogSEO} style={{ flex: 1, padding: '1rem' }}>
                  {loadingBlogSEO ? 'Guardant...' : 'Desar Configuració SEO'}
                </button>
                <button type="button" className="btn" onClick={() => setView('menu')} style={{ background: 'var(--gray-200)', color: 'black' }}>Tornar</button>
             </div>
          </form>
        </div>
      )}

      {/* SEO YOUTUBE EDITOR */}
      {view === 'seo-youtube' && (
        <div className="card" style={{ maxWidth: '700px', margin: '0 auto' }}>
          <header style={{ marginBottom: '2rem', borderBottom: '2px solid var(--primary-blue)', paddingBottom: '0.5rem' }}>
             <h2 style={{ margin: 0 }}>SEO Pàgina de YouTube</h2>
             <p style={{ color: 'var(--gray-500)', fontSize: '0.9rem' }}>Configuració de com es veu la galeria de vídeos a Google.</p>
          </header>

          <form onSubmit={handleYoutubeSEOSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
             <div style={{ padding: '1.5rem', background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.8rem' }}>Així es veurà a Google:</p>
                <div style={{ fontSize: '20px', color: '#1a0dab', marginBottom: '4px' }}>
                  {youtubeSEO.title || "Títol de YouTube..."}
                </div>
                <div style={{ fontSize: '14px', color: '#006621', marginBottom: '4px' }}>
                  https://mesenlladorio.vercel.app/youtube
                </div>
                <div style={{ fontSize: '14px', color: '#545454', lineHeight: '1.5' }}>
                  {youtubeSEO.description || "Descripció de YouTube..."}
                </div>
             </div>

             <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
               <label style={{ fontWeight: 700 }}>Títol YouTube:</label>
               <input 
                 type="text" 
                 value={youtubeSEO.title} 
                 onChange={e => setYoutubeSEO({...youtubeSEO, title: e.target.value})} 
                 placeholder="Canal de YouTube | Més enllà d'Orió"
                 style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--gray-300)', fontSize: '1.1rem' }} 
               />
             </div>

             <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
               <label style={{ fontWeight: 700 }}>Descripció YouTube:</label>
               <textarea 
                 value={youtubeSEO.description} 
                 onChange={e => setYoutubeSEO({...youtubeSEO, description: e.target.value})} 
                 placeholder="Explica de què va la teva galeria de vídeos..."
                 style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--gray-300)', minHeight: '120px' }} 
               />
             </div>

             <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="submit" className="btn" disabled={loadingYoutubeSEO} style={{ flex: 1, padding: '1rem' }}>
                  {loadingYoutubeSEO ? 'Guardant...' : 'Desar Configuració SEO'}
                </button>
                <button type="button" className="btn" onClick={() => setView('menu')} style={{ background: 'var(--gray-200)', color: 'black' }}>Tornar</button>
             </div>
          </form>
        </div>
      )}

    </div>
  );
}
