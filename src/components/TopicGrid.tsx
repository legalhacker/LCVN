import Link from "next/link";

const topics = [
  { name: "Civil Law", slug: "civil-law", description: "Contracts, property, obligations, and civil disputes" },
  { name: "Corporate Law", slug: "corporate-law", description: "Business formation, governance, and commercial transactions" },
  { name: "Labor & HR", slug: "labor-hr", description: "Employment contracts, wages, termination, and worker rights" },
  { name: "Tax", slug: "tax", description: "Corporate tax, VAT, personal income tax, and compliance" },
  { name: "Intellectual Property", slug: "intellectual-property", description: "Trademarks, patents, copyrights, and trade secrets" },
  { name: "Environment", slug: "environment", description: "Environmental protection, permits, and impact assessments" },
  { name: "Data Protection", slug: "data-protection", description: "Personal data, cybersecurity, and privacy regulations" },
  { name: "Criminal Law", slug: "criminal-law", description: "Criminal offenses, penalties, and procedural law" },
];

export default function TopicGrid() {
  return (
    <nav aria-label="Legal topics">
      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {topics.map((topic) => (
          <li key={topic.slug}>
            <Link
              href={`/topic/${topic.slug}`}
              className="group block rounded-lg border border-gray-150 p-5 transition-all hover:border-gray-300 hover:shadow-sm"
            >
              <h3 className="text-sm font-semibold text-gray-900 group-hover:text-black">
                {topic.name}
              </h3>
              <p className="mt-1 text-xs leading-relaxed text-gray-500 group-hover:text-gray-600">
                {topic.description}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
