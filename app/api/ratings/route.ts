import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

export async function POST(req: NextRequest) {
  try {
    const { toolId, rating, userEmail, userName, comment } = await req.json();

    if (!toolId || !rating || !userEmail || !userName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 });
    }

    const db = getAdminDb();
    const ratingsRef = db.collection('ratings');

    const existing = await ratingsRef
      .where('toolId', '==', toolId)
      .where('userEmail', '==', userEmail)
      .get();

    if (!existing.empty) {
      return NextResponse.json({ error: 'You have already rated this tool' }, { status: 409 });
    }

    await ratingsRef.add({
      toolId,
      rating,
      userEmail,
      userName,
      comment: comment || '',
      createdAt: Date.now(),
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Rating submit error:', err);
    return NextResponse.json({ error: err.message || 'Failed to submit rating' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const toolId = searchParams.get('toolId');
    const userEmail = searchParams.get('userEmail');

    if (!toolId) {
      return NextResponse.json({ error: 'toolId is required' }, { status: 400 });
    }

    const db = getAdminDb();
    const ratingsRef = db.collection('ratings');

    if (userEmail) {
      const snap = await ratingsRef
        .where('toolId', '==', toolId)
        .where('userEmail', '==', userEmail)
        .limit(1)
        .get();

      if (snap.empty) {
        return NextResponse.json({ rating: null });
      }
      const doc = snap.docs[0];
      return NextResponse.json({ rating: { id: doc.id, ...doc.data() } });
    }

    const snap = await ratingsRef.where('toolId', '==', toolId).get();

    const dist: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let sum = 0;

    snap.docs.forEach(d => {
      const r = d.data().rating;
      sum += r;
      dist[Math.min(5, Math.max(1, r))]++;
    });

    return NextResponse.json({
      summary: {
        average: snap.size > 0 ? Math.round((sum / snap.size) * 10) / 10 : 0,
        total: snap.size,
        distribution: dist,
      },
    });
  } catch (err: any) {
    console.error('Rating fetch error:', err);
    return NextResponse.json({ error: err.message || 'Failed to fetch ratings' }, { status: 500 });
  }
}
