import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import FilterBar from "@/components/dashboard/FilterBar";
import DocumentListTable from "@/components/dashboard/DocumentListTable";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://lcvn.vn";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Văn bản sắp có hiệu lực - LCVN",
  description: "Danh sách văn bản pháp luật Việt Nam sắp có hiệu lực. Theo dõi các quy định mới sắp áp dụng.",
  alternates: {
    canonical: `${BASE_URL}/van-ban-sap-co-hieu-luc`,
  },
  openGraph: {
    title: "Văn bản sắp có hiệu lực - LCVN",
    description: "Danh sách văn bản pháp luật Việt Nam sắp có hiệu lực.",
    url: `${BASE_URL}/van-ban-sap-co-hieu-luc`,
  },
};

const SLUG_TO_DOC_PAGE: Record<string, string> = {
  "bo-luat-lao-dong": "labor-code-2019",
  "bo-luat-dan-su": "civil-code-2015",
  "luat-doanh-nghiep": "enterprise-law-2020",
};

export default async function UpcomingRegulationsPage() {
  const now = new Date();

  const documents = await prisma.legalDocument.findMany({
    where: {
      effectiveDate: {
        gt: now,
      },
    },
    orderBy: { effectiveDate: "asc" },
  });

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-gray-900">
          Văn bản sắp có hiệu lực
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Các văn bản pháp luật sẽ có hiệu lực trong thời gian tới
        </p>
      </div>

      <div>
        <FilterBar basePath="/van-ban-sap-co-hieu-luc" />
      </div>

      {documents.length > 0 ? (
        <DocumentListTable
          documents={documents}
          slugToDocPage={SLUG_TO_DOC_PAGE}
        />
      ) : (
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
          <svg
            className="mx-auto w-10 h-10 text-gray-300 mb-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm text-gray-500">
            Hiện tại chưa có văn bản nào sắp có hiệu lực trong hệ thống.
          </p>
          <p className="mt-1 text-xs text-gray-400">
            Dữ liệu sẽ được cập nhật khi có văn bản mới.
          </p>
        </div>
      )}
    </div>
  );
}
