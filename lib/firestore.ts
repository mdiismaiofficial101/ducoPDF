import { getFirestore, collection, doc, getDoc, getDocs, setDoc, deleteDoc } from 'firebase/firestore';
import { app } from '@/lib/firebase';
import firebaseConfig from '@/firebase-applet-config.json';

let db: ReturnType<typeof getFirestore> | null = null;

if (app) {
  db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
}

const OVERRIDES_COLLECTION = 'seo_overrides';

export interface SeoOverride {
  pageKey: string;
  title: string;
  description: string;
  updatedAt: number;
  updatedBy?: string;
}

export async function getSeoOverrides(): Promise<SeoOverride[]> {
  if (!db) return [];
  try {
    const snap = await getDocs(collection(db, OVERRIDES_COLLECTION));
    return snap.docs.map(d => ({ pageKey: d.id, ...d.data() } as SeoOverride));
  } catch {
    return [];
  }
}

export async function getSeoOverride(pageKey: string): Promise<SeoOverride | null> {
  if (!db) return null;
  try {
    const snap = await getDoc(doc(db, OVERRIDES_COLLECTION, pageKey));
    if (!snap.exists()) return null;
    return { pageKey: snap.id, ...snap.data() } as SeoOverride;
  } catch {
    return null;
  }
}

export async function saveSeoOverride(pageKey: string, data: { title: string; description: string; updatedBy?: string }): Promise<void> {
  if (!db) throw new Error('Firestore not initialized');
  await setDoc(doc(db, OVERRIDES_COLLECTION, pageKey), {
    title: data.title,
    description: data.description,
    updatedAt: Date.now(),
    updatedBy: data.updatedBy || '',
  });
}

export async function deleteSeoOverride(pageKey: string): Promise<void> {
  if (!db) throw new Error('Firestore not initialized');
  await deleteDoc(doc(db, OVERRIDES_COLLECTION, pageKey));
}

export function getDb() {
  return db;
}
