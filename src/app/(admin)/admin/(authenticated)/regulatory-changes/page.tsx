import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { auth } from "@/lib/auth";
import DeleteButton from "@/components/admin/DeleteButton";

export const dynamic = "force-dynamic";

export default async function RegulatoryChangesPage() {
  const session = await auth();
  const changes = await prisma.regulatoryChange.findMany({
    include: { fields: { include: { field: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Regulatory Changes</h1>
        <Link
          href="/admin/regulatory-changes/new"
          className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
        >
          New Change
        </Link>
      </div>

      <div className="overflow-hidden rounded-lg bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Headline</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Law</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Effective</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Type</th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {changes.map((change) => (
              <tr key={change.id} className="hover:bg-gray-50">
                <td className="max-w-xs truncate px-6 py-4 text-sm font-medium text-gray-900">
                  {change.headline}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">{change.lawName}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                    change.status === "published"
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}>
                    {change.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {change.effectiveDate.toLocaleDateString("vi-VN")}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">{change.changeType}</td>
                <td className="px-6 py-4 text-right text-sm">
                  <Link href={`/admin/regulatory-changes/${change.id}`}
                    className="text-blue-600 hover:text-blue-800 mr-3">
                    Edit
                  </Link>
                  {session?.user?.role === "admin" && (
                    <DeleteButton
                      endpoint={`/api/admin/regulatory-changes/${change.id}`}
                      label="Delete"
                    />
                  )}
                </td>
              </tr>
            ))}
            {changes.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-sm text-gray-500">
                  No regulatory changes yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
