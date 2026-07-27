import { NextRequest, NextResponse } from "next/server";
import { QA_API_URL } from "@/lib/qa-server-config";

export const dynamic = "force-dynamic";

async function proxy(req: NextRequest, method: string) {
  try {
    const url = new URL(req.url);
    const path = url.searchParams.get("path") || "";
    const target = `${QA_API_URL}${path}`;
    const headers: Record<string, string> = { "Content-Type": "application/json" };

    const options: RequestInit = {
      method,
      headers,
      cache: "no-store",
    };

    if (method !== "GET" && method !== "HEAD") {
      const body = await req.text();
      options.body = body;
    }

    const res = await fetch(target, options);
    const text = await res.text();

    return new NextResponse(text, {
      status: res.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "QA API error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) { return proxy(req, "GET"); }
export async function POST(req: NextRequest) { return proxy(req, "POST"); }
export async function PUT(req: NextRequest) { return proxy(req, "PUT"); }
export async function DELETE(req: NextRequest) { return proxy(req, "DELETE"); }
