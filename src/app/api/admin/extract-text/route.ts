import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/admin-auth";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const { error, status } = await requireAuth();
  if (error) return NextResponse.json({ error }, { status });

  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const name = file.name.toLowerCase();
  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    let text = "";
    let fileType = "";

    if (name.endsWith(".docx") || name.endsWith(".doc")) {
      const mammoth = await import("mammoth");
      const result = await mammoth.extractRawText({ buffer });
      text = result.value;
      fileType = name.endsWith(".docx") ? "docx" : "doc";
    } else if (name.endsWith(".pdf")) {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const pdfParse = require("pdf-parse") as (buf: Buffer) => Promise<{ text: string }>;
      const result = await pdfParse(buffer);
      text = result.text;
      fileType = "pdf";
    } else {
      return NextResponse.json(
        { error: "Unsupported file type. Please upload .pdf, .doc, or .docx" },
        { status: 400 }
      );
    }

    return NextResponse.json({ text, fileType });
  } catch (err) {
    console.error("Text extraction error:", err);
    return NextResponse.json(
      { error: "Failed to extract text from file" },
      { status: 500 }
    );
  }
}
