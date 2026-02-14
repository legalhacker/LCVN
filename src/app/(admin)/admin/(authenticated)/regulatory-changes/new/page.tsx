import { prisma } from "@/lib/prisma";
import RegulatoryChangeForm from "@/components/admin/RegulatoryChangeForm";

export const dynamic = "force-dynamic";

export default async function NewRegulatoryChangePage() {
  const [fields, legalDocuments] = await Promise.all([
    prisma.field.findMany({ orderBy: { name: "asc" } }),
    prisma.legalDocument.findMany({
      select: { id: true, title: true },
      orderBy: { title: "asc" },
    }),
  ]);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">New Regulatory Change</h1>
      <RegulatoryChangeForm fields={fields} legalDocuments={legalDocuments} />
    </div>
  );
}
