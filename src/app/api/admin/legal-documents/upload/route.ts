import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/admin-auth";
import { parseJsonDocument } from "@/lib/parsers/json-parser";
import { parseTextDocument } from "@/lib/parsers/text-parser";
import type { ParsedDocument } from "@/lib/parsers/types";
import { Prisma } from "@prisma/client";

export async function POST(req: Request) {
  const { error, status } = await requireAuth();
  if (error) return NextResponse.json({ error }, { status });

  const contentType = req.headers.get("content-type") || "";

  // Save mode: receives JSON body with parsed document
  if (contentType.includes("application/json")) {
    return handleSave(req);
  }

  // Preview mode: receives FormData with file
  if (contentType.includes("multipart/form-data")) {
    return handlePreview(req);
  }

  return NextResponse.json({ error: "Unsupported content type" }, { status: 400 });
}

async function handlePreview(req: Request) {
  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const text = await file.text();
  const fileName = file.name.toLowerCase();

  if (fileName.endsWith(".json")) {
    const result = parseJsonDocument(text);
    return NextResponse.json(result);
  }

  if (fileName.endsWith(".txt")) {
    const metadataRaw = formData.get("metadata") as string | null;
    if (!metadataRaw) {
      return NextResponse.json(
        { error: "Metadata is required for .txt files" },
        { status: 400 }
      );
    }

    let metadata;
    try {
      metadata = JSON.parse(metadataRaw);
    } catch {
      return NextResponse.json({ error: "Invalid metadata JSON" }, { status: 400 });
    }

    const result = parseTextDocument(text, metadata);
    return NextResponse.json(result);
  }

  return NextResponse.json(
    { error: "Unsupported file type. Use .json or .txt" },
    { status: 400 }
  );
}

async function handleSave(req: Request) {
  const body = await req.json();
  const doc = body.document as ParsedDocument;

  if (!doc || !doc.canonicalId || !doc.articles) {
    return NextResponse.json({ error: "Invalid document data" }, { status: 400 });
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const legalDoc = await tx.legalDocument.create({
        data: {
          canonicalId: doc.canonicalId,
          title: doc.title,
          documentNumber: doc.documentNumber,
          documentType: doc.documentType,
          issuingBody: doc.issuingBody,
          issuedDate: new Date(doc.issuedDate),
          effectiveDate: new Date(doc.effectiveDate),
          slug: doc.slug,
          year: doc.year,
          status: doc.status || "active",
        },
      });

      for (const art of doc.articles) {
        const articleCanonicalId = `${doc.canonicalId}_D${art.articleNumber}`;
        const article = await tx.article.create({
          data: {
            canonicalId: articleCanonicalId,
            documentId: legalDoc.id,
            articleNumber: art.articleNumber,
            title: art.title,
            content: art.content,
            chapter: art.chapter,
            section: art.section,
          },
        });

        for (const cl of art.clauses) {
          const clauseCanonicalId = `${articleCanonicalId}_K${cl.clauseNumber}`;
          const clause = await tx.clause.create({
            data: {
              canonicalId: clauseCanonicalId,
              articleId: article.id,
              clauseNumber: cl.clauseNumber,
              content: cl.content,
            },
          });

          for (const pt of cl.points) {
            const pointCanonicalId = `${clauseCanonicalId}_${pt.pointLetter.toUpperCase()}`;
            await tx.point.create({
              data: {
                canonicalId: pointCanonicalId,
                clauseId: clause.id,
                pointLetter: pt.pointLetter,
                content: pt.content,
              },
            });
          }
        }
      }

      return legalDoc;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      const target = (e.meta?.target as string[])?.join(", ") || "unknown field";
      return NextResponse.json(
        { error: `Duplicate value for: ${target}. A document with this canonicalId or slug may already exist.` },
        { status: 409 }
      );
    }
    throw e;
  }
}
