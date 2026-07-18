const API_KEY_STORAGE = 'docupdf_gemini_key';

function getApiKey(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(API_KEY_STORAGE) || '';
}

function extractJSON(text: string): any {
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try { return JSON.parse(jsonMatch[0]); } catch {}
  }
  return null;
}

export async function runSEOAudit(title: string, content: string, keyword: string): Promise<{
  score: number;
  suggestions: string[];
  checks: Array<{ label: string; pass: boolean }>;
}> {
  const apiKey = getApiKey();
  if (!apiKey) {
    return { score: 0, suggestions: ['Set your Gemini API key in Admin Settings'], checks: [] };
  }

  const prompt = `You are an SEO expert analyzing a blog post. Provide a JSON response only.

Title: "${title}"
Focus Keyword: "${keyword || 'N/A'}"
Content: "${content.substring(0, 3000)}"

Analyze and return JSON:
{
  "score": <number 0-100>,
  "suggestions": ["suggestion1", "suggestion2"],
  "checks": [
    {"label": "Keyword in title", "pass": true/false},
    {"label": "Keyword in first paragraph", "pass": true/false},
    {"label": "Keyword density > 0.5%", "pass": true/false},
    {"label": "H1 tag present", "pass": true/false},
    {"label": "H2 tags present", "pass": true/false},
    {"label": "Content length > 500 words", "pass": true/false},
    {"label": "Internal links present", "pass": true/false},
    {"label": "Good readability", "pass": true/false}
  ]
}`;

  try {
    const res = await fetch('https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
    });

    if (!res.ok) throw new Error('API request failed');
    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const parsed = extractJSON(text);

    if (parsed) {
      return {
        score: parsed.score || 50,
        suggestions: parsed.suggestions || [],
        checks: parsed.checks || [],
      };
    }
    return { score: 50, suggestions: ['Could not parse AI response'], checks: [] };
  } catch (err: any) {
    return { score: 0, suggestions: [`AI Audit error: ${err.message}`], checks: [] };
  }
}

export async function generateFAQ(keyword: string, title: string): Promise<Array<{ question: string; answer: string }>> {
  const apiKey = getApiKey();
  if (!apiKey) return [];

  const prompt = `Generate 4 FAQ questions and answers about "${keyword || title}". Return ONLY valid JSON array:
[
  {"question": "Q1?", "answer": "A1"},
  {"question": "Q2?", "answer": "A2"},
  {"question": "Q3?", "answer": "A3"},
  {"question": "Q4?", "answer": "A4"}
]`;

  try {
    const res = await fetch('https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
    });

    if (!res.ok) throw new Error('API request failed');
    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch {}
    }
    return [];
  } catch {
    return [];
  }
}

export async function generateMetaSuggestions(title: string, content: string, keyword: string): Promise<{
  metaTitle: string;
  metaDescription: string;
  tags: string[];
}> {
  const apiKey = getApiKey();
  if (!apiKey) {
    return { metaTitle: '', metaDescription: '', tags: [] };
  }

  const prompt = `Given a blog title "${title}" and keyword "${keyword}", generate SEO metadata. Return JSON:
{
  "metaTitle": "<seo title 50-60 chars>",
  "metaDescription": "<meta description 120-160 chars>",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"]
}`;

  try {
    const res = await fetch('https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
    });

    if (!res.ok) throw new Error('API request failed');
    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const parsed = extractJSON(text);
    return parsed || { metaTitle: '', metaDescription: '', tags: [] };
  } catch {
    return { metaTitle: '', metaDescription: '', tags: [] };
  }
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
