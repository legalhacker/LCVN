import Link from "next/link";
import type { Relationship } from "@/types/legal";
import { getRelationshipLabel, getEntityTypeLabel } from "@/lib/legal-utils";

interface RelationshipLinksProps {
  relationships: Relationship[];
  currentCanonicalId: string;
}

export default function RelationshipLinks({
  relationships,
  currentCanonicalId,
}: RelationshipLinksProps) {
  if (relationships.length === 0) return null;

  // Group by relationship type
  const grouped = relationships.reduce(
    (acc, rel) => {
      const key = rel.relationshipType;
      if (!acc[key]) acc[key] = [];
      acc[key].push(rel);
      return acc;
    },
    {} as Record<string, Relationship[]>,
  );

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 mt-6">
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
        Liên kết pháp lý
      </h2>

      <div className="space-y-4">
        {Object.entries(grouped).map(([type, rels]) => (
          <div key={type}>
            <h3 className="text-xs font-medium text-gray-400 uppercase mb-1">
              {getRelationshipLabel(type)}
            </h3>
            <ul className="space-y-1">
              {rels.map((rel) => {
                const isSource = rel.sourceCanonicalId === currentCanonicalId;
                const targetId = isSource
                  ? rel.targetCanonicalId
                  : rel.sourceCanonicalId;
                const targetType = isSource ? rel.targetType : rel.sourceType;

                return (
                  <li key={rel.id}>
                    <Link
                      href={`/api/v1/articles/${targetId}`}
                      className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      <span className="text-gray-400 mr-1">
                        [{getEntityTypeLabel(targetType)}]
                      </span>
                      {rel.description || targetId}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
