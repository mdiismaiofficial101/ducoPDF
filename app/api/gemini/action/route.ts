import { NextRequest, NextResponse } from "next/server";
import { callOpenRouter } from "@/lib/openrouter";

export async function POST(req: NextRequest) {
  try {
    const { action, text, targetLanguage, imageBase64, mimeType } = await req.json();

    if (action === 'translate') {
      if (!text || typeof text !== 'string') {
        return NextResponse.json({ error: "No text content provided." }, { status: 400 });
      }
      if (!targetLanguage) {
        return NextResponse.json({ error: "No target language provided." }, { status: 400 });
      }

      const systemPrompt = "You are a professional translator. Translate text accurately while preserving the original formatting, tone, and paragraph structure. Output only the translated text with no extra commentary.";
      const userPrompt = `Translate the following text into ${targetLanguage}. Do not add any extra commentary or introductory text, just provide the exact translated text:\n\n${text}`;

      const result = await callOpenRouter(systemPrompt, userPrompt, { temperature: 0.3, maxTokens: 8192 });
      return NextResponse.json({ result });
    }

    if (action === 'ocr') {
      return NextResponse.json({ error: "OCR via API requires a multimodal model. Please use the client-side OCR (Tesseract.js) for image-based OCR." }, { status: 400 });
    }

    return NextResponse.json({ error: "Unsupported action." }, { status: 400 });
  } catch (error: any) {
    console.error("OpenRouter action API error:", error);
    return NextResponse.json({ error: error.message || "Failed to process action." }, { status: 500 });
  }
}
