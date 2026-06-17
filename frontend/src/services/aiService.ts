/**
 * AI Agent Service — communicates with the Python AI Service (FastAPI)
 *
 * Endpoints:
 *   POST /agent/chat       → SSE streaming chat (Flow 1)
 *   POST /agent/chat/sync  → Non-streaming chat (Flow 1 — testing)
 *   GET  /agent/compatibility?current_user_id=&target_profile_id=  (Flow 3)
 */

const AI_BASE_URL = import.meta.env.VITE_AI_SERVICE_URL || 'http://localhost:8000';

/* ── Types ─────────────────────────────────────────────────────────── */

export interface AiChatRequest {
  message: string;
  thread_id: string;
  user_id: string;
  confirm_action?: boolean | null;
}

export interface PendingAction {
  action_type: string;   // "save_listing" | "initiate_chat"
  target_id: string;
  description: string;
}

export interface AiChatResponse {
  reply: string;
  requires_confirmation: boolean;
  pending_action: PendingAction | null;
  search_results: unknown[];
}

export interface CompatibilityResponse {
  score: number;
  commentary: string;
  shared_traits: string[];
  recommendation: string;   // strong_match | good_match | consider | low_match
}

/* ── SSE token event ───────────────────────────────────────────────── */

export interface AiStreamEvent {
  type: 'token' | 'done' | 'error';
  content?: string;
  reply?: string;
  requires_confirmation?: boolean;
  pending_action?: PendingAction | null;
  search_results?: unknown[];
}

/* ── Streaming chat (Flow 1) ─────────────────────────────────────── */

export async function streamChat(
  request: AiChatRequest,
  onToken: (text: string) => void,
  onDone: (response: AiStreamEvent) => void,
  onError: (error: string) => void,
): Promise<void> {
  try {
    const res = await fetch(`${AI_BASE_URL}/agent/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });

    if (!res.ok) {
      onError(`Lỗi server: ${res.status}`);
      return;
    }

    const reader = res.body?.getReader();
    if (!reader) {
      onError('Không thể đọc stream.');
      return;
    }

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith('data: ')) continue;
        const jsonStr = trimmed.slice(6);
        try {
          const event: AiStreamEvent = JSON.parse(jsonStr);
          if (event.type === 'token') {
            onToken(event.content || '');
          } else if (event.type === 'done') {
            onDone(event);
          } else if (event.type === 'error') {
            onError(event.content || 'Lỗi không xác định');
          }
        } catch {
          // skip malformed JSON
        }
      }
    }
  } catch (err) {
    onError(err instanceof Error ? err.message : 'Lỗi kết nối AI Service');
  }
}

/* ── Sync chat (testing) ─────────────────────────────────────────── */

export async function syncChat(request: AiChatRequest): Promise<AiChatResponse> {
  const res = await fetch(`${AI_BASE_URL}/agent/chat/sync`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
  if (!res.ok) throw new Error(`AI Service error: ${res.status}`);
  return res.json();
}

/* ── Compatibility (Flow 3) ──────────────────────────────────────── */

export async function getCompatibility(
  currentUserId: string,
  targetProfileId: string,
): Promise<CompatibilityResponse> {
  const params = new URLSearchParams({
    current_user_id: currentUserId,
    target_profile_id: targetProfileId,
  });
  const res = await fetch(`${AI_BASE_URL}/agent/compatibility?${params}`);
  if (!res.ok) throw new Error(`AI Service error: ${res.status}`);
  return res.json();
}
