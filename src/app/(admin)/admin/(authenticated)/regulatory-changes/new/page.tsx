import { prisma } from "@/lib/prisma";
import RegulatoryChangeForm from "@/components/admin/RegulatoryChangeForm";

export const dynamic = "force-dynamic";

export default async function NewRegulatoryChangePage() {
  const fields = await prisma.field.findMany({ orderBy: { name: "asc" } });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">New Regulatory Change</h1>
      <RegulatoryChangeForm fields={fields} />
    </div>
  );
}
