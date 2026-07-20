import { NextRequest, NextResponse } from "next/server";
import { callBazaarLink, BAZAARLINK_MODELS } from "@/lib/bazaarlink";

export async function POST(req: NextRequest) {
  try {
    const { action, prompt, title, content, keyword, model } = await req.json();

    const validModel = BAZAARLINK_MODELS.some(m => m.id === model)
      ? model
      : 'deepseek/deepseek-v4-flash:free';

    if (action === 'chat') {
      const systemPrompt = (typeof prompt === 'string' && prompt.includes('SEO expert'))
        ? "You are an SEO expert. Respond with valid JSON only."
        : "You are a helpful assistant. Respond with valid JSON when requested.";
      const userPrompt = typeof prompt === 'string' ? prompt : String(prompt || '');
      const result = await callBazaarLink(systemPrompt, userPrompt, { model: validModel, temperature: 0.5 });
      return NextResponse.json({ result });
    }

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

      const result = await callBazaarLink(systemPrompt, userPrompt, { model: validModel, temperature: 0.3, responseFormat: 'json' });
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

      const result = await callBazaarLink(systemPrompt, userPrompt, { model: validModel, temperature: 0.5, responseFormat: 'json' });
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

      const result = await callBazaarLink(systemPrompt, userPrompt, { model: validModel, temperature: 0.5, responseFormat: 'json' });
      return NextResponse.json({ result });
    }

    if (action === 'auto-seo') {
      const systemPrompt = "You are an expert SEO assistant. Respond with valid JSON only, no markdown.";
      const userPrompt = `Given a blog post, generate a complete SEO package as JSON. Rules:
- focusKeyword: 2-4 word primary keyword (lowercase)
- metaTitle: 50-60 characters, includes focus keyword
- metaDescription: 120-160 characters, includes focus keyword
- shortDescription: 50-160 characters summary
- imageAlt: descriptive alt text using focus keyword
- canonicalUrl: "https://cybronetwork.online/blog/${String(title || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').substring(0, 80)}"
- tags: exactly 5 relevant tags
- relatedTools: pick 3 from [Merge PDF, Split PDF, Compress PDF, Rotate PDF, PDF to Word, Word to PDF, JPG to PDF, PDF to JPG, Protect PDF, Unlock PDF, Watermark PDF, OCR PDF, Organize PDF, Crop PDF, AI Summarizer, Delete Pages, eSignature, Compare PDF, Repair PDF, Redact PDF]
- faq: array of 4 {question, answer} objects (answers 1-2 sentences)
- content: if the provided content already has <h1> and at least two <h2> headings and is 500+ words, return it unchanged. Otherwise, rewrite/improve the content by wrapping it with a single <h1> title heading and at least three <h2> section headings, ensuring 500+ words of useful content. Keep it as HTML.

Blog Title: "${title}"
Focus Keyword (if any): "${keyword || ''}"
Content: "${String(content || '').substring(0, 4000)}"

Return ONLY this JSON:
{
  "focusKeyword": "",
  "metaTitle": "",
  "metaDescription": "",
  "shortDescription": "",
  "imageAlt": "",
  "canonicalUrl": "",
  "tags": [],
  "relatedTools": [],
  "faq": [{"question":"","answer":""}],
  "content": ""
}`;

      const result = await callBazaarLink(systemPrompt, userPrompt, { model: validModel, temperature: 0.4, responseFormat: 'json', maxTokens: 4096 });
      return NextResponse.json({ result });
    }

    if (action === 'image-prompt') {
      const systemPrompt = "You are an expert at writing text-to-image prompts. Respond with valid JSON only, no markdown.";
      const userPrompt = `Write a detailed, high-quality text-to-image prompt (for Midjourney/Stable Diffusion/DALL-E) for a blog featured image. Make it visually specific, professional, and SEO-friendly.
Return ONLY this JSON:
{
  "prompt": "<detailed image prompt, 2-4 sentences, visually specific>",
  "negativePrompt": "<what to avoid, comma separated>"
}
Topic title: "${title}"
Focus keyword: "${keyword || ''}"`;

      const raw = await callBazaarLink(systemPrompt, userPrompt, { model: validModel, temperature: 0.6, responseFormat: 'json', maxTokens: 800 });
      let parsed: any = null;
      try {
        parsed = JSON.parse(raw.replace(/```json?/g, '').replace(/```/g, '').trim());
      } catch {
        const m = raw.match(/\{[\s\S]*\}/);
        if (m) parsed = JSON.parse(m[0]);
      }
      const promptText = parsed?.prompt || '';
      const negText = parsed?.negativePrompt || '';
      return NextResponse.json({ prompt: promptText, negativePrompt: negText });
    }

    return NextResponse.json({ error: "Unsupported action." }, { status: 400 });
  } catch (error: any) {
    console.error("BazaarLink API error:", error);
    return NextResponse.json({ error: error.message || "Failed to process request." }, { status: 500 });
  }
}
