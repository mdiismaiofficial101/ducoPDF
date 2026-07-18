import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";
import fs from 'fs';
import path from 'path';

function getApiKey(): string {
  if (process.env.GEMINI_API_KEY) return process.env.GEMINI_API_KEY;
  try {
    const configPath = path.join(process.cwd(), '.admin-config.json');
    if (fs.existsSync(configPath)) {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
      if (config.geminiApiKey) return config.geminiApiKey;
    }
  } catch {}
  return '';
}

function getAI(): GoogleGenAI {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error('GEMINI_API_KEY environment variable is not configured');
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
}

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

      const prompt = `Translate the following text into ${targetLanguage}. Maintain the original formatting, tone, and paragraph structure as closely as possible. Do not add any extra commentary or introductory text, just provide the exact translated text:\n\n${text}`;

      const ai = getAI();
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
      });

      return NextResponse.json({ result: response.text });
    }

    if (action === 'ocr') {
      if (!imageBase64) {
        return NextResponse.json({ error: "No image content provided." }, { status: 400 });
      }

      const imagePart = {
        inlineData: {
          mimeType: mimeType || "image/jpeg",
          data: imageBase64,
        },
      };

      const prompt = "Perform optical character recognition (OCR) on this document image. Extract all text content, keeping columns, lists, tables, and spacing formatted exactly as they appear in the original document. Output only the extracted text with no other explanations:";

      const ai = getAI();
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: { parts: [imagePart, { text: prompt }] },
      });

      return NextResponse.json({ result: response.text });
    }

    return NextResponse.json({ error: "Unsupported action." }, { status: 400 });
  } catch (error: any) {
    console.error("Gemini action API error:", error);
    return NextResponse.json({ error: error.message || "Failed to process Gemini action." }, { status: 500 });
  }
}
