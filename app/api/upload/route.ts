import { NextRequest, NextResponse } from "next/server";

const UPLOAD_URL = "https://img.cybronetwork.online/upload.php";

export async function POST(req: NextRequest) {
  try {
    const { base64, ext } = await req.json();
    if (!base64) {
      return NextResponse.json({ error: "No image data provided" }, { status: 400 });
    }

    const form = new URLSearchParams();
    form.set("base64", base64);
    form.set("ext", ext || "jpg");

    const res = await fetch(UPLOAD_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: form.toString(),
    });

    const text = await res.text();
    if (!res.ok) {
      return NextResponse.json({ error: "Upload failed: " + text }, { status: 502 });
    }

    let data: any;
    try {
      data = JSON.parse(text);
    } catch {
      return NextResponse.json({ error: "Invalid upload response" }, { status: 502 });
    }

    if (!data.url) {
      return NextResponse.json({ error: data.error || "No URL returned" }, { status: 502 });
    }

    return NextResponse.json({ url: data.url, success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Upload error" }, { status: 500 });
  }
}
