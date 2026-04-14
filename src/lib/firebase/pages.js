import { db } from "./config";
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where,
  limit
} from "firebase/firestore";

const COLLECTION_NAME = "pages";

export const getAllPages = async () => {
  const q = query(collection(db, COLLECTION_NAME));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

export const getPageBySlug = async (slug) => {
  const q = query(collection(db, COLLECTION_NAME), where("slug", "==", slug), limit(1));
  const querySnapshot = await getDocs(q);
  if (querySnapshot.empty) return null;
  const d = querySnapshot.docs[0];
  return { id: d.id, ...d.data() };
};

export const createPage = async (pageData) => {
  const docRef = await addDoc(collection(db, COLLECTION_NAME), {
    ...pageData,
    createdAt: new Date().toISOString()
  });
  return docRef.id;
};

export const updatePage = async (id, pageData) => {
  const docRef = doc(db, COLLECTION_NAME, id);
  await updateDoc(docRef, pageData);
};

export const deletePage = async (id) => {
  const docRef = doc(db, COLLECTION_NAME, id);
  await deleteDoc(docRef);
};
