export interface QAUser {
  id: string;
  name: string;
  avatar: string;
}

export interface QAAnswer {
  id: string;
  body: string;
  author: QAUser;
  votes: number;
  isBestAnswer: boolean;
  createdAt: string;
  reports: string[];
}

export interface QAQuestion {
  id: string;
  title: string;
  body: string;
  tags: string[];
  category: string;
  author: QAUser;
  votes: number;
  answers: QAAnswer[];
  bestAnswerId: string | null;
  createdAt: string;
  viewCount: number;
  reports: string[];
}

function apiPath(path: string, searchParams?: Record<string, string>): string {
  const params = new URLSearchParams({ path });
  if (searchParams) {
    Object.entries(searchParams).forEach(([k, v]) => params.set(k, v));
  }
  return `/api/qa?${params.toString()}`;
}

async function apiFetch(path: string, options?: RequestInit): Promise<any> {
  const res = await fetch(apiPath(path), {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || "QA API error");
  }
  return res.json();
}

export async function getQAQuestions(params?: {
  search?: string;
  category?: string;
  sort?: string;
}): Promise<QAQuestion[]> {
  const sp: Record<string, string> = {};
  if (params?.search) sp.search = params.search;
  if (params?.category && params.category !== "all") sp.category = params.category;
  if (params?.sort) sp.sort = params.sort;
  const data = await apiFetch("", sp);
  return data.questions || [];
}

export async function getQAQuestion(id: string): Promise<QAQuestion | null> {
  try {
    const data = await apiFetch(`/questions/${id}`);
    return data.question || null;
  } catch {
    return null;
  }
}

export async function addQAQuestion(question: {
  title: string;
  body: string;
  category: string;
  tags: string[];
}): Promise<QAQuestion | null> {
  const data = await apiFetch("", {
    method: "POST",
    body: JSON.stringify(question),
  });
  return data.question || null;
}

export async function addQAAnswer(questionId: string, body: string): Promise<QAAnswer | null> {
  const data = await apiFetch(`/questions/${questionId}/answers`, {
    method: "POST",
    body: JSON.stringify({ body }),
  });
  return data.answer || null;
}

export async function voteQAQuestion(questionId: string, delta: 1 | -1): Promise<void> {
  await apiFetch(`/questions/${questionId}/vote`, {
    method: "POST",
    body: JSON.stringify({ delta }),
  });
}

export async function voteQAAnswer(answerId: string, delta: 1 | -1): Promise<void> {
  await apiFetch(`/answers/${answerId}/vote`, {
    method: "POST",
    body: JSON.stringify({ delta }),
  });
}

export async function markBestAnswer(questionId: string, answerId: string): Promise<void> {
  await apiFetch(`/questions/${questionId}/best-answer/${answerId}`, {
    method: "POST",
  });
}

export async function reportQAQuestion(questionId: string): Promise<void> {
  await apiFetch(`/questions/${questionId}/report`, {
    method: "POST",
  });
}

export async function reportQAAnswer(answerId: string): Promise<void> {
  await apiFetch(`/answers/${answerId}/report`, {
    method: "POST",
  });
}

export async function getQACategories(): Promise<string[]> {
  const data = await apiFetch("/categories");
  return data.categories || [];
}
