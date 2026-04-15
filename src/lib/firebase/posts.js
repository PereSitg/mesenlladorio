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
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      let dateStr = new Date().toISOString();
      
      if (data.createdAt) {
        if (typeof data.createdAt.toDate === 'function') {
          dateStr = data.createdAt.toDate().toISOString();
        } else if (typeof data.createdAt === 'string') {
          dateStr = data.createdAt;
        }
      }

      return {
        id: doc.id,
        ...data,
        createdAt: dateStr
      };
    });
  } catch (error) {
    console.error("Error fetching posts:", error);
    return [];
  }
};

// Obtenir un article pel seu slug (per a l'SEO i les URLs amigables)
export const getPostBySlug = async (slug) => {
  try {
    const q = query(collection(db, COLLECTION_NAME), where("slug", "==", slug));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) return null;
    
    const docData = querySnapshot.docs[0];
    const data = docData.data();
    let dateStr = new Date().toISOString();
    
    if (data.createdAt) {
      if (typeof data.createdAt.toDate === 'function') {
        dateStr = data.createdAt.toDate().toISOString();
      } else if (typeof data.createdAt === 'string') {
        dateStr = data.createdAt;
      }
    }

    return {
      id: docData.id,
      ...data,
      createdAt: dateStr
    };
  } catch (error) {
    console.error("Error fetching post by slug:", error);
    return null;
  }
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
