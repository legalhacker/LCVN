import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import FilterBar from "@/components/dashboard/FilterBar";
import DocumentListTable from "@/components/dashboard/DocumentListTable";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://lcvn.vn";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Văn bản mới có hiệu lực - LCVN",
  description: "Danh sách văn bản pháp luật Việt Nam mới có hiệu lực. Tra cứu các quy định đang được áp dụng.",
  alternates: {
    canonical: `${BASE_URL}/van-ban-moi-co-hieu-luc`,
  },
  openGraph: {
    title: "Văn bản mới có hiệu lực - LCVN",
    description: "Danh sách văn bản pháp luật Việt Nam mới có hiệu lực.",
    url: `${BASE_URL}/van-ban-moi-co-hieu-luc`,
  },
};

const SLUG_TO_DOC_PAGE: Record<string, string> = {
  "bo-luat-lao-dong": "labor-code-2019",
  "bo-luat-dan-su": "civil-code-2015",
  "luat-doanh-nghiep": "enterprise-law-2020",
};

export default async function RecentlyEffectivePage() {
  const now = new Date();

  const documents = await prisma.legalDocument.findMany({
    where: {
      effectiveDate: {
        lte: now,
      },
    },
    orderBy: { effectiveDate: "desc" },
  });

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-gray-900">
          Văn bản mới có hiệu lực
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Các văn bản pháp luật đã chính thức có hiệu lực
        </p>
      </div>

      <div>
        <FilterBar basePath="/van-ban-moi-co-hieu-luc" />
      </div>

      {documents.length > 0 ? (
        <DocumentListTable
          documents={documents}
          slugToDocPage={SLUG_TO_DOC_PAGE}
        />
      ) : (
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
          <p className="text-sm text-gray-500">
            Chưa có văn bản nào trong hệ thống.
          </p>
        </div>
      )}
    </div>
  );
}
