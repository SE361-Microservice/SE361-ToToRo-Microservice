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

  const user = useAuthStore((s: { user: UserProfileDto | null }) => s.user);

  // ── Per-user storage keys: chat history and thread are isolated per account ──
  const storageKey = `totoro_ai_chat_messages_${user?.id ?? 'guest'}`;
  const threadKey = `totoro_ai_thread_id_${user?.id ?? 'guest'}`;

  const [isOpen, setIsOpen] = useState(false);

  // Persist messages per user
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
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

  // Persist threadId per user (issue #2: separate thread per account)
  const [tid] = useState(() => {
    let t = localStorage.getItem(threadKey);
    if (!t) {
      t = `thread_${Date.now()}_${Math.random().toString(36).slice(2)}`;
      localStorage.setItem(threadKey, t);
    }
    return t;
  });
  const threadId = useRef<string>(tid);

  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);

  // Sync threadId when user changes (e.g. switching accounts without full reload)
  useEffect(() => {
    let t = localStorage.getItem(threadKey);
    if (!t) {
      t = `thread_${Date.now()}_${Math.random().toString(36).slice(2)}`;
      localStorage.setItem(threadKey, t);
    }
    threadId.current = t;
  }, [threadKey]);

  // Reload messages from localStorage when user changes account (without page reload)
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        setMessages(JSON.parse(saved).map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) })));
        return;
      }
    } catch {}
    // New user: show welcome message
    setMessages([{
      id: 'welcome',
      role: 'assistant',
      content: 'Xin chào! 🌿 Mình là **Totoro AI**, trợ lý tìm phòng trọ cho sinh viên.\n\nBạn cần mình giúp gì nào?',
      timestamp: new Date(),
      quickReplies: ['🏠 Tìm phòng trọ', '👥 Tìm bạn ở ghép', '📊 So sánh phòng'],
    }]);
  }, [storageKey]);

  // Persist messages per user (issue #2: scoped to user)
  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(messages));
  }, [messages, storageKey]);
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

    // Issue #3: Do NOT add an empty placeholder upfront.
    // Instead accumulate tokens and only add the message when first token arrives.
    const assistantId = `ai_${Date.now()}`;
    let assistantAdded = false;

    let accumulated = '';

    await streamChat(
      {
        message: trimmed,
        thread_id: threadId.current,
        user_id: user?.email || 'anonymous',
        confirm_action: confirmAction ?? null,
      },
      // onToken
      (token: string) => {
        accumulated += token;
        setMessages((prev) => {
          // Add the assistant message on first token (fixes double 🌿 icon)
          if (!assistantAdded) {
            assistantAdded = true;
            return [
              ...prev,
              { id: assistantId, role: 'assistant', content: accumulated, timestamp: new Date() },
            ];
          }
          return prev.map((m) => (m.id === assistantId ? { ...m, content: accumulated } : m));
        });
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
    // Show a user-visible message in the chat history
    const displayText = confirmed ? '✅ Có, thực hiện' : '❌ Không, hủy';
    setMessages((prev) => [
      ...prev,
      { id: `confirm_${Date.now()}`, role: 'user' as const, content: displayText, timestamp: new Date() },
    ]);
    // Send ONLY the confirm_action flag — empty message prevents the agent from
    // treating this as a new search query and asking for confirmation again.
    sendMessage('', confirmed);
  };

  /* ── Submit ─────────────────────────────────────────────── */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  /* ── Markdown renderer ───────────────────────────────────── */
  const renderMarkdown = (text: string): string => {
    const lines = text.split('\n');
    const output: string[] = [];
    let inUl = false;
    let inOl = false;
    let inTable = false;
    let tableRows: string[] = [];

    const closeUl = () => { if (inUl) { output.push('</ul>'); inUl = false; } };
    const closeOl = () => { if (inOl) { output.push('</ol>'); inOl = false; } };
    const closeTable = () => {
      if (inTable) {
        output.push('<div class="ai-table-container"><table class="ai-md-table"><tbody>');
        output.push(tableRows.join(''));
        output.push('</tbody></table></div>');
        inTable = false;
        tableRows = [];
      }
    };

    const inlineFormat = (line: string) => line
      // Bold + italic combined ***
      .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
      // Bold **
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      // Italic * (not at start of line to avoid eating bullet markers)
      .replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, '<em>$1</em>')
      // Italic _
      .replace(/(?<!_)_(?!_)(.+?)(?<!_)_(?!_)/g, '<em>$1</em>')
      // Inline code
      .replace(/`([^`]+)`/g, '<code class="ai-inline-code">$1</code>');

    for (const raw of lines) {
      const line = raw.trimEnd();

      // Table row
      const isTableRow = /^\|(.*)\|$/.test(line.trim());
      if (isTableRow) {
        closeUl(); closeOl();
        if (!inTable) {
          inTable = true;
          tableRows = [];
        }
        const contentInside = line.trim().slice(1, -1);
        const isSeparator = /^[:\-\s\|]+$/.test(contentInside);
        if (!isSeparator) {
          const cells = contentInside.split('|').map(c => c.trim());
          const isHeader = tableRows.length === 0;
          const cellTag = isHeader ? 'th' : 'td';
          const trContent = cells.map(cell => `<${cellTag}>${inlineFormat(cell)}</${cellTag}>`).join('');
          tableRows.push(`<tr>${trContent}</tr>`);
        }
        continue;
      } else {
        closeTable();
      }

      // Heading ###
      if (/^#{3}\s/.test(line)) {
        closeUl(); closeOl();
        output.push(`<h4 class="ai-md-h4">${inlineFormat(line.replace(/^#{3}\s/, ''))}</h4>`);
        continue;
      }
      // Heading ##
      if (/^#{2}\s/.test(line)) {
        closeUl(); closeOl();
        output.push(`<h3 class="ai-md-h3">${inlineFormat(line.replace(/^#{2}\s/, ''))}</h3>`);
        continue;
      }

      // Blockquote >
      if (/^>\s?/.test(line)) {
        closeUl(); closeOl();
        output.push(`<blockquote class="ai-md-blockquote">${inlineFormat(line.replace(/^>\s?/, ''))}</blockquote>`);
        continue;
      }

      // Horizontal rule ---
      if (/^-{3,}$/.test(line.trim())) {
        closeUl(); closeOl();
        output.push('<hr class="ai-md-hr"/>');
        continue;
      }

      // Unordered list: * item  or  - item
      const ulMatch = line.match(/^(\s*)[\*\-]\s+(.+)/);
      if (ulMatch) {
        closeOl();
        if (!inUl) { output.push('<ul class="ai-md-ul">'); inUl = true; }
        output.push(`<li>${inlineFormat(ulMatch[2])}</li>`);
        continue;
      }

      // Ordered list: 1. item
      const olMatch = line.match(/^(\s*)\d+\.\s+(.+)/);
      if (olMatch) {
        closeUl();
        if (!inOl) { output.push('<ol class="ai-md-ol">'); inOl = true; }
        output.push(`<li>${inlineFormat(olMatch[2])}</li>`);
        continue;
      }

      // Empty line → paragraph break
      if (line.trim() === '') {
        closeUl(); closeOl();
        output.push('<br/>');
        continue;
      }

      // Normal paragraph line
      closeUl(); closeOl();
      output.push(`<span>${inlineFormat(line)}</span><br/>`);
    }

    closeUl();
    closeOl();
    closeTable();
    return output.join('');
  };

  const lastMessage = messages[messages.length - 1];
  const showConfirmButtons =
    lastMessage &&
    lastMessage.role === 'assistant' &&
    lastMessage.pendingAction &&
    !isStreaming;

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
            {messages.map((msg, idx) => {
              // Mark the last assistant message as "streaming" while in progress
              const isStreamingMsg =
                isStreaming &&
                idx === messages.length - 1 &&
                msg.role === 'assistant';
              return (
                <div key={msg.id} className={`ai-chat-msg ai-chat-msg--${msg.role}`}>
                  {msg.role === 'assistant' && <span className="ai-msg-avatar">🌿</span>}
                  {msg.content && (
                    <div
                      className={`ai-msg-bubble${isStreamingMsg ? ' ai-msg-bubble--streaming' : ''}`}
                      dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }}
                    />
                  )}
                </div>
              );
            })}

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
            {showConfirmButtons && (
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
