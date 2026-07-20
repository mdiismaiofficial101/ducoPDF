import { NextRequest, NextResponse } from "next/server";
import { callOpenRouter } from "@/lib/openrouter";

export async function POST(req: NextRequest) {
  try {
    const { action, title, content, keyword } = await req.json();

    if (action === 'seo-audit') {
      const systemPrompt = "You are an SEO expert analyzing blog posts. Respond with valid JSON only.";
      const userPrompt = `Analyze this blog post for SEO. Return JSON:
{
  "score": <number 0-100>,
  "suggestions": ["suggestion1", "suggestion2"],
  "checks": [
    {"label": "Keyword in title", "pass": true},
    {"label": "Keyword in first paragraph", "pass": true},
    {"label": "Keyword density > 0.5%", "pass": true},
    {"label": "H1 tag present", "pass": true},
    {"label": "H2 tags present", "pass": true},
    {"label": "Content length > 500 words", "pass": true},
    {"label": "Internal links present", "pass": true},
    {"label": "Good readability", "pass": true}
  ]
}

Title: "${title}"
Focus Keyword: "${keyword || 'N/A'}"
Content: "${String(content || '').substring(0, 3000)}"`;

      const result = await callOpenRouter(systemPrompt, userPrompt, { temperature: 0.3, responseFormat: 'json' });
      return NextResponse.json({ result });
    }

    if (action === 'faq') {
      const systemPrompt = "You generate FAQ content as valid JSON arrays. Respond with JSON only.";
      const userPrompt = `Generate 4 FAQ questions and answers about "${keyword || title}". Return ONLY a valid JSON array:
[
  {"question": "Q1?", "answer": "A1"},
  {"question": "Q2?", "answer": "A2"},
  {"question": "Q3?", "answer": "A3"},
  {"question": "Q4?", "answer": "A4"}
]`;

      const result = await callOpenRouter(systemPrompt, userPrompt, { temperature: 0.5, responseFormat: 'json' });
      return NextResponse.json({ result });
    }

    if (action === 'meta') {
      const systemPrompt = "You generate SEO metadata as valid JSON. Respond with JSON only.";
      const userPrompt = `Given a blog title "${title}" and keyword "${keyword}", generate SEO metadata. Return JSON:
{
  "metaTitle": "<seo title 50-60 chars>",
  "metaDescription": "<meta description 120-160 chars>",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"]
}`;

      const result = await callOpenRouter(systemPrompt, userPrompt, { temperature: 0.5, responseFormat: 'json' });
      return NextResponse.json({ result });
    }

    if (action === 'chat') {
      const systemPrompt = (typeof prompt === 'string' && prompt.includes('SEO expert')) ? "You are an SEO expert. Respond with valid JSON only." : "You are a helpful assistant. Respond with valid JSON when requested.";
      const userPrompt = typeof prompt === 'string' ? prompt : String(prompt || '');
      const result = await callOpenRouter(systemPrompt, userPrompt, { temperature: 0.5 });
      return NextResponse.json({ result });
    }

    return NextResponse.json({ error: "Unsupported action." }, { status: 400 });
  } catch (error: any) {
    console.error("OpenRouter blog API error:", error);
    return NextResponse.json({ error: error.message || "Failed to process request." }, { status: 500 });
  }
}
