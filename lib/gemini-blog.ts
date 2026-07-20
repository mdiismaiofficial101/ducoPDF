const API_KEY_STORAGE = 'docupdf_gemini_key';

function extractJSON(text: string): any {
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try { return JSON.parse(jsonMatch[0]); } catch {}
  }
  return null;
}

function extractJSONArray(text: string): any {
  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (jsonMatch) {
    try { return JSON.parse(jsonMatch[0]); } catch {}
  }
  return null;
}

async function callBlogAI(action: string, payload: Record<string, any>): Promise<string | null> {
  try {
    const res = await fetch('/api/gemini/blog', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, ...payload }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.result || null;
  } catch {
    return null;
  }
}

export async function runSEOAudit(title: string, content: string, keyword: string): Promise<{
  score: number;
  suggestions: string[];
  checks: Array<{ label: string; pass: boolean }>;
}> {
  const result = await callBlogAI('seo-audit', { title, content, keyword });
  if (!result) {
    return { score: 0, suggestions: ['AI service unavailable. Configure OPENROUTER_API_KEY.'], checks: [] };
  }
  const parsed = extractJSON(result);
  if (parsed) {
    return {
      score: parsed.score || 50,
      suggestions: parsed.suggestions || [],
      checks: parsed.checks || [],
    };
  }
  return { score: 50, suggestions: ['Could not parse AI response'], checks: [] };
}

export async function generateFAQ(keyword: string, title: string): Promise<Array<{ question: string; answer: string }>> {
  const result = await callBlogAI('faq', { keyword, title });
  if (!result) return [];
  const parsed = extractJSONArray(result);
  return Array.isArray(parsed) ? parsed : [];
}

export async function generateMetaSuggestions(title: string, content: string, keyword: string): Promise<{
  metaTitle: string;
  metaDescription: string;
  tags: string[];
}> {
  const result = await callBlogAI('meta', { title, content, keyword });
  if (!result) return { metaTitle: '', metaDescription: '', tags: [] };
  const parsed = extractJSON(result);
  return parsed || { metaTitle: '', metaDescription: '', tags: [] };
}

export function extractTOC(content: string): Array<{ level: number; text: string; id: string }> {
  const headings: Array<{ level: number; text: string; id: string }> = [];
  const regex = /<h([23])[^>]*>(.*?)<\/h[23]>/gi;
  let match;
  while ((match = regex.exec(content)) !== null) {
    const level = parseInt(match[1]);
    const text = match[2].replace(/<[^>]*>/g, '').trim();
    const id = text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
    headings.push({ level, text, id });
  }
  return headings;
}
