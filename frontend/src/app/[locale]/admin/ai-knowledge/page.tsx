"use client";

import { useEffect, useState } from "react";
import { Database, Plus, RefreshCw } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/base/ui/button";
import { Input } from "@/components/base/ui/input";
import { Textarea } from "@/components/base/ui/textarea";
import { useAdminPage } from "@/components/features/admin/admin-page-context";

type KnowledgeDocument = {
  id: number;
  title: string;
  content: string;
  sourceType: string;
  sourceRef?: string;
  indexed: boolean;
  updatedAt?: string;
};

const API_ROOT = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1").replace(/\/api\/v1$/, "");

async function apiRequest<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_ROOT}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(options?.headers || {}) },
    ...options,
  });
  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload?.message || "Request failed");
  }
  return payload.data;
}

export default function AiKnowledgePage() {
  const [documents, setDocuments] = useState<KnowledgeDocument[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [reindexing, setReindexing] = useState(false);

  useAdminPage({
    titleKey: "ai_knowledge_title",
    subtitleKey: "ai_knowledge_subtitle",
  });

  const loadDocuments = async () => {
    setLoading(true);
    try {
      setDocuments(await apiRequest<KnowledgeDocument[]>("/api/admin/ai/knowledge"));
    } catch {
      toast.error("Khong the tai knowledge documents");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const createDocument = async () => {
    if (!title.trim() || !content.trim()) {
      toast.error("Vui long nhap tieu de va noi dung");
      return;
    }
    setSaving(true);
    try {
      await apiRequest<KnowledgeDocument>("/api/admin/ai/knowledge", {
        method: "POST",
        body: JSON.stringify({ title, content, sourceType: "ADMIN_FAQ" }),
      });
      setTitle("");
      setContent("");
      toast.success("Da them knowledge document");
      await loadDocuments();
    } catch {
      toast.error("Them knowledge document that bai");
    } finally {
      setSaving(false);
    }
  };

  const reindex = async () => {
    setReindexing(true);
    try {
      const result = await apiRequest<{ indexedDocuments: number }>("/api/admin/ai/reindex", {
        method: "POST",
      });
      toast.success(`Da index ${result.indexedDocuments} tai lieu`);
      await loadDocuments();
    } catch {
      toast.error("Re-index that bai");
    } finally {
      setReindexing(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="grid gap-4 lg:grid-cols-[420px_1fr]">
        <div className="rounded-sm border border-light-gray-surface bg-white p-5 dark:border-dark-surface dark:bg-dark-surface">
          <div className="mb-4 flex items-center gap-2 font-semibold uppercase tracking-tight">
            <Plus size={18} className="text-brand-red" />
            Them FAQ / tai lieu noi bo
          </div>
          <div className="space-y-3">
            <Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Tieu de" />
            <Textarea
              value={content}
              onChange={(event) => setContent(event.target.value)}
              placeholder="Noi dung knowledge document"
              className="min-h-40"
            />
            <Button onClick={createDocument} disabled={saving} className="w-full">
              {saving ? "Dang luu..." : "Luu va index"}
            </Button>
          </div>
        </div>

        <div className="rounded-sm border border-light-gray-surface bg-white p-5 dark:border-dark-surface dark:bg-dark-surface">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 font-semibold uppercase tracking-tight">
              <Database size={18} className="text-brand-red" />
              Knowledge base
            </div>
            <Button onClick={reindex} disabled={reindexing} variant="outline" size="sm">
              <RefreshCw size={15} className={reindexing ? "animate-spin" : ""} />
              {reindexing ? "Dang index..." : "Re-index"}
            </Button>
          </div>

          <div className="overflow-hidden rounded-sm border border-light-gray-surface dark:border-neutral-800">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500 dark:bg-neutral-900">
                <tr>
                  <th className="px-4 py-3">Tai lieu</th>
                  <th className="px-4 py-3">Nguon</th>
                  <th className="px-4 py-3">Trang thai</th>
                </tr>
              </thead>
              <tbody>
                {documents.map((document) => (
                  <tr key={document.id} className="border-t border-light-gray-surface dark:border-neutral-800">
                    <td className="px-4 py-3">
                      <div className="font-medium">{document.title}</div>
                      <div className="mt-1 line-clamp-2 text-xs text-gray-500">{document.content}</div>
                    </td>
                    <td className="px-4 py-3 text-xs">
                      <div>{document.sourceType}</div>
                      <div className="text-gray-400">{document.sourceRef || "-"}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={document.indexed ? "text-green-600" : "text-amber-600"}>
                        {document.indexed ? "Indexed" : "Not indexed"}
                      </span>
                    </td>
                  </tr>
                ))}
                {!loading && documents.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-4 py-8 text-center text-gray-400">
                      Chua co tai lieu knowledge.
                    </td>
                  </tr>
                )}
                {loading && (
                  <tr>
                    <td colSpan={3} className="px-4 py-8 text-center text-gray-400">
                      Dang tai...
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
