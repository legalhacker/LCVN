import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const documents = await prisma.legalDocument.findMany({
    orderBy: { year: "desc" },
    include: {
      _count: { select: { articles: true } },
    },
  });

  const statusLabels: Record<string, string> = {
    active: "Còn hiệu lực",
    amended: "Đã sửa đổi",
    repealed: "Hết hiệu lực",
  };

  const statusColors: Record<string, string> = {
    active: "bg-green-100 text-green-800",
    amended: "bg-yellow-100 text-yellow-800",
    repealed: "bg-red-100 text-red-800",
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Luật Chuẩn Việt Nam
        </h1>
        <p className="text-gray-600 text-lg">
          Cơ sở dữ liệu pháp luật chuẩn hóa, phục vụ AI và người dùng.
        </p>
      </div>

      {/* Dual mode explanation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
        <div className="rounded-lg border border-gray-200 p-4">
          <h3 className="font-semibold text-gray-900 mb-1">
            Chế độ Đọc
          </h3>
          <p className="text-sm text-gray-600">
            Dành cho người dùng. Hiển thị điều luật đầy đủ với các khoản, điểm
            trong một trang dễ đọc.
          </p>
          <p className="text-xs text-gray-400 mt-2">/doc/...</p>
        </div>
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <h3 className="font-semibold text-gray-900 mb-1">
            Chế độ Nguồn
          </h3>
          <p className="text-sm text-gray-600">
            Dành cho AI. Mỗi đơn vị pháp lý có trang riêng với metadata, JSON-LD,
            và canonical ID để trích dẫn chính xác.
          </p>
          <p className="text-xs text-gray-400 mt-2">/luat/...</p>
        </div>
      </div>

      {/* Search */}
      <div className="mb-8">
        <form action="/api/v1/search" method="get" className="flex gap-2">
          <input
            type="text"
            name="q"
            placeholder="Tìm kiếm trong văn bản pháp luật..."
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
          />
          <button
            type="submit"
            className="rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800 transition-colors"
          >
            Tìm kiếm
          </button>
        </form>
      </div>

      {/* Document list */}
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Văn bản pháp luật
      </h2>

      <div className="space-y-3">
        {documents.map((doc) => (
          <Link
            key={doc.id}
            href={`/doc/${doc.slug}/${doc.year}`}
            className="block rounded-lg border border-gray-200 p-4 hover:border-gray-300 hover:shadow-sm transition-all"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">{doc.title}</h3>
                <p className="text-sm text-gray-500 mt-1">
                  {doc.documentNumber} &middot; {doc.issuingBody} &middot;{" "}
                  {doc.issuedDate.toISOString().split("T")[0]}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {doc._count.articles} điều &middot; Canonical: {doc.canonicalId}
                </p>
              </div>
              <span
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[doc.status] || "bg-gray-100 text-gray-800"}`}
              >
                {statusLabels[doc.status] || doc.status}
              </span>
            </div>
          </Link>
        ))}

        {documents.length === 0 && (
          <p className="text-gray-500 text-center py-8">
            Chưa có văn bản nào. Hãy chạy <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm">npx prisma db seed</code> để tải dữ liệu mẫu.
          </p>
        )}
      </div>

      {/* API info */}
      <div className="mt-12 rounded-lg border border-gray-200 bg-gray-50 p-4">
        <h3 className="font-semibold text-gray-900 mb-2">API cho AI</h3>
        <div className="text-sm text-gray-600 space-y-1 font-mono">
          <p>GET /api/v1/documents</p>
          <p>GET /api/v1/articles/:canonicalId</p>
          <p>GET /api/v1/relationships/:canonicalId</p>
          <p>GET /api/v1/search?q=...&type=...</p>
        </div>
      </div>
    </div>
  );
}
