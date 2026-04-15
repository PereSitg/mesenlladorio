import { db } from "./config";
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy,
  limit,
  where
} from "firebase/firestore";

const COLLECTION_NAME = "videos";

export const getAllVideos = async () => {
  const q = query(collection(db, COLLECTION_NAME), orderBy("createdAt", "desc"));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

export const getFeaturedVideo = async () => {
  const q = query(
    collection(db, COLLECTION_NAME), 
    where("isFeatured", "==", true),
    limit(1)
  );
  const querySnapshot = await getDocs(q);
  if (!querySnapshot.empty) {
    const d = querySnapshot.docs[0];
    return { id: d.id, ...d.data() };
  }
  return null;
};

export const createVideo = async (videoData) => {
  // Si marquem aquest com destacat, hauríem de treure el destacat dels altres (opcional, ho podem fer al dashboard)
  const docRef = await addDoc(collection(db, COLLECTION_NAME), {
    ...videoData,
    createdAt: new Date().toISOString()
  });
  return docRef.id;
};

export const updateVideo = async (id, videoData) => {
  const docRef = doc(db, COLLECTION_NAME, id);
  await updateDoc(docRef, {
    ...videoData,
    updatedAt: new Date().toISOString()
  });
};

export const deleteVideo = async (id) => {
  const docRef = doc(db, COLLECTION_NAME, id);
  await deleteDoc(docRef);
};
