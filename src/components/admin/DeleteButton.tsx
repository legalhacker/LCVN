"use client";

import { useRouter } from "next/navigation";

interface Props {
  endpoint: string;
  label?: string;
}

export default function DeleteButton({ endpoint, label = "Delete" }: Props) {
  const router = useRouter();

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this?")) return;

    const res = await fetch(endpoint, { method: "DELETE" });
    if (res.ok) {
      router.refresh();
    } else {
      const data = await res.json();
      alert(data.error || "Failed to delete");
    }
  }

  return (
    <button
      onClick={handleDelete}
      className="text-red-600 hover:text-red-800"
    >
      {label}
    </button>
  );
}
