'use client'

import React, { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { apiClient } from '@/lib/api'
import { authService } from '@/services/auth'
import { MessageSquare, Plus, Bot, X, Menu, ChevronLeft, ChevronRight } from 'lucide-react'

interface CarRec {
  id: number
  name: string
  price: string
  description: string
  imageUrl: string
  features: string[]
}

interface Message {
  id: number
  sender: 'AI' | 'USER'
  text: string
  recommendedCars?: CarRec[]
  time: string
}

interface Session {
  id: number
  createdAt: string
  preview?: string
}

const CarCarousel = ({ cars }: { cars: CarRec[] }) => {
  const scrollRef = useRef<HTMLDivElement>(null)

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 296 // 280px width + 16px gap
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      })
    }
  }

  return (
    <div className="relative group mt-4 w-full">
      {cars.length > 2 && (
        <button
          onClick={() => scroll('left')}
          title="Cuộn sang trái"
          className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-[#1e1e1e] hover:bg-[#333] text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all border border-white/20 shadow-[0_0_15px_rgba(0,0,0,0.8)]"
        >
          <ChevronLeft size={24} />
        </button>
      )}
      
      <div 
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-6 pt-2 w-full snap-x 
          [&::-webkit-scrollbar]:h-2
          [&::-webkit-scrollbar-track]:bg-black/20 
          [&::-webkit-scrollbar-track]:rounded-full 
          [&::-webkit-scrollbar-thumb]:bg-white/20 
          hover:[&::-webkit-scrollbar-thumb]:bg-white/40 
          [&::-webkit-scrollbar-thumb]:rounded-full"
      >
        {cars.map((car) => (
          <div key={car.id} className="w-[280px] flex-shrink-0 bg-[#1e1e1e] border border-white/10 flex flex-col rounded-md overflow-hidden snap-start hover:border-white/30 transition-colors">
            {car.imageUrl ? (
              <div className="h-40 relative overflow-hidden bg-black">
                <img src={car.imageUrl} alt={car.name} className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="h-40 bg-black flex flex-col items-center justify-center">
                <div className="text-white text-3xl font-bold mb-1">P</div>
                <div className="text-white/50 text-xs uppercase tracking-widest">{car.name}</div>
              </div>
            )}
            <div className="p-4 flex flex-col flex-1">
              <h3 className="text-white font-semibold text-base mb-1">{car.name}</h3>
              <div className="text-brand-red font-bold text-lg mb-3">{car.price}</div>
              <p className="text-white/60 text-[13px] mb-4 leading-relaxed line-clamp-2">{car.description}</p>
              
              {car.features && car.features.length > 0 && (
                <div className="mb-4 flex-1">
                  <div className="text-white/30 text-[11px] uppercase tracking-wider mb-2 font-semibold">Tính năng nổi bật</div>
                  <ul className="text-[13px] text-white/80 space-y-1.5 list-none">
                    {car.features.slice(0, 3).map((f, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-brand-red font-bold block mt-[2px]">•</span>
                        <span className="line-clamp-1">{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              <a 
                href={`/models/${car.id}`}
                target="_blank"
                rel="noopener noreferrer" 
                className="bg-white text-black text-center py-2.5 text-sm font-semibold hover:bg-gray-200 transition-colors block mt-auto rounded-sm group/link flex items-center justify-center gap-2"
              >
                Tìm hiểu thêm
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-50 group-hover/link:opacity-100 transition-opacity">
                  <path d="M7 17l9.2-9.2M17 17V7H7"/>
                </svg>
              </a>
            </div>
          </div>
        ))}
      </div>

      {cars.length > 2 && (
        <button
          onClick={() => scroll('right')}
          title="Cuộn sang phải"
          className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-[#1e1e1e] hover:bg-[#333] text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all border border-white/20 shadow-[0_0_15px_rgba(0,0,0,0.8)]"
        >
          <ChevronRight size={24} />
        </button>
      )}
    </div>
  )
}

export default function AdvisoryPage() {
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      sender: 'AI',
      text: 'Xin chào! Chào mừng đến với Cố vấn Porsche. Tôi là chuyên viên tư vấn AI của bạn, sẵn sàng phân tích ngân sách và đề xuất chiếc Porsche hoàn hảo dành cho bạn. Để bắt đầu, vui lòng cho tôi biết bạn dự toán đầu tư khoảng bao nhiêu?',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId, setSessionId] = useState<number | null>(null)
  const [sessions, setSessions] = useState<Session[]>([])
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const loadSessions = async () => {
    if (!authService.isAuthenticated()) return
    
    try {
      const res = await apiClient.get<any>('/ai-chat/sessions')
      // Lấy trực tiếp dự liệu vì API trả về list qua ok() hoặc wrapped tùy theo apiClient
      const data = res.data ?? res
      if (Array.isArray(data)) {
        setSessions(data)
      } else if (Array.isArray((data as any).data)) {
        setSessions((data as any).data)
      }
    } catch (e) {
      console.error('Không thể tải danh sách session', e)
    }
  }

  useEffect(() => {
    loadSessions()
  }, [])

  const resetChat = () => {
    setSessionId(null)
    setMessages([
      {
        id: Date.now(),
        sender: 'AI',
        text: 'Xin chào! Chào mừng đến với Cố vấn Porsche. Tôi là chuyên viên tư vấn AI của bạn, sẵn sàng phân tích ngân sách và đề xuất chiếc Porsche hoàn hảo dành cho bạn. Để bắt đầu, vui lòng cho tôi biết bạn dự toán đầu tư khoảng bao nhiêu?',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ])
  }

  const handleNewChatClick = () => {
    if (!authService.isAuthenticated()) {
      setShowLoginModal(true)
    } else {
      resetChat()
    }
  }

  const confirmResetChat = () => {
    setShowLoginModal(false)
    resetChat()
  }

  const loadSessionHistory = async (sid: number) => {
    setLoadingHistory(true)
    try {
      const res = await apiClient.get<any>(`/ai-chat/${sid}`)
      const data = res.data ?? res
      const historyData = Array.isArray(data) ? data : (data.data || [])
      
      const historyMessages: Message[] = historyData.map((msg: any) => ({
        id: msg.id,
        sender: msg.sender as 'AI' | 'USER',
        text: msg.content,
        recommendedCars: msg.recommendedCars || [],
        time: new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }))
      
      if (historyMessages.length === 0) {
        historyMessages.push({
          id: Date.now(),
          sender: 'AI',
          text: 'Xin chào! Đoạn trò chuyện này không có lịch sử. Tôi có thể giúp gì cho bạn?',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        })
      }
      
      setMessages(historyMessages)
      setSessionId(sid)
    } catch (e) {
      console.error('Không thể tải lịch sử chat', e)
    } finally {
      setLoadingHistory(false)
    }
  }

  const handleSend = async () => {
    if (!input.trim()) return
    const userText = input
    setInput('')

    const userMsg: Message = {
      id: Date.now(),
      sender: 'USER',
      text: userText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
    setMessages(prev => [...prev, userMsg])
    setIsLoading(true)

    try {
      const payload: any = { message: userText }
      if (sessionId) payload.sessionId = sessionId
      
      const res = await apiClient.post<any>('/ai-chat', payload)
      const data = res.data ?? res

      const newSessionId = data.sessionId ?? data.data?.sessionId
      if (newSessionId && !sessionId) {
        setSessionId(newSessionId)
        // Tải lại sidebar để hiển thị session mới
        if (authService.isAuthenticated()) {
          loadSessions()
        }
      }

      const responseText = data.responseText ?? data.data?.responseText ?? 'Không có phản hồi từ AI.'
      const recommendedCars = data.recommendedCars ?? data.data?.recommendedCars ?? []

      const aiMsg: Message = {
        id: Date.now() + 1,
        sender: 'AI',
        text: responseText,
        recommendedCars,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
      setMessages(prev => [...prev, aiMsg])
    } catch (err: any) {
      console.error('AI chat error', err)
      const statusCode = err?.code || err?.status
      const errText = statusCode === 401
        ? 'Bạn cần đăng nhập để sử dụng tính năng tư vấn AI. Vui lòng đăng nhập và thử lại.'
        : 'Đã xảy ra lỗi khi kết nối với chuyên viên tư vấn AI. Vui lòng thử lại sau.'
      setMessages(prev => [...prev, {
        id: Date.now() + 2,
        sender: 'AI',
        text: errText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }])
    }

    setIsLoading(false)
  }

  return (
    <div className="h-screen bg-[#0f0f0f] flex relative overflow-hidden">
      {/* ── Login Modal ── */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#171717] border border-white/10 p-6 rounded-lg max-w-sm w-full shadow-2xl relative">
            <button
              onClick={() => setShowLoginModal(false)}
              className="absolute top-4 right-4 text-white/50 hover:text-white transition"
            >
              <X size={20} />
            </button>
            <h3 className="text-white text-lg font-semibold mb-2">Xóa đoạn chat hiện tại?</h3>
            <p className="text-white/60 text-sm mb-6 leading-relaxed">
              Để khởi động một đoạn chat mới, cuộc trò chuyện hiện tại của bạn sẽ bị xóa. Hãy đăng ký hoặc đăng nhập để lưu các đoạn chat.
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={confirmResetChat}
                className="w-full bg-white text-black font-semibold py-2.5 px-4 rounded hover:bg-gray-200 transition"
              >
                Xóa đoạn chat
              </button>
              <button
                onClick={() => router.push('/auth/login')}
                className="w-full bg-[#333] hover:bg-[#444] text-white font-semibold py-2.5 px-4 rounded transition"
              >
                Đăng nhập
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Sidebar ── */}
      <aside
        className={`${sidebarOpen ? 'w-[280px]' : 'w-0'} transition-all duration-300 overflow-hidden flex-shrink-0 bg-[#171717] border-r border-white/10 flex flex-col z-20`}
      >
        {/* Sidebar header */}
        <Link href="/" className="p-4 flex items-center justify-between border-b border-white/10 h-[60px] hover:bg-white/5 cursor-pointer transition-colors block w-full">
          <div className="flex items-center gap-2">
            <div className="bg-brand-red w-7 h-7 flex items-center justify-center text-white font-bold text-sm">P</div>
            <span className="text-white font-semibold text-sm tracking-wide">Cố vấn Porsche</span>
          </div>
        </Link>

        {/* New chat button */}
        <div className="p-3">
          <button
            onClick={handleNewChatClick}
            className="w-full flex items-center gap-2 px-3 py-2 rounded text-white/80 hover:bg-white/10 hover:text-white transition text-sm font-medium"
          >
            <Plus size={16} />
            <span>Đoạn chat mới</span>
          </button>
        </div>

        {/* Session list */}
        <div className="flex-1 overflow-y-auto px-3 pb-4 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-white/10 hover:[&::-webkit-scrollbar-thumb]:bg-white/20 [&::-webkit-scrollbar-track]:bg-transparent">
          {sessions.length > 0 && (
            <>
              <p className="text-white/30 text-xs uppercase tracking-wider px-2 pb-2 mt-2">Gần đây</p>
              {sessions.map(s => (
                <button
                  key={s.id}
                  onClick={() => loadSessionHistory(s.id)}
                  className={`w-full text-left flex items-start gap-3 px-3 py-2.5 rounded text-sm transition mb-1
                    ${sessionId === s.id ? 'bg-white/15 text-white' : 'text-white/60 hover:bg-white/5 hover:text-white/90'}`}
                >
                  <MessageSquare size={14} className="flex-shrink-0 mt-0.5" />
                  <div className="flex flex-col overflow-hidden">
                    <span className="truncate w-full font-medium mb-0.5">Phiên {s.id}</span>
                    {s.preview && (
                      <span className="truncate w-full text-xs text-white/40">{s.preview}</span>
                    )}
                  </div>
                </button>
              ))}
            </>
          )}
          {sessions.length === 0 && authService.isAuthenticated() && (
            <p className="text-white/25 text-xs px-2 pt-2 italic">Chưa có lịch sử chat</p>
          )}
          {sessions.length === 0 && !authService.isAuthenticated() && (
            <div className="px-2 pt-4">
              <p className="text-white/25 text-xs italic mb-2">Đăng nhập để xem lịch sử</p>
            </div>
          )}
        </div>

        {/* Back to home */}
        <div className="p-3 border-t border-white/10">
          <Link
            href="/"
            className="flex items-center gap-2 px-3 py-2 text-white/50 hover:text-white text-xs transition"
          >
            ← Về trang chủ
          </Link>
        </div>
      </aside>

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Top Bar */}
        <div className="bg-[#1a1a1a] border-b border-white/10 px-4 flex items-center gap-3 sticky top-0 z-10 h-[60px]">
          <button
            onClick={() => setSidebarOpen(o => !o)}
            className="text-white/60 hover:text-white transition p-1.5 rounded hover:bg-white/5"
          >
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2">
            <Bot size={18} className="text-brand-red" />
            <span className="text-white font-semibold text-sm">Tư vấn xe Porsche AI</span>
          </div>
          <div className="ml-auto text-xs text-white/30 hidden sm:block">Đề xuất xe hỗ trợ bởi AI</div>
        </div>

        {/* Chat area */}
        <div className="flex-1 overflow-y-auto px-4 py-8">
          <div className="max-w-4xl mx-auto flex flex-col gap-8">
            {loadingHistory && (
              <div className="text-center text-white/40 text-sm py-8">Đang tải lịch sử...</div>
            )}
            
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === 'USER' ? 'justify-end' : 'justify-start'}`}>
                {msg.sender === 'AI' && (
                  <div className="bg-brand-red text-white font-bold w-8 h-8 flex-shrink-0 flex items-center justify-center mr-4 text-sm mt-1 rounded-sm">
                    P
                  </div>
                )}
                <div className={`flex flex-col min-w-0 ${msg.sender === 'USER' ? 'max-w-[70%]' : 'max-w-[85%] w-full'}`}>
                  <div className={`px-5 py-3.5 text-[15px] leading-relaxed break-words rounded-xl
                    ${msg.sender === 'USER'
                      ? 'bg-[#2a2a2a] text-white/95 ml-auto'
                      : 'bg-transparent text-white/95'}`}
                  >
                    {msg.text}
                    {msg.sender === 'USER' && <div className="text-xs text-white/30 mt-2 text-right">{msg.time}</div>}
                  </div>

                  {/* Car recommendation carousel */}
                  {msg.recommendedCars && msg.recommendedCars.length > 0 && (
                    <CarCarousel cars={msg.recommendedCars} />
                  )}
                  {msg.sender === 'AI' && <div className="text-xs text-white/30 mt-2 px-5">{msg.time}</div>}
                </div>
                {msg.sender === 'USER' && (
                  <div className="bg-[#333] text-white font-bold w-8 h-8 flex-shrink-0 flex items-center justify-center ml-4 text-xs mt-1 rounded-sm">
                    Bạn
                  </div>
                )}
              </div>
            ))}

            {/* Loading dots */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-brand-red text-white font-bold w-8 h-8 flex-shrink-0 flex items-center justify-center mr-4 text-sm rounded-sm z-10">P</div>
                <div className="px-5 py-3.5 bg-transparent rounded-xl flex items-center h-[52px]">
                  <div className="flex gap-1.5 items-center">
                    <span className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} className="h-4" />
          </div>
        </div>

        {/* Input area */}
        <div className="bg-[#171717] border-t border-white/10 px-4 py-5 shadow-2xl relative z-20">
          <div className="max-w-4xl mx-auto flex flex-col gap-2 relative">
            <div className="flex gap-2">
              <input
                type="text"
                className="flex-1 bg-[#222] border border-white/10 text-white placeholder-white/30 px-5 py-3.5 text-[15px] outline-none focus:border-brand-red transition-colors rounded-lg shadow-inner"
                placeholder="Ví dụ: Ngân hàng cho vay được 3 tỉ, tôi muốn mua xe gầm cao..."
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !isLoading && handleSend()}
              />
              <button
                disabled={isLoading || !input.trim()}
                className="bg-brand-red hover:bg-red-700 disabled:opacity-50 disabled:hover:bg-brand-red text-white font-bold px-6 py-3.5 transition-colors uppercase tracking-wider text-sm rounded-lg flex items-center justify-center min-w-[100px]"
                onClick={handleSend}
              >
                Gửi
              </button>
            </div>
            <p className="text-xs text-white/30 text-center mt-1">
              Porsche AI có thể mắc lỗi. Hãy kiểm tra các thông tin quan trọng với đại lý.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
