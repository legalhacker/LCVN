import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [changesCount, documentsCount, fieldsCount, usersCount, recentChanges] =
    await Promise.all([
      prisma.regulatoryChange.count(),
      prisma.legalDocument.count(),
      prisma.field.count(),
      prisma.user.count(),
      prisma.regulatoryChange.findMany({
        where: { status: "published" },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: { id: true, headline: true, effectiveDate: true, slug: true },
      }),
    ]);

  const stats = [
    { label: "Regulatory Changes", value: changesCount, href: "/admin/regulatory-changes" },
    { label: "Legal Documents", value: documentsCount, href: "/admin/legal-documents" },
    { label: "Fields", value: fieldsCount, href: "/admin/fields" },
    { label: "Users", value: usersCount, href: "/admin/users" },
  ];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Dashboard</h1>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="rounded-lg bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <p className="text-sm text-gray-500">{stat.label}</p>
            <p className="mt-1 text-3xl font-bold text-gray-900">{stat.value}</p>
          </Link>
        ))}
      </div>

      <div className="rounded-lg bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          Recent Published Changes
        </h2>
        {recentChanges.length === 0 ? (
          <p className="text-sm text-gray-500">No published changes yet.</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {recentChanges.map((change) => (
              <li key={change.id} className="flex items-center justify-between py-3">
                <Link
                  href={`/admin/regulatory-changes/${change.id}`}
                  className="text-sm font-medium text-gray-900 hover:text-blue-600 line-clamp-1"
                >
                  {change.headline}
                </Link>
                <span className="ml-4 shrink-0 text-xs text-gray-500">
                  {change.effectiveDate.toLocaleDateString("vi-VN")}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
