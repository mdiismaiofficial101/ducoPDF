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
    const { text, pdfBase64, type = 'summary' } = await req.json();
    
    if (!text && !pdfBase64) {
      return NextResponse.json({ error: "No text or pdfBase64 content provided." }, { status: 400 });
    }

    let prompt = "";
    if (pdfBase64) {
      if (type === 'summary') {
        prompt = "Please provide a clear, comprehensive, and highly structured summary of this PDF document. Use bullet points and headers where appropriate, and highlight the key findings, main ideas, and action items.";
      } else if (type === 'bullets') {
        prompt = "Extract the key bullet points and high-level takeaways from this PDF document. Make them concise and highly actionable.";
      } else if (type === 'qa') {
        prompt = "Analyze this PDF document and generate a list of 5 important questions and answers based on its content to help the reader study or understand it better.";
      }

      const ai = getAI();
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: [
          {
            inlineData: {
              data: pdfBase64,
              mimeType: "application/pdf"
            }
          },
          prompt
        ]
      });

      return NextResponse.json({ result: response.text });
    } else {
      if (type === 'summary') {
        prompt = `Please provide a clear, comprehensive, and highly structured summary of the following extracted PDF text. Use bullet points and headers where appropriate, and highlight the key findings, main ideas, and action items:\n\n${text.substring(0, 40000)}`;
      } else if (type === 'bullets') {
        prompt = `Extract the key bullet points and high-level takeaways from the following extracted PDF text. Make them concise and highly actionable:\n\n${text.substring(0, 40000)}`;
      } else if (type === 'qa') {
        prompt = `Analyze the following extracted PDF text and generate a list of 5 important questions and answers based on its content to help the reader study or understand it better:\n\n${text.substring(0, 40000)}`;
      }

      const ai = getAI();
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
      });

      return NextResponse.json({ result: response.text });
    }
  } catch (error: any) {
    console.error("Gemini summarization error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate summary with Gemini." }, { status: 500 });
  }
}
