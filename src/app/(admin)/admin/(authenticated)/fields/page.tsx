"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

interface Field {
  id: string;
  name: string;
  slug: string;
  _count?: { regulatoryChanges: number };
}

export default function FieldsPage() {
  const { data: session } = useSession();
  const [fields, setFields] = useState<Field[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editSlug, setEditSlug] = useState("");

  async function fetchFields() {
    const res = await fetch("/api/admin/fields");
    if (res.ok) setFields(await res.json());
    setLoading(false);
  }

  useEffect(() => { fetchFields(); }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/admin/fields", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName, slug: newSlug }),
    });
    if (res.ok) {
      setNewName("");
      setNewSlug("");
      fetchFields();
    }
  }

  async function handleUpdate(id: string) {
    const res = await fetch(`/api/admin/fields/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editName, slug: editSlug }),
    });
    if (res.ok) {
      setEditingId(null);
      fetchFields();
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure?")) return;
    const res = await fetch(`/api/admin/fields/${id}`, { method: "DELETE" });
    if (res.ok) fetchFields();
    else {
      const data = await res.json();
      alert(data.error || "Failed to delete");
    }
  }

  if (loading) return <div className="text-gray-500">Loading...</div>;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Fields</h1>

      <div className="rounded-lg bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Slug</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Changes</th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {fields.map((field) => (
              <tr key={field.id}>
                {editingId === field.id ? (
                  <>
                    <td className="px-6 py-3">
                      <input value={editName} onChange={(e) => setEditName(e.target.value)}
                        className="w-full rounded border border-gray-300 px-2 py-1 text-sm" />
                    </td>
                    <td className="px-6 py-3">
                      <input value={editSlug} onChange={(e) => setEditSlug(e.target.value)}
                        className="w-full rounded border border-gray-300 px-2 py-1 text-sm" />
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-500">{field._count?.regulatoryChanges || 0}</td>
                    <td className="px-6 py-3 text-right text-sm space-x-2">
                      <button onClick={() => handleUpdate(field.id)} className="text-blue-600 hover:text-blue-800">Save</button>
                      <button onClick={() => setEditingId(null)} className="text-gray-500 hover:text-gray-700">Cancel</button>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{field.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{field.slug}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{field._count?.regulatoryChanges || 0}</td>
                    <td className="px-6 py-4 text-right text-sm space-x-2">
                      <button onClick={() => { setEditingId(field.id); setEditName(field.name); setEditSlug(field.slug); }}
                        className="text-blue-600 hover:text-blue-800">Edit</button>
                      {session?.user?.role === "admin" && (
                        <button onClick={() => handleDelete(field.id)} className="text-red-600 hover:text-red-800">Delete</button>
                      )}
                    </td>
                  </>
                )}
              </tr>
            ))}

            {/* Add new row */}
            <tr className="bg-gray-50">
              <td className="px-6 py-3">
                <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Field name"
                  className="w-full rounded border border-gray-300 px-2 py-1 text-sm" />
              </td>
              <td className="px-6 py-3">
                <input value={newSlug} onChange={(e) => setNewSlug(e.target.value)} placeholder="field-slug"
                  className="w-full rounded border border-gray-300 px-2 py-1 text-sm" />
              </td>
              <td className="px-6 py-3" />
              <td className="px-6 py-3 text-right">
                <button onClick={handleAdd} disabled={!newName || !newSlug}
                  className="rounded bg-gray-900 px-3 py-1 text-sm text-white hover:bg-gray-800 disabled:opacity-50">
                  Add
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
