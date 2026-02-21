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

interface FieldOption {
  id: string;
  name: string;
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

const inputCls = "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";
const labelCls = "block text-sm font-medium text-gray-700 mb-1";
const sectionCls = "rounded-lg border border-gray-200 bg-gray-50/50 p-4 space-y-4";
const sectionTitleCls = "text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3";

export default function HeadlinesPage() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "admin";

  const [headlines, setHeadlines] = useState<Headline[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<HeadlineStatus>("active");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [extractError, setExtractError] = useState("");
  const [publishNow, setPublishNow] = useState(false);

  // Edit form state
  const [editData, setEditData] = useState({ title: "", subtitle: "" });

  // New all-in-one form state
  const [availableFields, setAvailableFields] = useState<FieldOption[]>([]);

  // Section 1: Document
  const [docFile, setDocFile] = useState<File | null>(null);
  const [extracting, setExtracting] = useState(false);
  const [docTitle, setDocTitle] = useState("");
  const [docSlug, setDocSlug] = useState("");
  const [docContent, setDocContent] = useState("");
  const [docFileType, setDocFileType] = useState("");

  // Section 2: Change info
  const [changeSlug, setChangeSlug] = useState("");
  const [lawName, setLawName] = useState("");
  const [changeType, setChangeType] = useState("amendment");
  const [legalBasis, setLegalBasis] = useState("");
  const [source, setSource] = useState("");
  const [effectiveDate, setEffectiveDate] = useState("");
  const [selectedFieldIds, setSelectedFieldIds] = useState<string[]>([]);
  const [affectedPartiesText, setAffectedPartiesText] = useState("");

  // Section 3: Analysis & Headline
  const [changeHeadline, setChangeHeadline] = useState("");
  const [summary, setSummary] = useState("");
  const [analysisSummary, setAnalysisSummary] = useState("");
  const [comparisonBefore, setComparisonBefore] = useState("");
  const [comparisonAfter, setComparisonAfter] = useState("");
  const [timeline, setTimeline] = useState("");
  const [context, setContext] = useState("");
  const [practicalImpactText, setPracticalImpactText] = useState("");
  const [headlineTitle, setHeadlineTitle] = useState("");
  const [headlineSubtitle, setHeadlineSubtitle] = useState("");

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

  const openCreateForm = async () => {
    setShowCreateForm(true);
    const res = await fetch("/api/admin/fields");
    if (res.ok) {
      const data = await res.json();
      setAvailableFields(data.map((f: FieldOption) => ({ id: f.id, name: f.name })));
    }
  };

  const handleExtract = async () => {
    if (!docFile) return;
    setExtracting(true);
    setExtractError("");
    const fd = new FormData();
    fd.append("file", docFile);
    const res = await fetch("/api/admin/extract-text", { method: "POST", body: fd });
    setExtracting(false);
    if (res.ok) {
      const data = await res.json();
      setDocContent(data.text);
      setDocFileType(data.fileType);
    } else {
      const data = await res.json().catch(() => ({}));
      setExtractError(data.error || "Không thể trích xuất văn bản từ file.");
    }
  };

  const resetForm = () => {
    setDocFile(null); setDocTitle(""); setDocSlug(""); setDocContent(""); setDocFileType("");
    setChangeSlug(""); setLawName(""); setChangeType("amendment"); setLegalBasis("");
    setSource(""); setEffectiveDate(""); setSelectedFieldIds([]); setAffectedPartiesText("");
    setChangeHeadline(""); setSummary(""); setAnalysisSummary(""); setComparisonBefore("");
    setComparisonAfter(""); setTimeline(""); setContext(""); setPracticalImpactText("");
    setHeadlineTitle(""); setHeadlineSubtitle(""); setSubmitError(""); setExtractError(""); setPublishNow(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError("");

    const payload: Record<string, unknown> = {
      title: headlineTitle,
      subtitle: headlineSubtitle || undefined,
      publishNow,
      change: {
        slug: changeSlug,
        lawName,
        changeType,
        legalBasis,
        source,
        effectiveDate,
        headline: changeHeadline,
        summary,
        analysisSummary: analysisSummary || undefined,
        comparisonBefore: comparisonBefore || undefined,
        comparisonAfter: comparisonAfter || undefined,
        timeline: timeline || undefined,
        context: context || undefined,
        practicalImpact: practicalImpactText
          ? practicalImpactText.split("\n").map((s) => s.trim()).filter(Boolean)
          : [],
        affectedParties: affectedPartiesText
          ? affectedPartiesText.split("\n").map((s) => s.trim()).filter(Boolean)
          : [],
        fieldIds: selectedFieldIds,
      },
    };

    if (docTitle && docSlug && docContent) {
      payload.document = { slug: docSlug, title: docTitle, content: docContent, fileType: docFileType || undefined };
    }

    const res = await fetch("/api/admin/headlines", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setSubmitting(false);
    if (res.ok) {
      setShowCreateForm(false);
      resetForm();
      setActiveTab(publishNow ? "active" : "draft");
      fetchHeadlines();
    } else {
      const data = await res.json();
      setSubmitError(data.error || "Failed to create headline.");
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

  const toggleField = (id: string) => {
    setSelectedFieldIds((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Headlines</h1>
        <button
          onClick={openCreateForm}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          + New Headline
        </button>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <div className="mb-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Tạo Headline mới</h2>
            <button
              onClick={() => { setShowCreateForm(false); resetForm(); }}
              className="text-gray-400 hover:text-gray-600 text-xl leading-none"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleCreate} className="space-y-6">
            {/* Section 1: Document */}
            <div className={sectionCls}>
              <p className={sectionTitleCls}>1. Văn bản pháp luật (tuỳ chọn)</p>
              <div className="flex gap-3 items-end">
                <div className="flex-1">
                  <label className={labelCls}>Tải file (.pdf, .doc, .docx)</label>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => { setDocFile(e.target.files?.[0] || null); setExtractError(""); }}
                    className="w-full text-sm text-gray-600 file:mr-3 file:rounded file:border-0 file:bg-gray-100 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-gray-700 hover:file:bg-gray-200"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleExtract}
                  disabled={!docFile || extracting}
                  className="rounded-lg bg-gray-700 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50 shrink-0"
                >
                  {extracting ? "Đang trích xuất…" : "Trích xuất ▶"}
                </button>
              </div>
              {extractError && (
                <p className="text-sm text-red-600">{extractError}</p>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Tiêu đề văn bản</label>
                  <input
                    type="text"
                    value={docTitle}
                    onChange={(e) => setDocTitle(e.target.value)}
                    className={inputCls}
                    placeholder="Tên văn bản pháp luật"
                  />
                </div>
                <div>
                  <label className={labelCls}>Slug</label>
                  <input
                    type="text"
                    value={docSlug}
                    onChange={(e) => setDocSlug(e.target.value)}
                    className={inputCls}
                    placeholder="ten-van-ban"
                  />
                </div>
              </div>
              <div>
                <label className={labelCls}>Nội dung văn bản (xem trước)</label>
                <textarea
                  value={docContent}
                  onChange={(e) => setDocContent(e.target.value)}
                  className={inputCls}
                  rows={6}
                  placeholder="Nội dung được trích xuất từ file hoặc nhập thủ công…"
                />
              </div>
            </div>

            {/* Section 2: Change info */}
            <div className={sectionCls}>
              <p className={sectionTitleCls}>2. Thông tin văn bản thay đổi</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className={labelCls}>Tên luật / văn bản *</label>
                  <input type="text" value={lawName} onChange={(e) => setLawName(e.target.value)} className={inputCls} required />
                </div>
                <div>
                  <label className={labelCls}>Slug *</label>
                  <input type="text" value={changeSlug} onChange={(e) => setChangeSlug(e.target.value)} className={inputCls} required placeholder="ten-thay-doi" />
                </div>
                <div>
                  <label className={labelCls}>Loại thay đổi *</label>
                  <select value={changeType} onChange={(e) => setChangeType(e.target.value)} className={inputCls} required>
                    <option value="amendment">Sửa đổi (amendment)</option>
                    <option value="addition">Bổ sung (addition)</option>
                    <option value="first_codification">Pháp điển hóa lần đầu</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className={labelCls}>Căn cứ pháp lý *</label>
                  <input type="text" value={legalBasis} onChange={(e) => setLegalBasis(e.target.value)} className={inputCls} required />
                </div>
                <div>
                  <label className={labelCls}>Nguồn *</label>
                  <input type="text" value={source} onChange={(e) => setSource(e.target.value)} className={inputCls} required />
                </div>
                <div>
                  <label className={labelCls}>Ngày hiệu lực *</label>
                  <input type="date" value={effectiveDate} onChange={(e) => setEffectiveDate(e.target.value)} className={inputCls} required />
                </div>
              </div>
              {availableFields.length > 0 && (
                <div>
                  <label className={labelCls}>Lĩnh vực</label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {availableFields.map((f) => (
                      <label key={f.id} className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedFieldIds.includes(f.id)}
                          onChange={() => toggleField(f.id)}
                          className="rounded border-gray-300"
                        />
                        <span className="text-sm text-gray-700">{f.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <label className={labelCls}>Đối tượng bị ảnh hưởng (mỗi dòng một đối tượng)</label>
                <textarea
                  value={affectedPartiesText}
                  onChange={(e) => setAffectedPartiesText(e.target.value)}
                  className={inputCls}
                  rows={3}
                  placeholder="Doanh nghiệp FDI&#10;Ngân hàng thương mại&#10;Cá nhân kinh doanh"
                />
              </div>
            </div>

            {/* Section 3: Analysis & Headline */}
            <div className={sectionCls}>
              <p className={sectionTitleCls}>3. Phân tích & Headline</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Tiêu đề Headline *</label>
                  <textarea value={headlineTitle} onChange={(e) => setHeadlineTitle(e.target.value)} className={inputCls} rows={2} required />
                </div>
                <div>
                  <label className={labelCls}>Subtitle Headline</label>
                  <textarea value={headlineSubtitle} onChange={(e) => setHeadlineSubtitle(e.target.value)} className={inputCls} rows={2} />
                </div>
              </div>
              <div>
                <label className={labelCls}>Headline ngắn của thay đổi *</label>
                <textarea value={changeHeadline} onChange={(e) => setChangeHeadline(e.target.value)} className={inputCls} rows={2} required placeholder="Câu tóm tắt ngắn gọn nhất về thay đổi" />
              </div>
              <div>
                <label className={labelCls}>Tóm tắt *</label>
                <textarea value={summary} onChange={(e) => setSummary(e.target.value)} className={inputCls} rows={3} required />
              </div>
              <div>
                <label className={labelCls}>Phân tích chi tiết</label>
                <textarea value={analysisSummary} onChange={(e) => setAnalysisSummary(e.target.value)} className={inputCls} rows={4} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Trước thay đổi</label>
                  <textarea value={comparisonBefore} onChange={(e) => setComparisonBefore(e.target.value)} className={inputCls} rows={3} />
                </div>
                <div>
                  <label className={labelCls}>Sau thay đổi</label>
                  <textarea value={comparisonAfter} onChange={(e) => setComparisonAfter(e.target.value)} className={inputCls} rows={3} />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Timeline hiệu lực</label>
                  <textarea value={timeline} onChange={(e) => setTimeline(e.target.value)} className={inputCls} rows={2} />
                </div>
                <div>
                  <label className={labelCls}>Bối cảnh (Insight)</label>
                  <textarea value={context} onChange={(e) => setContext(e.target.value)} className={inputCls} rows={2} />
                </div>
              </div>
              <div>
                <label className={labelCls}>Tác động pháp lý & thực tiễn (mỗi dòng một điểm)</label>
                <textarea
                  value={practicalImpactText}
                  onChange={(e) => setPracticalImpactText(e.target.value)}
                  className={inputCls}
                  rows={3}
                  placeholder="Doanh nghiệp phải nộp thêm hồ sơ&#10;Tăng chi phí tuân thủ"
                />
              </div>
            </div>

            {submitError && (
              <p className="text-sm text-red-600">{submitError}</p>
            )}

            <div className="flex items-center gap-2">
              <input
                id="publish-now"
                type="checkbox"
                checked={publishNow}
                onChange={(e) => setPublishNow(e.target.checked)}
                className="rounded border-gray-300"
              />
              <label htmlFor="publish-now" className="text-sm text-gray-700 cursor-pointer select-none">
                Publish ngay (hiện lên trang chủ)
              </label>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {submitting ? "Đang tạo…" : publishNow ? "Tạo & Publish" : "Tạo Draft"}
              </button>
              <button
                type="button"
                onClick={() => { setShowCreateForm(false); resetForm(); }}
                className="rounded-lg border border-gray-300 px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Huỷ
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
