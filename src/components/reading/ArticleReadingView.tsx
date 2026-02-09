import ClauseBlock from "./ClauseBlock";
import type { ArticleWithChildren } from "@/types/legal";

interface ArticleReadingViewProps {
  article: ArticleWithChildren;
}

export default function ArticleReadingView({ article }: ArticleReadingViewProps) {
  const docSlug = article.document.slug;
  const year = article.document.year;

  return (
    <article className="max-w-none">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">
        Điều {article.articleNumber}
        {article.title && `. ${article.title}`}
      </h1>

      {(article.chapter || article.section) && (
        <p className="text-sm text-gray-500 mb-4">
          {article.chapter}
          {article.section && ` - ${article.section}`}
        </p>
      )}

      <p className="text-gray-800 mb-4 leading-relaxed">{article.content}</p>

      {article.clauses.length > 0 && (
        <div className="space-y-2">
          {article.clauses.map((clause) => (
            <ClauseBlock
              key={clause.id}
              clause={clause}
              sourceUrl={`/luat/${docSlug}/${year}/dieu-${article.articleNumber}/khoan-${clause.clauseNumber}`}
              docSlug={docSlug}
              year={year}
              articleNumber={article.articleNumber}
            />
          ))}
        </div>
      )}
    </article>
  );
}
