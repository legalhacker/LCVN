"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState, useCallback } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

type HeadlineStatus = "draft" | "scheduled" | "active" | "archived";

interface Headline {
  id: string;
  title: string;
  subtitle: string | null;
  position: number;
  pinned: boolean;
  status: HeadlineStatus;
  publishAt: string | null;
  archiveAt: string | null;
  createdAt: string;
  regulatoryChange: {
    id: string;
    headline: string;
    slug: string;
    status: string;
  };
  createdBy: {
    id: string;
    name: string | null;
    email: string;
  };
}

interface RegulatoryChangeOption {
  id: string;
  headline: string;
  slug: string;
  status: string;
}

const STATUS_TABS: { label: string; value: HeadlineStatus }[] = [
  { label: "Active", value: "active" },
  { label: "Scheduled", value: "scheduled" },
  { label: "Draft", value: "draft" },
  { label: "Archived", value: "archived" },
];

const STATUS_BADGE_CLASSES: Record<HeadlineStatus, string> = {
  active: "bg-green-100 text-green-800",
  scheduled: "bg-blue-100 text-blue-800",
  draft: "bg-gray-100 text-gray-800",
  archived: "bg-yellow-100 text-yellow-800",
};

function SortableRow({
  headline: h,
  isAdmin,
  editingId,
  editData,
  setEditData,
  handleUpdate,
  handleStatusChange,
  handleTogglePin,
  handleDelete,
  startEdit,
  setEditingId,
}: {
  headline: Headline;
  isAdmin: boolean;
  editingId: string | null;
  editData: { title: string; subtitle: string };
  setEditData: (data: { title: string; subtitle: string }) => void;
  handleUpdate: (id: string) => void;
  handleStatusChange: (id: string, status: HeadlineStatus) => void;
  handleTogglePin: (id: string, pinned: boolean) => void;
  handleDelete: (id: string) => void;
  startEdit: (h: Headline) => void;
  setEditingId: (id: string | null) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: h.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <tr ref={setNodeRef} style={style} className="hover:bg-gray-50">
      <td className="px-2 py-3 text-center">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab touch-none p-1 text-gray-400 hover:text-gray-600 active:cursor-grabbing"
          title="Drag to reorder"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <circle cx="5" cy="3" r="1.5" />
            <circle cx="11" cy="3" r="1.5" />
            <circle cx="5" cy="8" r="1.5" />
            <circle cx="11" cy="8" r="1.5" />
            <circle cx="5" cy="13" r="1.5" />
            <circle cx="11" cy="13" r="1.5" />
          </svg>
        </button>
      </td>
      <td className="px-4 py-3 text-sm text-gray-900">{h.position}</td>
      <td className="px-4 py-3">
        {editingId === h.id ? (
          <div className="space-y-2">
            <textarea
              value={editData.title}
              onChange={(e) =>
                setEditData({ ...editData, title: e.target.value })
              }
              className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
              rows={2}
            />
            <input
              value={editData.subtitle}
              onChange={(e) =>
                setEditData({ ...editData, subtitle: e.target.value })
              }
              className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
              placeholder="Subtitle"
            />
            <div className="flex gap-1">
              <button
                onClick={() => handleUpdate(h.id)}
                className="rounded bg-blue-600 px-2 py-1 text-xs text-white hover:bg-blue-700"
              >
                Save
              </button>
              <button
                onClick={() => setEditingId(null)}
                className="rounded border border-gray-300 px-2 py-1 text-xs text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div>
            <p className="text-sm font-medium text-gray-900 line-clamp-2">
              {h.title}
            </p>
            {h.subtitle && (
              <p className="mt-1 text-xs text-gray-500 line-clamp-1">
                {h.subtitle}
              </p>
            )}
          </div>
        )}
      </td>
      <td className="px-4 py-3 text-sm text-gray-600 max-w-xs">
        <p className="line-clamp-1">{h.regulatoryChange.headline}</p>
      </td>
      <td className="px-4 py-3">
        <span
          className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_BADGE_CLASSES[h.status]}`}
        >
          {h.status}
        </span>
      </td>
      <td className="px-4 py-3 text-center">{h.pinned ? "📌" : "—"}</td>
      <td className="px-4 py-3 text-sm text-gray-600">
        {h.createdBy.name || h.createdBy.email}
      </td>
      <td className="px-4 py-3">
        <div className="flex flex-wrap gap-1">
          {editingId !== h.id && (
            <button
              onClick={() => startEdit(h)}
              className="rounded border border-gray-300 px-2 py-1 text-xs text-gray-700 hover:bg-gray-50"
            >
              Edit
            </button>
          )}
          {isAdmin && h.status === "draft" && (
            <button
              onClick={() => handleStatusChange(h.id, "active")}
              className="rounded bg-green-600 px-2 py-1 text-xs text-white hover:bg-green-700"
            >
              Publish
            </button>
          )}
          {isAdmin && h.status === "draft" && (
            <button
              onClick={() => handleStatusChange(h.id, "scheduled")}
              className="rounded bg-blue-600 px-2 py-1 text-xs text-white hover:bg-blue-700"
            >
              Schedule
            </button>
          )}
          {isAdmin && h.status === "active" && (
            <button
              onClick={() => handleStatusChange(h.id, "archived")}
              className="rounded bg-yellow-600 px-2 py-1 text-xs text-white hover:bg-yellow-700"
            >
              Archive
            </button>
          )}
          {isAdmin && (
            <button
              onClick={() => handleTogglePin(h.id, h.pinned)}
              className="rounded border border-gray-300 px-2 py-1 text-xs text-gray-700 hover:bg-gray-50"
            >
              {h.pinned ? "Unpin" : "Pin"}
            </button>
          )}
          {isAdmin && (
            <button
              onClick={() => handleDelete(h.id)}
              className="rounded bg-red-600 px-2 py-1 text-xs text-white hover:bg-red-700"
            >
              Delete
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}

export default function HeadlinesPage() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "admin";

  const [headlines, setHeadlines] = useState<Headline[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<HeadlineStatus>("active");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Create form state
  const [regulatoryChanges, setRegulatoryChanges] = useState<RegulatoryChangeOption[]>([]);
  const [formData, setFormData] = useState({
    regulatoryChangeId: "",
    title: "",
    subtitle: "",
    position: 0,
  });

  // Edit form state
  const [editData, setEditData] = useState({
    title: "",
    subtitle: "",
  });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const fetchHeadlines = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/headlines?status=${activeTab}`);
      if (res.ok) setHeadlines(await res.json());
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchHeadlines();
  }, [fetchHeadlines]);

  const fetchRegulatoryChanges = async () => {
    const res = await fetch("/api/admin/regulatory-changes");
    if (res.ok) {
      const data = await res.json();
      setRegulatoryChanges(
        data
          .filter((c: RegulatoryChangeOption) => c.status === "published")
          .map((c: RegulatoryChangeOption) => ({
            id: c.id,
            headline: c.headline,
            slug: c.slug,
            status: c.status,
          }))
      );
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/admin/headlines", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    if (res.ok) {
      setShowCreateForm(false);
      setFormData({ regulatoryChangeId: "", title: "", subtitle: "", position: 0 });
      setActiveTab("draft");
      fetchHeadlines();
    }
  };

  const handleUpdate = async (id: string) => {
    const res = await fetch(`/api/admin/headlines/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editData),
    });
    if (res.ok) {
      setEditingId(null);
      fetchHeadlines();
    }
  };

  const handleStatusChange = async (id: string, newStatus: HeadlineStatus) => {
    const res = await fetch(`/api/admin/headlines/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) fetchHeadlines();
  };

  const handleTogglePin = async (id: string, currentPinned: boolean) => {
    const res = await fetch(`/api/admin/headlines/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pinned: !currentPinned }),
    });
    if (res.ok) fetchHeadlines();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this headline?")) return;
    const res = await fetch(`/api/admin/headlines/${id}`, { method: "DELETE" });
    if (res.ok) fetchHeadlines();
  };

  const startEdit = (h: Headline) => {
    setEditingId(h.id);
    setEditData({ title: h.title, subtitle: h.subtitle || "" });
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = headlines.findIndex((h) => h.id === active.id);
    const newIndex = headlines.findIndex((h) => h.id === over.id);

    const reordered = arrayMove(headlines, oldIndex, newIndex).map(
      (h, index) => ({ ...h, position: index })
    );

    setHeadlines(reordered);

    await fetch("/api/admin/headlines/reorder", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderedIds: reordered.map((h) => h.id) }),
    });
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Headlines</h1>
        <button
          onClick={() => {
            setShowCreateForm(true);
            fetchRegulatoryChanges();
          }}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          + New Headline
        </button>
      </div>

      {/* Create Form Modal */}
      {showCreateForm && (
        <div className="mb-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Create Headline</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Regulatory Change
              </label>
              <select
                value={formData.regulatoryChangeId}
                onChange={(e) =>
                  setFormData({ ...formData, regulatoryChangeId: e.target.value })
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                required
              >
                <option value="">Select a published change...</option>
                {regulatoryChanges.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.headline}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Headline Title
              </label>
              <textarea
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                rows={2}
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Subtitle (optional)
              </label>
              <textarea
                value={formData.subtitle}
                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                rows={2}
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                Create Draft
              </button>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tabs */}
      <div className="mb-4 flex gap-1 rounded-lg bg-gray-100 p-1">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.value
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Headlines Table */}
      <div className="rounded-lg bg-white shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-sm text-gray-500">Loading...</div>
        ) : headlines.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-500">
            No {activeTab} headlines.
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  <th className="px-2 py-3 w-10"></th>
                  <th className="px-4 py-3 w-16">Pos</th>
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Regulatory Change</th>
                  <th className="px-4 py-3 w-24">Status</th>
                  <th className="px-4 py-3 w-16">Pin</th>
                  <th className="px-4 py-3">Created by</th>
                  <th className="px-4 py-3 w-48">Actions</th>
                </tr>
              </thead>
              <SortableContext
                items={headlines.map((h) => h.id)}
                strategy={verticalListSortingStrategy}
              >
                <tbody className="divide-y divide-gray-100">
                  {headlines.map((h) => (
                    <SortableRow
                      key={h.id}
                      headline={h}
                      isAdmin={isAdmin}
                      editingId={editingId}
                      editData={editData}
                      setEditData={setEditData}
                      handleUpdate={handleUpdate}
                      handleStatusChange={handleStatusChange}
                      handleTogglePin={handleTogglePin}
                      handleDelete={handleDelete}
                      startEdit={startEdit}
                      setEditingId={setEditingId}
                    />
                  ))}
                </tbody>
              </SortableContext>
            </table>
          </DndContext>
        )}
      </div>
    </div>
  );
}
