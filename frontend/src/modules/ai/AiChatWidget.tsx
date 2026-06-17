/* ── AI Chatbot Floating Widget ──────────────────────────────────
   A floating chat bubble in the bottom-right corner.
   Click to expand → full conversational AI agent interface.
   Supports SSE streaming, markdown rendering, confirmation flow.
   ─────────────────────────────────────────────────────────────── */

import { useState, useRef, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { streamChat } from '../../services/aiService';
import type { AiStreamEvent, PendingAction } from '../../services/aiService';
import useAuthStore from '../../store/authStore';
import type { UserProfileDto } from '../../types/auth';
import './AiChatWidget.css';

/* ── Types ─────────────────────────────────────────────────── */

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  pendingAction?: PendingAction | null;
  requiresConfirmation?: boolean;
  quickReplies?: string[];
}

/* ── Component ──────────────────────────────────────────────── */

export default function AiChatWidget() {
  const { pathname } = useLocation();
  // Hide widget entirely on chat/messages pages and auth pages
  const isHiddenPage = pathname.includes('/messages') || pathname.includes('/login') || pathname.includes('/register') || pathname.includes('/forgot-password');
  
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem('totoro_ai_chat_messages');
      if (saved) {
        return JSON.parse(saved).map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) }));
      }
    } catch {}
    return [
      {
        id: 'welcome',
        role: 'assistant',
        content: 'Xin chào! 🌿 Mình là **Totoro AI**, trợ lý tìm phòng trọ cho sinh viên.\n\nBạn cần mình giúp gì nào?',
        timestamp: new Date(),
        quickReplies: ['🏠 Tìm phòng trọ', '👥 Tìm bạn ở ghép', '📊 So sánh phòng'],
      },
    ];
  });
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);

  const user = useAuthStore((s: { user: UserProfileDto | null }) => s.user);
  
  // Persist threadId
  const [tid] = useState(() => {
    let t = localStorage.getItem('totoro_ai_thread_id');
    if (!t) {
      t = `thread_${Date.now()}_${Math.random().toString(36).slice(2)}`;
      localStorage.setItem('totoro_ai_thread_id', t);
    }
    return t;
  });
  const threadId = useRef<string>(tid);

  // Persist messages
  useEffect(() => {
    localStorage.setItem('totoro_ai_chat_messages', JSON.stringify(messages));
  }, [messages]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isStreaming]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  /* ── Send message ───────────────────────────────────────── */
  const sendMessage = useCallback(async (text: string, confirmAction?: boolean) => {
    if (isStreaming) return;
    const trimmed = text.trim();
    if (!trimmed && confirmAction === undefined) return;

    // Add user message
    if (trimmed) {
      const userMsg: ChatMessage = {
        id: `user_${Date.now()}`,
        role: 'user',
        content: trimmed,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMsg]);
    }

    setInput('');
    setIsStreaming(true);

    // Add placeholder for assistant response
    const assistantId = `ai_${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      { id: assistantId, role: 'assistant', content: '', timestamp: new Date() },
    ]);

    let accumulated = '';

    await streamChat(
      {
        message: trimmed || (confirmAction ? 'Có' : 'Không'),
        thread_id: threadId.current,
        user_id: user?.email || 'anonymous',
        confirm_action: confirmAction ?? null,
      },
      // onToken
      (token: string) => {
        accumulated += token;
        setMessages((prev) =>
          prev.map((m) => (m.id === assistantId ? { ...m, content: accumulated } : m)),
        );
      },
      // onDone
      (event: AiStreamEvent) => {
        const finalContent = event.reply || accumulated;
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? {
                  ...m,
                  content: finalContent,
                  pendingAction: event.pending_action,
                  requiresConfirmation: event.requires_confirmation,
                }
              : m,
          ),
        );
        if (event.pending_action) {
          setPendingAction(event.pending_action);
        } else {
          setPendingAction(null);
        }
        setIsStreaming(false);
      },
      // onError
      (error: string) => {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? { ...m, content: `❌ ${error}` }
              : m,
          ),
        );
        setIsStreaming(false);
      },
    );
  }, [isStreaming, user]);

  /* ── Confirm / Cancel action ────────────────────────────── */
  const handleConfirm = (confirmed: boolean) => {
    setPendingAction(null);
    sendMessage(confirmed ? 'Có, tôi xác nhận.' : 'Không, hủy bỏ.', confirmed);
  };

  /* ── Submit ─────────────────────────────────────────────── */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  /* ── Simple markdown renderer ───────────────────────────── */
  const renderMarkdown = (text: string) => {
    // Bold
    let html = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    // Line breaks
    html = html.replace(/\n/g, '<br/>');
    return html;
  };

  /* ── Render ─────────────────────────────────────────────── */
  if (isHiddenPage) return null;

  return (
    <>
      {/* Floating button */}
      <button
        className="ai-chat-fab"
        onClick={() => setIsOpen(!isOpen)}
        title="Totoro AI Assistant"
      >
        {isOpen ? '✕' : '🌿'}
      </button>

      {/* Chat panel */}
      {isOpen && (
        <div className="ai-chat-panel">
          {/* Header */}
          <div className="ai-chat-header">
            <div className="ai-chat-header-info">
              <span className="ai-chat-avatar">🌿</span>
              <div>
                <div className="ai-chat-title">Totoro AI</div>
                <div className="ai-chat-subtitle">Trợ lý tìm phòng thông minh</div>
              </div>
            </div>
            <button className="ai-chat-close" onClick={() => setIsOpen(false)}>✕</button>
          </div>

          {/* Messages */}
          <div className="ai-chat-messages" ref={scrollRef}>
            {messages.map((msg) => (
              <div key={msg.id} className={`ai-chat-msg ai-chat-msg--${msg.role}`}>
                {msg.role === 'assistant' && <span className="ai-msg-avatar">🌿</span>}
                {msg.content && (
                  <div
                    className="ai-msg-bubble"
                    dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }}
                  />
                )}
              </div>
            ))}

            {/* Quick Replies for the latest message */}
            {!isStreaming && messages.length > 0 && messages[messages.length - 1].quickReplies && (
              <div className="ai-quick-replies ai-quick-replies--bottom">
                {messages[messages.length - 1].quickReplies!.map((reply, idx) => (
                  <button
                    key={idx}
                    className="ai-quick-reply-btn"
                    onClick={() => sendMessage(reply)}
                  >
                    {reply}
                  </button>
                ))}
              </div>
            )}

            {/* Streaming indicator */}
            {isStreaming && (
              <div className="ai-chat-typing">
                <span className="ai-msg-avatar">🌿</span>
                <div className="ai-typing-dots">
                  <span></span><span></span><span></span>
                </div>
              </div>
            )}

            {/* Confirmation buttons */}
            {pendingAction && !isStreaming && (
              <div className="ai-chat-confirm">
                <button className="ai-confirm-yes" onClick={() => handleConfirm(true)}>
                  ✅ Có, thực hiện
                </button>
                <button className="ai-confirm-no" onClick={() => handleConfirm(false)}>
                  ❌ Không, hủy
                </button>
              </div>
            )}
          </div>

          {/* Input */}
          <form className="ai-chat-input-bar" onSubmit={handleSubmit}>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Hỏi Totoro AI..."
              disabled={isStreaming}
              className="ai-chat-input"
            />
            <button
              type="submit"
              disabled={isStreaming || !input.trim()}
              className="ai-chat-send"
            >
              ➤
            </button>
          </form>
        </div>
      )}
    </>
  );
}
