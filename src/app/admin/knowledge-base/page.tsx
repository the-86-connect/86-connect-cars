"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Upload, FileText, Trash2, RefreshCw, Database, HardDrive, AlertCircle, CheckCircle2, X,
} from "lucide-react";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";

interface KbDoc {
  id: string;
  title: string;
  filename: string;
  chunkCount: number;
  charCount: number;
  createdAt: string;
}

interface KbStats {
  docCount: number;
  chunkCount: number;
  storageBytes: number;
  storageLabel: string;
  glmConfigured: boolean;
  avgBytesPerChunk: number;
}

export default function AdminKnowledgeBase() {
  const [docs, setDocs] = useState<KbDoc[]>([]);
  const [stats, setStats] = useState<KbStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [replacingId, setReplacingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<KbDoc | null>(null);
  const [replaceTarget, setReplaceTarget] = useState<KbDoc | null>(null);
  const [titleInput, setTitleInput] = useState("");

  const uploadInputRef = useRef<HTMLInputElement>(null);
  const replaceInputRef = useRef<HTMLInputElement>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [docsRes, statsRes] = await Promise.all([
        fetch("/api/admin/kb/documents"),
        fetch("/api/admin/kb/stats"),
      ]);
      const docsData = await docsRes.json();
      const statsData = await statsRes.json();
      if (!docsRes.ok || !statsRes.ok) throw new Error(docsData.error || statsData.error || "Failed");
      setDocs(Array.isArray(docsData) ? docsData : []);
      setStats(statsData);
      setError("");
    } catch {
      setDocs([]);
      setStats(null);
      setError("Knowledge base tables not found — run migration 00007_knowledge_base.sql on Supabase.");
    } finally {
      setLoading(false);
    }
  }, []);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { void refresh(); }, [refresh]);

  // Auto-clear transient messages
  useEffect(() => {
    if (!error && !success) return;
    const t = setTimeout(() => {
      setError(null);
      setSuccess(null);
    }, 5000);
    return () => clearTimeout(t);
  }, [error, success]);

  const handleUpload = async (file: File) => {
    setUploading(true);
    setError(null);
    setSuccess(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("title", titleInput || file.name.replace(/\.docx$/i, ""));

      const res = await fetch("/api/admin/kb/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");

      setSuccess(`"${data.title || file.name}" uploaded — ${data.chunkCount} chunks indexed`);
      setTitleInput("");
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
      if (uploadInputRef.current) uploadInputRef.current.value = "";
    }
  };

  const handleReplace = async (file: File) => {
    if (!replaceTarget) return;
    setReplacingId(replaceTarget.id);
    setError(null);
    setSuccess(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("title", replaceTarget.title);

      const res = await fetch(`/api/admin/kb/documents/${replaceTarget.id}`, {
        method: "PUT",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Replace failed");

      setSuccess(`"${replaceTarget.title}" replaced — ${data.chunkCount} new chunks indexed`);
      setReplaceTarget(null);
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Replace failed");
    } finally {
      setReplacingId(null);
      if (replaceInputRef.current) replaceInputRef.current.value = "";
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setError(null);
    try {
      const res = await fetch(`/api/admin/kb/documents/${deleteTarget.id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Delete failed");
      }
      setSuccess(`"${deleteTarget.title}" deleted — storage freed`);
      setDeleteTarget(null);
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed");
      setDeleteTarget(null);
    }
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleString("en-US", {
      year: "numeric", month: "short", day: "numeric",
      hour: "2-digit", minute: "2-digit",
    });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Knowledge Base</h1>
          <p className="mt-1 text-sm text-gray-500">
            Upload .docx documents — the AI chatbot on the homepage will use them to answer visitor questions.
          </p>
        </div>
        <button
          type="button"
          onClick={refresh}
          disabled={loading}
          className="flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Transient messages */}
      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
          <AlertCircle className="h-5 w-5 shrink-0 text-red-600" />
          <p className="flex-1 text-sm text-red-700">{error}</p>
          <button type="button" onClick={() => setError(null)} className="text-red-400 hover:text-red-600">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
      {success && (
        <div className="flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-4">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-green-600" />
          <p className="flex-1 text-sm text-green-700">{success}</p>
          <button type="button" onClick={() => setSuccess(null)} className="text-green-400 hover:text-green-600">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* GLM config warning */}
      {stats && !stats.glmConfigured && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-300 bg-amber-50 p-4">
          <AlertCircle className="h-5 w-5 shrink-0 text-amber-600" />
          <div className="flex-1 text-sm text-amber-800">
            <p className="font-semibold">ZHIPU_API_KEY is not configured</p>
            <p className="mt-1">
              Add it to your environment variables to enable document embedding and chatbot responses.
              Get a key from{" "}
              <a
                href="https://bigmodel.cn/usercenter/proj-mgmt/apikeys"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                bigmodel.cn
              </a>
              .
            </p>
          </div>
        </div>
      )}

      {/* Stats cards */}
      {stats && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard icon={FileText} label="Documents" value={String(stats.docCount)} />
          <StatCard icon={Database} label="Chunks" value={(stats.chunkCount ?? 0).toLocaleString()} />
          <StatCard icon={HardDrive} label="Storage Used" value={stats.storageLabel} />
          <StatCard
            icon={Database}
            label="Avg / Chunk"
            value={stats.avgBytesPerChunk > 0 ? `${(stats.avgBytesPerChunk / 1024).toFixed(1)} KB` : "—"}
          />
        </div>
      )}

      {/* Storage explainer */}
      <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
        <p className="font-semibold text-gray-800">Storage efficiency</p>
        <p className="mt-1">
          Only chunk text + vector embeddings are stored — the original .docx is discarded after processing.
          Each chunk uses ~8 KB (2048-dim float32 embedding + ~1 KB text). A typical 50-page doc produces
          ~150 chunks ≈ 1.2 MB. Supabase free tier includes 500 MB; this knowledge base would need 400+
          large documents to approach that limit. Delete unused documents to free storage immediately.
        </p>
      </div>

      {/* Upload card */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-gray-900">Upload new document</h2>
        <p className="mt-1 text-sm text-gray-500">.docx only, max 10 MB.</p>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-700">Title (optional)</label>
            <input
              type="text"
              value={titleInput}
              onChange={(e) => setTitleInput(e.target.value)}
              placeholder="e.g. Shipping Policies 2026"
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>
          <input
            ref={uploadInputRef}
            type="file"
            accept=".docx"
            disabled={uploading}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleUpload(f);
            }}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => uploadInputRef.current?.click()}
            disabled={uploading}
            className="flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-50"
          >
            <Upload className="h-4 w-4" />
            {uploading ? "Uploading & embedding..." : "Choose .docx & upload"}
          </button>
        </div>
      </div>

      {/* Documents list */}
      <div className="rounded-2xl border border-gray-200 bg-white">
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">All documents</h2>
        </div>
        {loading ? (
          <div className="p-12 text-center text-sm text-gray-500">Loading...</div>
        ) : docs.length === 0 ? (
          <div className="p-12 text-center text-sm text-gray-500">
            No documents yet. Upload a .docx to enable the chatbot.
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {docs.map((doc) => (
              <li key={doc.id} className="flex items-center gap-4 px-6 py-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-gray-900">{doc.title}</p>
                  <p className="truncate text-xs text-gray-500">
                    {doc.filename} · {doc.chunkCount ?? 0} chunks · {(doc.charCount ?? 0).toLocaleString()} chars · {formatDate(doc.createdAt)}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setReplaceTarget(doc);
                      replaceInputRef.current?.click();
                    }}
                    disabled={replacingId === doc.id}
                    title="Replace with a new version"
                    className="flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${replacingId === doc.id ? "animate-spin" : ""}`} />
                    {replacingId === doc.id ? "Replacing..." : "Replace"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(doc)}
                    title="Delete permanently"
                    className="flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Hidden replace input — replaceTarget is set before clicking the input */}
      <input
        ref={replaceInputRef}
        type="file"
        accept=".docx"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f && replaceTarget) handleReplace(f);
        }}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete document?"
        message={`"${deleteTarget?.title}" and all its chunks will be permanently removed. This frees the storage immediately. This cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

function StatCard({
  icon: Icon, label, value,
}: {
  icon: typeof FileText; label: string; value: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <div className="flex items-center gap-2 text-gray-400">
        <Icon className="h-4 w-4" />
        <span className="text-xs font-medium uppercase tracking-wide">{label}</span>
      </div>
      <p className="mt-1 text-xl font-bold text-gray-900">{value}</p>
    </div>
  );
}
