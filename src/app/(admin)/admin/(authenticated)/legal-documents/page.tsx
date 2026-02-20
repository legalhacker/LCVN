import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { auth } from "@/lib/auth";
import DeleteButton from "@/components/admin/DeleteButton";

export const dynamic = "force-dynamic";

export default async function LegalDocumentsPage() {
  const session = await auth();
  const docs = await prisma.legalDocument.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Legal Documents</h1>
        <div className="flex gap-3">
          <Link
            href="/admin/legal-documents/upload"
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Upload
          </Link>
          <Link
            href="/admin/legal-documents/new"
            className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
          >
            New Document
          </Link>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Number</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Effective</th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {docs.map((doc) => (
              <tr key={doc.id} className="hover:bg-gray-50">
                <td className="max-w-xs truncate px-6 py-4 text-sm font-medium text-gray-900">
                  {doc.title}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">{doc.documentNumber}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{doc.documentType}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                    doc.status === "active"
                      ? "bg-green-100 text-green-700"
                      : doc.status === "amended"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-red-100 text-red-700"
                  }`}>
                    {doc.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {doc.effectiveDate.toLocaleDateString("vi-VN")}
                </td>
                <td className="px-6 py-4 text-right text-sm">
                  <Link href={`/admin/legal-documents/${doc.id}`}
                    className="text-blue-600 hover:text-blue-800 mr-3">
                    Edit
                  </Link>
                  {session?.user?.role === "admin" && (
                    <DeleteButton
                      endpoint={`/api/admin/legal-documents/${doc.id}`}
                      label="Delete"
                    />
                  )}
                </td>
              </tr>
            ))}
            {docs.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-sm text-gray-500">
                  No legal documents yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
