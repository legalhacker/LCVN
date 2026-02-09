import Link from "next/link";

interface PointItemProps {
  pointLetter: string;
  content: string;
  sourceUrl: string;
}

export default function PointItem({
  pointLetter,
  content,
  sourceUrl,
}: PointItemProps) {
  return (
    <li className="flex gap-2 group">
      <span className="text-gray-500 font-medium shrink-0">
        {pointLetter})
      </span>
      <span className="text-gray-800">{content}</span>
      <Link
        href={sourceUrl}
        className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-blue-600"
        title="Xem nguồn"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 16 16"
          fill="currentColor"
          className="w-3.5 h-3.5 mt-1"
        >
          <path d="M6.22 8.72a.75.75 0 0 0 1.06 1.06l5.22-5.22v1.69a.75.75 0 0 0 1.5 0v-3.5a.75.75 0 0 0-.75-.75h-3.5a.75.75 0 0 0 0 1.5h1.69L6.22 8.72Z" />
          <path d="M3.5 6.75c0-.69.56-1.25 1.25-1.25H7A.75.75 0 0 0 7 4H4.75A2.75 2.75 0 0 0 2 6.75v4.5A2.75 2.75 0 0 0 4.75 14h4.5A2.75 2.75 0 0 0 12 11.25V9a.75.75 0 0 0-1.5 0v2.25c0 .69-.56 1.25-1.25 1.25h-4.5c-.69 0-1.25-.56-1.25-1.25v-4.5Z" />
        </svg>
      </Link>
    </li>
  );
}
