import Link from "next/link";

interface ArticleSummary {
  articleNumber: number;
  title: string | null;
  chapter: string | null;
  clauseCount: number;
}

interface DocumentOverviewProps {
  title: string;
  documentNumber: string;
  issuingBody: string;
  issuedDate: string;
  effectiveDate: string;
  status: string;
  slug: string;
  year: number;
  articles: ArticleSummary[];
}

export default function DocumentOverview({
  title,
  documentNumber,
  issuingBody,
  issuedDate,
  effectiveDate,
  status,
  slug,
  year,
  articles,
}: DocumentOverviewProps) {
  const statusLabels: Record<string, string> = {
    active: "Còn hiệu lực",
    amended: "Đã sửa đổi",
    repealed: "Hết hiệu lực",
  };

  // Group articles by chapter
  const chapters = articles.reduce(
    (acc, article) => {
      const ch = article.chapter || "Khác";
      if (!acc[ch]) acc[ch] = [];
      acc[ch].push(article);
      return acc;
    },
    {} as Record<string, ArticleSummary[]>,
  );

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{title}</h1>
        <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-gray-500">
          <span>Số hiệu: {documentNumber}</span>
          <span>Cơ quan: {issuingBody}</span>
          <span>Ban hành: {issuedDate}</span>
          <span>Hiệu lực: {effectiveDate}</span>
          <span className="text-green-700 font-medium">
            {statusLabels[status] || status}
          </span>
        </div>
      </div>

      <h2 className="text-lg font-semibold text-gray-900 mb-4">Mục lục</h2>

      <div className="space-y-6">
        {Object.entries(chapters).map(([chapter, chapterArticles]) => (
          <div key={chapter}>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
              {chapter}
            </h3>
            <ul className="space-y-1">
              {chapterArticles.map((article) => (
                <li key={article.articleNumber}>
                  <Link
                    href={`/luat/${slug}/${year}/dieu-${article.articleNumber}`}
                    className="flex items-baseline gap-2 rounded-md px-3 py-2 hover:bg-gray-50 transition-colors"
                  >
                    <span className="font-medium text-gray-900 shrink-0">
                      Điều {article.articleNumber}
                    </span>
                    {article.title && (
                      <span className="text-gray-600">{article.title}</span>
                    )}
                    <span className="text-xs text-gray-400 ml-auto shrink-0">
                      {article.clauseCount} khoản
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
