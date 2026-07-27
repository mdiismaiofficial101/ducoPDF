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
  if (rating < 1 || rating > 5) throw new Error('Rating must be between 1 and 5');

  const res = await fetch('/api/ratings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ toolId, rating, userEmail, userName, comment }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to submit rating');
}

export async function getUserRating(toolId: string, userEmail: string): Promise<Rating | null> {
  try {
    const res = await fetch(`/api/ratings?toolId=${encodeURIComponent(toolId)}&userEmail=${encodeURIComponent(userEmail)}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    return data.rating || null;
  } catch {
    return null;
  }
}

export async function getToolRatings(toolId: string): Promise<ToolRatingSummary> {
  const empty = { average: 0, total: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } };
  try {
    const res = await fetch(`/api/ratings?toolId=${encodeURIComponent(toolId)}`);
    const data = await res.json();
    if (!res.ok) return empty;
    return data.summary;
  } catch {
    return empty;
  }
}
