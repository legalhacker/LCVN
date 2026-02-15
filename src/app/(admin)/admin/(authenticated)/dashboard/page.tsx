import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [changesCount, documentsCount, fieldsCount, usersCount, headlinesCount, activeHeadlines] =
    await Promise.all([
      prisma.regulatoryChange.count(),
      prisma.legalDocument.count(),
      prisma.field.count(),
      prisma.user.count(),
      prisma.homepageHeadline.count(),
      prisma.homepageHeadline.findMany({
        where: { status: "active" },
        orderBy: [{ pinned: "desc" }, { position: "asc" }],
        take: 10,
        include: {
          regulatoryChange: {
            select: { slug: true },
          },
        },
      }),
    ]);

  const stats = [
    { label: "Headlines", value: headlinesCount, href: "/admin/headlines" },
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
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            Active Headlines
          </h2>
          <Link
            href="/admin/headlines"
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Manage Headlines →
          </Link>
        </div>
        {activeHeadlines.length === 0 ? (
          <p className="text-sm text-gray-500">No active headlines. Create one to populate the homepage.</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {activeHeadlines.map((headline) => (
              <li key={headline.id} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-2 min-w-0">
                  {headline.pinned && <span className="shrink-0">📌</span>}
                  <span className="shrink-0 text-xs text-gray-400 w-6 text-right">
                    #{headline.position}
                  </span>
                  <Link
                    href="/admin/headlines"
                    className="text-sm font-medium text-gray-900 hover:text-blue-600 line-clamp-1"
                  >
                    {headline.title}
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
