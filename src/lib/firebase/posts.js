import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  getDoc, 
  query, 
  where, 
  orderBy,
  serverTimestamp 
} from "firebase/firestore";
import { db } from "./config";

const COLLECTION_NAME = "posts";

// Obtenir tots els articles ordenats per data descendent
export const getAllPosts = async () => {
  try {
    const q = query(collection(db, COLLECTION_NAME), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    const posts = querySnapshot.docs.map(doc => {
      const data = doc.data();
      let dateStr = new Date().toISOString();
      
      if (data.createdAt) {
        if (typeof data.createdAt.toDate === 'function') {
          dateStr = data.createdAt.toDate().toISOString();
        } else if (data.createdAt.seconds) {
          dateStr = new Date(data.createdAt.seconds * 1000).toISOString();
        } else if (typeof data.createdAt === 'string') {
          dateStr = data.createdAt;
        }
      }

      return {
        id: doc.id,
        ...data,
        slug: data.slug || doc.id, // Fallback si no hi ha slug
        createdAt: dateStr
      };
    });

    // Ordenem explícitament per data descendent per evitar problemes amb tipus mixtes (String vs Timestamp) a Firestore
    return posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } catch (error) {
    console.error("Error fetching posts:", error);
    return [];
  }
};

// Obtenir un article pel seu slug o per la seva ID (fallback de seguretat)
export const getPostBySlug = async (slugOrId) => {
  try {
    // 1. Intentem buscar pel slug neta
    const q = query(collection(db, COLLECTION_NAME), where("slug", "==", slugOrId));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const docData = querySnapshot.docs[0];
      const data = docData.data();
      return { id: docData.id, ...data, createdAt: formatFirebaseDate(data.createdAt) };
    }
    
    // 2. Si no el troba, intentem buscar per la ID directa del document
    const docRef = doc(db, COLLECTION_NAME, slugOrId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return { id: docSnap.id, ...data, createdAt: formatFirebaseDate(data.createdAt) };
    }
    
    return null;
  } catch (error) {
    console.error("Error fetching post:", error);
    return null;
  }
};

// Funció auxiliar per no repetir codi de dates
const formatFirebaseDate = (dateField) => {
  let dateStr = new Date().toISOString();
  if (dateField) {
    if (typeof dateField.toDate === 'function') {
      dateStr = dateField.toDate().toISOString();
    } else if (typeof dateField === 'string') {
      dateStr = dateField;
    }
  }
  return dateStr;
};

// Crear un nou article
export const createPost = async (postData) => {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...postData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error("Error creating post:", error);
    throw error;
  }
};

// Actualitzar un article existent
export const updatePost = async (id, postData) => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, {
      ...postData,
      updatedAt: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error("Error updating post:", error);
    throw error;
  }
};

// Esborrar un article
export const deletePost = async (id) => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.error("Error deleting post:", error);
    throw error;
  }
};
