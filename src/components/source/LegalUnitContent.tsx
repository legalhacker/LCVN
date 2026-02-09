interface LegalUnitContentProps {
  entityType: string;
  number?: number | string;
  title?: string | null;
  content: string;
}

export default function LegalUnitContent({
  entityType,
  number,
  title,
  content,
}: LegalUnitContentProps) {
  const typeLabels: Record<string, string> = {
    article: "Điều",
    clause: "Khoản",
    point: "Điểm",
  };

  const label = typeLabels[entityType] || entityType;

  return (
    <div className="mb-6">
      <h1 className="text-xl font-bold text-gray-900 mb-2">
        {number != null && `${label} ${number}`}
        {title && (
          <>
            {number != null && ". "}
            {title}
          </>
        )}
      </h1>
      <div className="prose prose-gray max-w-none">
        <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">{content}</p>
      </div>
    </div>
  );
}
