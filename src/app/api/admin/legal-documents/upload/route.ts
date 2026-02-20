import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/admin-auth";

const DOC_TYPE_MAP: Record<string, string> = {
  LAW: "luat", law: "luat", luat: "luat",
  DECREE: "nghi_dinh", decree: "nghi_dinh", nghi_dinh: "nghi_dinh",
  CIRCULAR: "thong_tu", circular: "thong_tu", thong_tu: "thong_tu",
  DECISION: "quyet_dinh", decision: "quyet_dinh", quyet_dinh: "quyet_dinh",
};

interface ArtData {
  number: number;
  title: string | null;
  content: string;
  chapter: string | null;
  section: string | null;
  clauses: ClData[];
}
interface ClData {
  number: number;
  content: string;
  points: PtData[];
}
interface PtData {
  letter: string;
  content: string;
}

export async function POST(req: Request) {
  const { error: authError, status: authStatus } = await requireAuth();
  if (authError) return NextResponse.json({ error: authError }, { status: authStatus });

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

  // Read form field overrides (sent alongside the file from the merged form)
  const fTitle = str(formData.get("title"));
  const fCanonicalId = str(formData.get("canonicalId"));
  const fDocumentNumber = str(formData.get("documentNumber"));
  const fDocumentType = str(formData.get("documentType"));
  const fIssuingBody = str(formData.get("issuingBody"));
  const fIssuedDate = str(formData.get("issuedDate"));
  const fEffectiveDate = str(formData.get("effectiveDate"));
  const fSlug = str(formData.get("slug"));
  const fYear = formData.get("year") ? parseInt(formData.get("year") as string) : 0;
  const fStatus = str(formData.get("status"));

  // Map metadata from JSON — form field values override JSON values
  const temporal = (obj.temporal || {}) as Record<string, unknown>;

  const title = fTitle || str(obj.title);
  const canonicalId = fCanonicalId || str(obj.document_id) || str(obj.canonicalId);
  const documentNumber = fDocumentNumber || str(obj.document_number) || str(obj.documentNumber);
  const rawDocType = fDocumentType || str(obj.document_type) || str(obj.documentType);
  const documentType = DOC_TYPE_MAP[rawDocType] || rawDocType;
  const issuingBody = fIssuingBody || str(obj.issuing_authority) || str(obj.issuingBody);
  const year = fYear || num(obj.year);

  const effectiveDate =
    fEffectiveDate ||
    str(obj.effective_date) ||
    str(temporal.effective_from) ||
    str(obj.effectiveDate) ||
    str(obj.signing_date) ||
    new Date().toISOString().split("T")[0];
  const issuedDate =
    fIssuedDate ||
    str(obj.signing_date) || str(obj.issuedDate) || effectiveDate;
  const slug = fSlug || str(obj.slug) || slugify(title, year);
  const status = fStatus || "active";

  // Validate required fields
  const missing: string[] = [];
  if (!title) missing.push("title");
  if (!canonicalId) missing.push("document_id / canonicalId");
  if (!documentNumber) missing.push("document_number / documentNumber");
  if (!documentType) missing.push(`document_type (got "${rawDocType}")`);
  if (!issuingBody) missing.push("issuing_authority / issuingBody");
  if (!year) missing.push("year");
  if (missing.length > 0) {
    return NextResponse.json(
      { error: `Missing fields: ${missing.join(", ")}` },
      { status: 400 },
    );
  }

  // Extract articles from chapters hierarchy and/or flat articles array
  const articles: ArtData[] = [];

  function extractArticle(
    art: Record<string, unknown>,
    chapter: string | null,
    section: string | null,
  ) {
    const raw = art.number ?? art.articleNumber;
    if (raw === undefined || raw === null) return;
    const articleNumber =
      typeof raw === "number" ? raw : parseInt(String(raw), 10);
    if (isNaN(articleNumber)) return;

    const clauses: ClData[] = [];
    for (const cl of asArray(art.clauses)) {
      const c = cl as Record<string, unknown>;
      const cRaw = c.number ?? c.clauseNumber;
      if (cRaw === undefined || cRaw === null) continue;
      const clauseNumber =
        typeof cRaw === "number" ? cRaw : parseInt(String(cRaw), 10);
      if (isNaN(clauseNumber)) continue;

      const points: PtData[] = [];
      for (const pt of asArray(c.points)) {
        const p = pt as Record<string, unknown>;
        const pRaw = p.number ?? p.pointLetter;
        if (pRaw === undefined || pRaw === null) continue;
        points.push({
          letter: String(pRaw).charAt(0).toLowerCase(),
          content: str(p.text_clean) || str(p.text_raw) || str(p.content),
        });
      }

      clauses.push({
        number: clauseNumber,
        content: str(c.text_clean) || str(c.text_raw) || str(c.content),
        points,
      });
    }

    articles.push({
      number: articleNumber,
      title: str(art.title) || str(art.text_clean) || null,
      content: str(art.text_clean) || str(art.text_raw) || str(art.content),
      chapter,
      section,
      clauses,
    });
  }

  // From chapters → sections → articles hierarchy
  for (const ch of asArray(obj.chapters)) {
    const chapter = ch as Record<string, unknown>;
    const chLabel = chapter.title
      ? `Chương ${chapter.number || ""}: ${chapter.title}`
      : null;

    for (const art of asArray(chapter.articles))
      extractArticle(art as Record<string, unknown>, chLabel, null);

    for (const sec of asArray(chapter.sections)) {
      const section = sec as Record<string, unknown>;
      const secLabel = section.title
        ? `Mục ${section.number || ""}: ${section.title}`
        : null;
      for (const art of asArray(section.articles))
        extractArticle(art as Record<string, unknown>, chLabel, secLabel);
    }
  }

  // From flat articles array
  for (const art of asArray(obj.articles))
    extractArticle(art as Record<string, unknown>, null, null);

  articles.sort((a, b) => a.number - b.number);

  // Save to DB: delete-then-create strategy
  try {
    const result = await prisma.$transaction(
      async (tx) => {
        // If document already exists, delete it entirely.
        // DB-level ON DELETE CASCADE removes all Articles → Clauses → Points.
        const existing = await tx.legalDocument.findUnique({
          where: { canonicalId },
          select: { id: true },
        });
        if (existing) {
          await tx.legalDocument.delete({ where: { id: existing.id } });
        }

        // Create fresh document with all nested data
        const legalDoc = await tx.legalDocument.create({
          data: {
            canonicalId,
            title,
            documentNumber,
            documentType: documentType as
              | "luat"
              | "nghi_dinh"
              | "thong_tu"
              | "quyet_dinh",
            issuingBody,
            issuedDate: new Date(issuedDate),
            effectiveDate: new Date(effectiveDate),
            slug,
            year,
            status: status as "active" | "amended" | "repealed",
          },
        });

        // Create articles, clauses, points
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

        return legalDoc;
      },
      { timeout: 60000 },
    );

    return NextResponse.json(
      {
        id: result.id,
        canonicalId: result.canonicalId,
        title: result.title,
        articleCount: articles.length,
      },
      { status: 201 },
    );
  } catch (e) {
    console.error("Upload error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to save document" },
      { status: 500 },
    );
  }
}

// --- helpers ---

function str(v: unknown): string {
  return typeof v === "string" ? v : "";
}

function num(v: unknown): number {
  return typeof v === "number" ? v : 0;
}

function asArray(v: unknown): unknown[] {
  return Array.isArray(v) ? v : [];
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
