import Link from "next/link";

interface ModeToggleProps {
  sourceUrl: string;
  readingUrl: string;
  currentMode: "source" | "reading";
}

export default function ModeToggle({
  sourceUrl,
  readingUrl,
  currentMode,
}: ModeToggleProps) {
  return (
    <div className="flex items-center gap-1 rounded-lg bg-gray-100 p-1 text-sm">
      <Link
        href={readingUrl}
        className={`rounded-md px-3 py-1.5 transition-colors ${
          currentMode === "reading"
            ? "bg-white text-gray-900 shadow-sm font-medium"
            : "text-gray-500 hover:text-gray-700"
        }`}
      >
        Đọc
      </Link>
      <Link
        href={sourceUrl}
        className={`rounded-md px-3 py-1.5 transition-colors ${
          currentMode === "source"
            ? "bg-white text-gray-900 shadow-sm font-medium"
            : "text-gray-500 hover:text-gray-700"
        }`}
      >
        Nguồn
      </Link>
    </div>
  );
}
