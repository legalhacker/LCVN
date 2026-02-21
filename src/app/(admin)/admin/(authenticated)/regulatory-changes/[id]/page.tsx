import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import RegulatoryChangeForm from "@/components/admin/RegulatoryChangeForm";

export const dynamic = "force-dynamic";

export default async function EditRegulatoryChangePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [change, fields] = await Promise.all([
    prisma.regulatoryChange.findUnique({
      where: { id },
      include: { fields: { include: { field: true } } },
    }),
    prisma.field.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!change) notFound();

  const initialData = {
    id: change.id,
    slug: change.slug,
    lawName: change.lawName,
    changeType: change.changeType,
    legalBasis: change.legalBasis,
    source: change.source,
    effectiveDate: change.effectiveDate.toISOString().split("T")[0],
    headline: change.headline,
    summary: change.summary,
    practicalImpact: change.practicalImpact,
    affectedParties: change.affectedParties,
    analysisSummary: change.analysisSummary || "",
    comparisonBefore: change.comparisonBefore || "",
    comparisonAfter: change.comparisonAfter || "",
    timeline: change.timeline || "",
    context: change.context || "",
    status: change.status,
    fieldIds: change.fields.map((f) => f.fieldId),
  };

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Edit Regulatory Change</h1>
      <RegulatoryChangeForm
        initialData={initialData}
        fields={fields}
      />
    </div>
  );
}
