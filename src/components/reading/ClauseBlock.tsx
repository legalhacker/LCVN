import Link from "next/link";
import PointItem from "./PointItem";
import type { ClauseWithChildren } from "@/types/legal";

interface ClauseBlockProps {
  clause: ClauseWithChildren;
  sourceUrl: string;
  docSlug: string;
  year: number;
  articleNumber: number;
}

export default function ClauseBlock({
  clause,
  sourceUrl,
  docSlug,
  year,
  articleNumber,
}: ClauseBlockProps) {
  return (
    <div className="mb-4 group/clause">
      <div className="flex items-start gap-2">
        <div className="flex-1">
          <p className="text-gray-800">
            <span className="font-semibold text-gray-900">
              {clause.clauseNumber}.{" "}
            </span>
            {clause.content}
          </p>
        </div>
        <Link
          href={sourceUrl}
          className="shrink-0 opacity-0 group-hover/clause:opacity-100 transition-opacity text-gray-400 hover:text-blue-600 mt-1"
          title="Xem nguồn khoản này"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 16 16"
            fill="currentColor"
            className="w-3.5 h-3.5"
          >
            <path d="M6.22 8.72a.75.75 0 0 0 1.06 1.06l5.22-5.22v1.69a.75.75 0 0 0 1.5 0v-3.5a.75.75 0 0 0-.75-.75h-3.5a.75.75 0 0 0 0 1.5h1.69L6.22 8.72Z" />
            <path d="M3.5 6.75c0-.69.56-1.25 1.25-1.25H7A.75.75 0 0 0 7 4H4.75A2.75 2.75 0 0 0 2 6.75v4.5A2.75 2.75 0 0 0 4.75 14h4.5A2.75 2.75 0 0 0 12 11.25V9a.75.75 0 0 0-1.5 0v2.25c0 .69-.56 1.25-1.25 1.25h-4.5c-.69 0-1.25-.56-1.25-1.25v-4.5Z" />
          </svg>
        </Link>
      </div>

      {clause.points.length > 0 && (
        <ul className="ml-6 mt-2 space-y-1.5">
          {clause.points.map((point) => (
            <PointItem
              key={point.id}
              pointLetter={point.pointLetter}
              content={point.content}
              sourceUrl={`/luat/${docSlug}/${year}/dieu-${articleNumber}/khoan-${clause.clauseNumber}/diem-${point.pointLetter}`}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
