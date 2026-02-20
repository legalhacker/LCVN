import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/admin-auth";
import { Prisma } from "@prisma/client";

const DOC_TYPE_MAP: Record<string, string> = {
  LAW: "luat", law: "luat", luat: "luat",
  DECREE: "nghi_dinh", decree: "nghi_dinh", nghi_dinh: "nghi_dinh",
  CIRCULAR: "thong_tu", circular: "thong_tu", thong_tu: "thong_tu",
  DECISION: "quyet_dinh", decision: "quyet_dinh", quyet_dinh: "quyet_dinh",
};

export async function POST(req: Request) {
  const { error, status } = await requireAuth();
  if (error) return NextResponse.json({ error }, { status });

  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  let obj: Record<string, unknown>;
  try {
    obj = JSON.parse(await file.text());
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Map metadata from external format
  const title = (obj.title as string) || "";
  const canonicalId = (obj.document_id as string) || (obj.canonicalId as string) || "";
  const documentNumber = (obj.document_number as string) || (obj.documentNumber as string) || "";
  const rawDocType = (obj.document_type as string) || (obj.documentType as string) || "";
  const documentType = DOC_TYPE_MAP[rawDocType];
  const issuingBody = (obj.issuing_authority as string) || (obj.issuingBody as string) || "";
  const year = (obj.year as number) || 0;

  const temporal = (obj.temporal || {}) as Record<string, unknown>;
  const effectiveDate = (obj.effective_date as string) || (temporal.effective_from as string) || (obj.effectiveDate as string) || (obj.signing_date as string) || new Date().toISOString().split("T")[0];
  const issuedDate = (obj.signing_date as string) || (obj.issuedDate as string) || effectiveDate;
  const slug = (obj.slug as string) || slugify(title, year);

  // Validate minimum required
  const missing: string[] = [];
  if (!title) missing.push("title");
  if (!canonicalId) missing.push("document_id");
  if (!documentNumber) missing.push("document_number");
  if (!documentType) missing.push(`document_type (got "${rawDocType}")`);
  if (!issuingBody) missing.push("issuing_authority");
  if (!year) missing.push("year");

  if (missing.length > 0) {
    return NextResponse.json({ error: `Missing fields: ${missing.join(", ")}` }, { status: 400 });
  }

  // Collect articles from chapters → sections → articles hierarchy, or flat articles
  interface ArtData { number: number; title: string | null; content: string; chapter: string | null; section: string | null; clauses: ClData[] }
  interface ClData { number: number; content: string; points: PtData[] }
  interface PtData { letter: string; content: string }

  const articles: ArtData[] = [];

  function extractArticle(art: Record<string, unknown>, chapter: string | null, section: string | null) {
    const num = art.number ?? art.articleNumber;
    if (num === undefined || num === null) return;
    const articleNumber = typeof num === "number" ? num : parseInt(String(num), 10);
    if (isNaN(articleNumber)) return;

    const clauses: ClData[] = [];
    for (const cl of (Array.isArray(art.clauses) ? art.clauses : [])) {
      const c = cl as Record<string, unknown>;
      const cNum = c.number ?? c.clauseNumber;
      if (cNum === undefined || cNum === null) continue;
      const clauseNumber = typeof cNum === "number" ? cNum : parseInt(String(cNum), 10);
      if (isNaN(clauseNumber)) continue;

      const points: PtData[] = [];
      for (const pt of (Array.isArray(c.points) ? c.points : [])) {
        const p = pt as Record<string, unknown>;
        const pNum = p.number ?? p.pointLetter;
        if (pNum === undefined || pNum === null) continue;
        points.push({
          letter: String(pNum).charAt(0).toLowerCase(),
          content: (p.text_clean as string) || (p.text_raw as string) || (p.content as string) || "",
        });
      }

      clauses.push({
        number: clauseNumber,
        content: (c.text_clean as string) || (c.text_raw as string) || (c.content as string) || "",
        points,
      });
    }

    articles.push({
      number: articleNumber,
      title: (art.title as string) || (art.text_clean as string) || null,
      content: (art.text_clean as string) || (art.text_raw as string) || (art.content as string) || "",
      chapter,
      section,
      clauses,
    });
  }

  // From chapters hierarchy
  for (const ch of (Array.isArray(obj.chapters) ? obj.chapters : [])) {
    const chapter = ch as Record<string, unknown>;
    const chLabel = chapter.title ? `Chương ${chapter.number || ""}: ${chapter.title}` : null;

    for (const art of (Array.isArray(chapter.articles) ? chapter.articles : []))
      extractArticle(art as Record<string, unknown>, chLabel, null);

    for (const sec of (Array.isArray(chapter.sections) ? chapter.sections : [])) {
      const section = sec as Record<string, unknown>;
      const secLabel = section.title ? `Mục ${section.number || ""}: ${section.title}` : null;
      for (const art of (Array.isArray(section.articles) ? section.articles : []))
        extractArticle(art as Record<string, unknown>, chLabel, secLabel);
    }
  }

  // From flat articles array
  for (const art of (Array.isArray(obj.articles) ? obj.articles : []))
    extractArticle(art as Record<string, unknown>, null, null);

  articles.sort((a, b) => a.number - b.number);

  // Save to DB (upsert: update existing document if canonicalId matches)
  try {
    const result = await prisma.$transaction(async (tx) => {
      // Check if document already exists
      const existing = await tx.legalDocument.findUnique({ where: { canonicalId } });

      let legalDoc;
      if (existing) {
        // Delete old articles (cascades to clauses → points)
        await tx.article.deleteMany({ where: { documentId: existing.id } });
        legalDoc = await tx.legalDocument.update({
          where: { canonicalId },
          data: {
            title,
            documentNumber,
            documentType: documentType as "luat" | "nghi_dinh" | "thong_tu" | "quyet_dinh",
            issuingBody,
            issuedDate: new Date(issuedDate),
            effectiveDate: new Date(effectiveDate),
            slug,
            year,
          },
        });
      } else {
        legalDoc = await tx.legalDocument.create({
          data: {
            canonicalId,
            title,
            documentNumber,
            documentType: documentType as "luat" | "nghi_dinh" | "thong_tu" | "quyet_dinh",
            issuingBody,
            issuedDate: new Date(issuedDate),
            effectiveDate: new Date(effectiveDate),
            slug,
            year,
            status: "active",
          },
        });
      }

      for (const art of articles) {
        const artCid = `${canonicalId}_D${art.number}`;
        const article = await tx.article.create({
          data: {
            canonicalId: artCid,
            documentId: legalDoc.id,
            articleNumber: art.number,
            title: art.title,
            content: art.content,
            chapter: art.chapter,
            section: art.section,
          },
        });

        for (const cl of art.clauses) {
          const clCid = `${artCid}_K${cl.number}`;
          const clause = await tx.clause.create({
            data: {
              canonicalId: clCid,
              articleId: article.id,
              clauseNumber: cl.number,
              content: cl.content,
            },
          });

          for (const pt of cl.points) {
            await tx.point.create({
              data: {
                canonicalId: `${clCid}_${pt.letter.toUpperCase()}`,
                clauseId: clause.id,
                pointLetter: pt.letter,
                content: pt.content,
              },
            });
          }
        }
      }

      return { ...legalDoc, _updated: !!existing, _counts: { articles: articles.length } };
    }, { timeout: 30000 });

    return NextResponse.json(result, { status: 201 });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      const target = (e.meta?.target as string[])?.join(", ") || "unknown field";
      return NextResponse.json(
        { error: `Duplicate: ${target}. Document with this ID or slug may already exist.` },
        { status: 409 }
      );
    }
    console.error("Upload error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to save" },
      { status: 500 }
    );
  }
}

function slugify(title: string, year: number): string {
  const s = title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return year ? `${s}-${year}` : s;
}
