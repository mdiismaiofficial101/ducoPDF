import { NextRequest, NextResponse } from "next/server";
import { callOpenRouter } from "@/lib/openrouter";

export async function POST(req: NextRequest) {
  try {
    const { text, pdfBase64, type = 'summary' } = await req.json();

    if (!text && !pdfBase64) {
      return NextResponse.json({ error: "No text or pdfBase64 content provided." }, { status: 400 });
    }

    let systemPrompt = "You are a helpful document assistant. Provide clear, well-structured responses. Use bullet points and headers where appropriate.";

    let userPrompt: string;
    if (pdfBase64) {
      // pdfBase64 can't be sent as text easily; summarize from extracted text if available
      return NextResponse.json({ error: "PDF direct upload summarization requires extracted text. Please provide 'text'." }, { status: 400 });
    } else {
      const truncated = (text || '').substring(0, 40000);
      if (type === 'summary') {
        systemPrompt = "You are a professional document summarizer. Provide a clear, comprehensive, and highly structured summary. Use headers, bullet points, and highlight key findings, main ideas, and action items.";
        userPrompt = `Summarize the following document:\n\n${truncated}`;
      } else if (type === 'bullets') {
        systemPrompt = "You extract concise, actionable bullet points from documents.";
        userPrompt = `Extract the key bullet points and high-level takeaways from this document. Make them concise and actionable:\n\n${truncated}`;
      } else if (type === 'qa') {
        systemPrompt = "You create study questions and answers from documents.";
        userPrompt = `Generate a list of 5 important questions and answers based on this document to help the reader study or understand it better:\n\n${truncated}`;
      } else {
        systemPrompt = "You are a helpful document assistant.";
        userPrompt = `Analyze and describe this document:\n\n${truncated}`;
      }
    }

    const result = await callOpenRouter(systemPrompt, userPrompt, { temperature: 0.5, maxTokens: 4096 });
    return NextResponse.json({ result });
  } catch (error: any) {
    console.error("OpenRouter summarization error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate summary." }, { status: 500 });
  }
}
