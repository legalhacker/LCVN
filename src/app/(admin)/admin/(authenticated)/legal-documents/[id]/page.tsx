import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import LegalDocumentForm from "@/components/admin/LegalDocumentForm";

export const dynamic = "force-dynamic";

export default async function EditLegalDocumentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const doc = await prisma.legalDocument.findUnique({ where: { id } });

  if (!doc) notFound();

  const initialData = {
    id: doc.id,
    title: doc.title,
    canonicalId: doc.canonicalId,
    documentNumber: doc.documentNumber,
    documentType: doc.documentType,
    issuingBody: doc.issuingBody,
    issuedDate: doc.issuedDate.toISOString().split("T")[0],
    effectiveDate: doc.effectiveDate.toISOString().split("T")[0],
    slug: doc.slug,
    year: doc.year,
    status: doc.status,
  };

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Edit Legal Document</h1>
      <LegalDocumentForm initialData={initialData} />
    </div>
  );
}
