import { getFirestore, collection, addDoc, getDocs, query, where, orderBy, limit as firestoreLimit } from 'firebase/firestore';
import { app } from '@/lib/firebase';
import firebaseConfig from '@/firebase-applet-config.json';

let db: ReturnType<typeof getFirestore> | null = null;
if (app) {
  db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
}

export interface Rating {
  id?: string;
  toolId: string;
  rating: number;
  userEmail: string;
  userName: string;
  comment?: string;
  createdAt: number;
}

export interface ToolRatingSummary {
  average: number;
  total: number;
  distribution: Record<number, number>;
}

export async function submitRating(toolId: string, rating: number, userEmail: string, userName: string, comment?: string): Promise<void> {
  if (!db) throw new Error('Firestore not initialized');
  if (rating < 1 || rating > 5) throw new Error('Rating must be between 1 and 5');

  const existing = await getUserRating(toolId, userEmail);
  if (existing) {
    throw new Error('You have already rated this tool');
  }

  await addDoc(collection(db, 'ratings'), {
    toolId,
    rating,
    userEmail,
    userName,
    comment: comment || '',
    createdAt: Date.now(),
  });
}

export async function getUserRating(toolId: string, userEmail: string): Promise<Rating | null> {
  if (!db) return null;
  try {
    const q = query(
      collection(db, 'ratings'),
      where('toolId', '==', toolId),
      where('userEmail', '==', userEmail)
    );
    const snap = await getDocs(q);
    if (snap.empty) return null;
    const doc = snap.docs[0];
    return { id: doc.id, ...doc.data() } as Rating;
  } catch {
    return null;
  }
}

export async function getToolRatings(toolId: string): Promise<ToolRatingSummary> {
  const empty: ToolRatingSummary = { average: 0, total: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } };
  if (!db) return empty;
  try {
    const q = query(collection(db, 'ratings'), where('toolId', '==', toolId));
    const snap = await getDocs(q);
    if (snap.empty) return empty;

    let sum = 0;
    const dist: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    snap.docs.forEach(d => {
      const r = (d.data() as Rating).rating;
      sum += r;
      dist[Math.min(5, Math.max(1, r))]++;
    });

    return {
      average: Math.round((sum / snap.size) * 10) / 10,
      total: snap.size,
      distribution: dist,
    };
  } catch {
    return empty;
  }
}

export async function getRecentRatings(toolId: string, maxCount: number = 5): Promise<Rating[]> {
  if (!db) return [];
  try {
    const q = query(
      collection(db, 'ratings'),
      where('toolId', '==', toolId),
      orderBy('createdAt', 'desc'),
      firestoreLimit(maxCount)
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Rating));
  } catch {
    return [];
  }
}
