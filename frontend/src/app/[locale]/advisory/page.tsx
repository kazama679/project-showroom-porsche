"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  Bot,
  Database,
  Globe2,
  LogIn,
  MessageSquare,
  PanelLeft,
  Plus,
  Search,
  Send,
  X,
} from "lucide-react";

import { authService } from "@/services/auth";

type AiSource = {
  id: number;
  title: string;
  sourceType: string;
  sourceRef?: string;
  imageUrl?: string;
  score?: number;
};

type ChatMessage = {
  role: "user" | "assistant";
  text: string;
  sources?: AiSource[];
  usedInternalKnowledge?: boolean;
  confidence?: number;
};

type ChatSession = {
  id: string;
  title: string;
  updatedAt: string;
  messages: ChatMessage[];
};

const API_ROOT = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1").replace(/\/api\/v1$/, "");
const HISTORY_KEY = "porsche-ai-chat-history";

const initialMessage: ChatMessage = {
  role: "assistant",
  text: "Xin chào. Hãy hỏi về xe Porsche, option, showroom hoặc chính sách lái thử. Nếu có dữ liệu nội bộ phù hợp, tôi sẽ hiển thị nguồn đã dùng.",
  usedInternalKnowledge: true,
  sources: [],
  confidence: 0,
};

async function postAiChat(message: string) {
  const response = await fetch(`${API_ROOT}/api/ai/chat`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload?.message || "AI request failed");
  }
  return payload.data;
}

function loadHistory(): ChatSession[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveHistory(sessions: ChatSession[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(HISTORY_KEY, JSON.stringify(sessions.slice(0, 24)));
}

export default function AdvisoryPage() {
  const params = useParams<{ locale: string }>();
  const router = useRouter();
  const locale = params.locale || "vi";
  const isAuthenticated = authService.isAuthenticated();

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([initialMessage]);

  useEffect(() => {
    setSessions(loadHistory());
  }, []);

  const hasUserMessages = useMemo(() => messages.some((message) => message.role === "user"), [messages]);

  const visibleSources = (sources?: AiSource[]) =>
    (sources || []).filter((source) => source.sourceType !== "DATABASE_CAR_MODEL");
  const modelSources = (sources?: AiSource[]) =>
    (sources || []).filter((source) => source.sourceType === "DATABASE_CAR_MODEL");
  const modelHref = (source: AiSource) => `/${locale}/models/${source.sourceRef || source.id}`;

  const persistCurrentSession = (nextMessages: ChatMessage[]) => {
    if (!isAuthenticated || !nextMessages.some((message) => message.role === "user")) return;

    const firstUserMessage = nextMessages.find((message) => message.role === "user")?.text || "Đoạn chat mới";
    const sessionId = activeSessionId || crypto.randomUUID();
    const session: ChatSession = {
      id: sessionId,
      title: firstUserMessage.slice(0, 42),
      updatedAt: new Date().toISOString(),
      messages: nextMessages,
    };

    setActiveSessionId(sessionId);
    setSessions((current) => {
      const next = [session, ...current.filter((item) => item.id !== sessionId)];
      saveHistory(next);
      return next;
    });
  };

  const resetChat = () => {
    setActiveSessionId(null);
    setMessages([initialMessage]);
    setInput("");
  };

  const handleNewChat = () => {
    if (!isAuthenticated) {
      setLoginModalOpen(true);
      return;
    }
    persistCurrentSession(messages);
    resetChat();
  };

  const confirmClearWithoutLogin = () => {
    setLoginModalOpen(false);
    resetChat();
  };

  const openSession = (session: ChatSession) => {
    setActiveSessionId(session.id);
    setMessages(session.messages);
  };

  const send = async () => {
    const message = input.trim();
    if (!message || loading) return;

    setInput("");
    setLoading(true);
    const userMessages = [...messages, { role: "user" as const, text: message }];
    setMessages(userMessages);

    try {
      const data = await postAiChat(message);
      const nextMessages = [
        ...userMessages,
        {
          role: "assistant" as const,
          text: data.answer || "Hệ thống chưa có câu trả lời.",
          sources: data.sources || [],
          usedInternalKnowledge: data.usedInternalKnowledge,
          confidence: data.confidence,
        },
      ];
      setMessages(nextMessages);
      persistCurrentSession(nextMessages);
    } catch {
      const nextMessages = [
        ...userMessages,
        {
          role: "assistant" as const,
          text: "Không thể kết nối module AI. Vui lòng thử lại sau.",
          sources: [],
          usedInternalKnowledge: false,
          confidence: 0,
        },
      ];
      setMessages(nextMessages);
      persistCurrentSession(nextMessages);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-black text-white">
      <aside
        className={`${
          sidebarOpen ? "w-[320px]" : "w-0"
        } shrink-0 overflow-hidden border-r border-white/10 bg-[#050505] transition-[width] duration-200`}
      >
        <div className="flex h-full w-[320px] flex-col">
          <div className="flex items-center justify-between px-4 py-4">
            <Link href={`/${locale}`} className="text-xl font-semibold">
              Porsche AI
            </Link>
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="rounded-md p-2 text-white/60 hover:bg-white/10 hover:text-white"
              aria-label="Ẩn thanh bên"
            >
              <PanelLeft size={19} />
            </button>
          </div>

          <nav className="space-y-1 px-3">
            <button
              type="button"
              onClick={handleNewChat}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-white hover:bg-white/10"
            >
              <Plus size={18} />
              Đoạn chat mới
            </button>
            <button
              type="button"
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-white/85 hover:bg-white/10"
            >
              <Search size={18} />
              Tìm kiếm đoạn chat
            </button>
          </nav>

          <div className="mt-6 flex-1 overflow-y-auto px-3">
            <div className="mb-2 px-3 text-xs font-semibold text-white/70">Gần đây</div>
            {isAuthenticated && sessions.length > 0 && (
              <div className="space-y-1">
                {sessions.map((session) => (
                  <button
                    key={session.id}
                    type="button"
                    onClick={() => openSession(session)}
                    className={`flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm ${
                      activeSessionId === session.id ? "bg-white/15 text-white" : "text-white/85 hover:bg-white/10"
                    }`}
                  >
                    <MessageSquare size={16} className="shrink-0 text-white/55" />
                    <span className="truncate">{session.title}</span>
                  </button>
                ))}
              </div>
            )}
            {isAuthenticated && sessions.length === 0 && (
              <p className="px-3 text-sm text-white/40">Chưa có đoạn chat nào.</p>
            )}
            {!isAuthenticated && (
              <div className="mt-4 rounded-lg border border-white/10 p-4 text-sm text-white/55">
                Đăng nhập để lưu và xem lại lịch sử trò chuyện.
              </div>
            )}
          </div>

          {!isAuthenticated && (
            <div className="border-t border-white/10 p-3">
              <button
                type="button"
                onClick={() => router.push(`/${locale}/auth/login`)}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-white px-4 py-3 text-sm font-semibold text-black hover:bg-white/90"
              >
                <LogIn size={17} />
                Đăng nhập
              </button>
            </div>
          )}
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-white/10 px-4">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className={`rounded-md p-2 text-white/65 hover:bg-white/10 hover:text-white ${sidebarOpen ? "invisible" : ""}`}
            aria-label="Hiện thanh bên"
          >
            <PanelLeft size={20} />
          </button>
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Bot size={18} className="text-brand-red" />
            AI RAG Advisor
          </div>
          <div className="w-9" />
        </header>

        <main className="flex min-h-0 flex-1 flex-col">
          <div className="flex-1 overflow-y-auto px-4 py-6">
            <div className="mx-auto flex max-w-4xl flex-col gap-6">
              {messages.map((message, index) => (
                <div key={index} className={message.role === "user" ? "flex justify-end" : "flex justify-start"}>
                  <div
                    className={`max-w-[85%] rounded-2xl px-5 py-3 text-sm leading-6 ${
                      message.role === "user"
                        ? "bg-white text-black"
                        : "bg-[#181818] text-white"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{message.text}</p>

                    {modelSources(message.sources).length > 0 && (
                      <div className="mt-4 grid gap-3">
                        {modelSources(message.sources).map((source) => (
                          <Link
                            key={`${source.sourceType}-${source.id}`}
                            href={modelHref(source)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group w-full max-w-[460px] overflow-hidden rounded-lg border border-white/10 bg-black/35 transition hover:bg-black/45"
                          >
                            {source.imageUrl ? (
                              <div className="relative aspect-[16/8.2] w-full bg-[#111]">
                                <Image
                                  src={source.imageUrl}
                                  alt={source.title}
                                  fill
                                  sizes="(max-width: 640px) 85vw, 460px"
                                  className="object-contain transition group-hover:scale-[1.02]"
                                />
                              </div>
                            ) : (
                              <div className="flex aspect-[16/8.2] w-full items-center justify-center bg-neutral-950 text-sm text-white/40">
                                Chưa có ảnh
                              </div>
                            )}
                            <div className="flex min-h-12 items-center justify-between gap-3 px-3 py-2">
                              <span className="min-w-0 truncate text-base font-semibold text-white">{source.title}</span>
                              <span className="shrink-0 text-sm font-medium text-brand-red">Xem chi tiết</span>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}

                    {message.role === "assistant" && (
                      <div className="mt-3 border-t border-white/10 pt-3 text-xs text-white/55">
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="inline-flex items-center gap-1">
                            {message.usedInternalKnowledge ? <Database size={13} /> : <Globe2 size={13} />}
                            {message.usedInternalKnowledge ? "Dữ liệu nội bộ" : "Kiến thức nền"}
                          </span>
                          <span>Confidence: {message.confidence ?? 0}</span>
                        </div>
                        {visibleSources(message.sources).length > 0 && (
                          <div className="mt-2 space-y-1">
                            {visibleSources(message.sources).map((source) => (
                              <div key={`${source.sourceType}-${source.id}`} className="rounded-sm bg-black/35 px-2 py-1">
                                {source.title} - {source.sourceType}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {loading && <div className="text-sm text-white/40">AI đang xử lý...</div>}
            </div>
          </div>

          <div className="px-4 pb-5">
            <div className="mx-auto flex max-w-4xl items-center gap-2 rounded-3xl border border-white/10 bg-[#1f1f1f] px-4 py-3">
              <button
                type="button"
                onClick={handleNewChat}
                className="rounded-full p-2 text-white/60 hover:bg-white/10 hover:text-white"
                aria-label="Đoạn chat mới"
              >
                <Plus size={20} />
              </button>
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") send();
                }}
                className="min-h-10 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/40"
                placeholder="Hỏi bất kỳ điều gì"
              />
              <button
                onClick={send}
                disabled={loading || !input.trim()}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-black disabled:opacity-45"
                aria-label="Gửi"
              >
                <Send size={18} />
              </button>
            </div>
            <p className="mt-2 text-center text-xs text-white/35">
              Porsche AI có thể mắc lỗi. Hãy kiểm tra các thông tin quan trọng.
            </p>
          </div>
        </main>
      </div>

      {loginModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
          <div className="w-full max-w-[480px] rounded-3xl bg-[#262626] p-7 text-center shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <div />
              <h2 className="text-2xl font-semibold">Xóa đoạn chat hiện tại?</h2>
              <button
                type="button"
                onClick={() => setLoginModalOpen(false)}
                className="rounded-full p-1 text-white/75 hover:bg-white/10 hover:text-white"
                aria-label="Đóng"
              >
                <X size={22} />
              </button>
            </div>
            <p className="mx-auto mb-7 max-w-sm text-base leading-7 text-white/80">
              Để khởi động một đoạn chat mới, cuộc trò chuyện hiện tại của bạn sẽ bị xóa. Hãy{" "}
              <span className="font-semibold text-white">đăng ký</span> hoặc{" "}
              <span className="font-semibold text-white">đăng nhập</span> để lưu các đoạn chat.
            </p>
            <div className="space-y-3">
              <button
                type="button"
                onClick={confirmClearWithoutLogin}
                className="w-full rounded-full bg-white px-5 py-3 font-semibold text-black hover:bg-white/90"
              >
                Xóa đoạn chat
              </button>
              <button
                type="button"
                onClick={() => router.push(`/${locale}/auth/login`)}
                className="w-full rounded-full border border-white/15 px-5 py-3 font-semibold text-white hover:bg-white/10"
              >
                Đăng nhập
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
