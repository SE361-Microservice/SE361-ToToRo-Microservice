"""
Agent Router — Flow 1 (Chat) + Flow 3 (Compatibility)
Handles SSE streaming for chat and single-shot compatibility commentary.
"""

from __future__ import annotations

import json
import asyncio
from collections import defaultdict

from fastapi import APIRouter, Query
from fastapi.responses import StreamingResponse
from langchain_core.messages import HumanMessage, AIMessage

from app.models.chat import (
    ChatRequest, ChatResponse, CompatibilityResponse,
    SearchResultItem, PendingAction,
)
from app.agents.search_agent import get_search_agent, SearchAgentState
from app.agents.swipe_commentary import generate_compatibility_commentary
from app.clients.matching_client import MatchingClient

router = APIRouter()

# ── In-memory thread state storage (Phase 1 — will migrate to PostgreSQL) ──
_thread_states: dict[str, dict] = defaultdict(lambda: {
    "messages": [],
    "user_id": "",
    "pending_action": None,
    "confirmed": None,
})


# ── Flow 1: Chat Endpoint (SSE Streaming) ────────────────────────────

@router.post("/chat")
async def chat(request: ChatRequest):
    """Flow 1: Conversational Search Agent with real LLM token streaming.

    Uses astream_events() to yield tokens as the LLM generates them,
    giving a true character-by-character streaming effect.
    """
    thread_id = request.thread_id
    agent = get_search_agent()

    # Load or init thread state
    state = _thread_states[thread_id]
    state["user_id"] = request.user_id

    # Handle user confirmation for pending write action
    if request.confirm_action is not None and state.get("pending_action"):
        state["confirmed"] = request.confirm_action
        user_msg = HumanMessage(content="Có, tôi xác nhận." if request.confirm_action else "Không, hủy bỏ.")
        state["messages"].append(user_msg)
    else:
        user_msg = HumanMessage(content=request.message)
        state["messages"].append(user_msg)
        state["pending_action"] = None
        state["confirmed"] = None

    async def stream_response():
        """Real SSE token stream using astream_events()."""
        accumulated_reply = ""
        final_state = None

        try:
            # ── Real LLM token streaming ──────────────────────────────────
            # astream_events() yields events as the LLM generates tokens.
            # We forward "on_chat_model_stream" events immediately as SSE tokens.
            async for event in agent.astream_events(
                {
                    "messages": state["messages"],
                    "user_id": state["user_id"],
                    "pending_action": state.get("pending_action"),
                    "confirmed": state.get("confirmed"),
                },
                version="v2",
                config={"configurable": {"user_id": state["user_id"]}},
            ):
                kind = event.get("event", "")

                # Stream LLM tokens in real time
                if kind == "on_chat_model_stream":
                    chunk = event.get("data", {}).get("chunk")
                    if chunk:
                        token = ""
                        if hasattr(chunk, "content"):
                            content = chunk.content
                            if isinstance(content, str):
                                token = content
                            elif isinstance(content, list):
                                # Some models return list of content blocks
                                token = "".join(
                                    b.get("text", "") if isinstance(b, dict) else ""
                                    for b in content
                                )
                        if token:
                            accumulated_reply += token
                            event_data = json.dumps(
                                {"type": "token", "content": token},
                                ensure_ascii=False,
                            )
                            yield f"data: {event_data}\n\n"

                # Capture final agent state after graph execution completes
                elif kind == "on_chain_end" and event.get("name") == "LangGraph":
                    output = event.get("data", {}).get("output", {})
                    if output:
                        final_state = output

            # ── Post-stream: update thread state & send done event ────────
            if final_state:
                state["messages"] = list(final_state.get("messages", state["messages"]))
                state["pending_action"] = final_state.get("pending_action")
                state["confirmed"] = final_state.get("confirmed")

            # If streaming produced no tokens (tool-only node), fall back
            if not accumulated_reply and final_state:
                ai_messages = [
                    m for m in state["messages"] if isinstance(m, AIMessage)
                ]
                if ai_messages:
                    raw = ai_messages[-1].content or ""
                    accumulated_reply = (
                        "\n".join(b["text"] for b in raw if isinstance(b, dict) and "text" in b)
                        if isinstance(raw, list)
                        else str(raw)
                    )
                    # Stream the fallback reply in small chunks
                    chunk_size = 8
                    for i in range(0, len(accumulated_reply), chunk_size):
                        chunk_text = accumulated_reply[i : i + chunk_size]
                        token_data = json.dumps(
                            {"type": "token", "content": chunk_text},
                            ensure_ascii=False,
                        )
                        yield f"data: {token_data}\n\n"
                        await asyncio.sleep(0.02)

            pending = state.get("pending_action")
            final_data = json.dumps(
                {
                    "type": "done",
                    "reply": accumulated_reply,
                    "requires_confirmation": pending is not None,
                    "pending_action": pending,
                    "search_results": [],
                },
                ensure_ascii=False,
            )
            yield f"data: {final_data}\n\n"

        except Exception as e:
            error_data = json.dumps(
                {"type": "error", "content": f"Lỗi: {str(e)}"},
                ensure_ascii=False,
            )
            yield f"data: {error_data}\n\n"

    return StreamingResponse(
        stream_response(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",  # Disable Nginx buffering
        },
    )



@router.post("/chat/sync")
async def chat_sync(request: ChatRequest) -> ChatResponse:
    """Flow 1: Non-streaming chat endpoint for testing.

    Returns the complete response at once (no SSE).
    """
    thread_id = request.thread_id
    agent = get_search_agent()

    state = _thread_states[thread_id]
    state["user_id"] = request.user_id

    # Handle confirmation
    if request.confirm_action is not None and state.get("pending_action"):
        state["confirmed"] = request.confirm_action
        user_msg = HumanMessage(content="Có" if request.confirm_action else "Không")
        state["messages"].append(user_msg)
    else:
        user_msg = HumanMessage(content=request.message)
        state["messages"].append(user_msg)
        state["pending_action"] = None
        state["confirmed"] = None

    result = await agent.ainvoke(
        {
            "messages": state["messages"],
            "user_id": state["user_id"],
            "pending_action": state.get("pending_action"),
            "confirmed": state.get("confirmed"),
        },
        config={"configurable": {"user_id": state["user_id"]}}
    )

    state["messages"] = list(result["messages"])
    state["pending_action"] = result.get("pending_action")

    ai_messages = [m for m in result["messages"] if isinstance(m, AIMessage)]
    if ai_messages:
        raw_content = ai_messages[-1].content or ""
        if isinstance(raw_content, list):
            reply = "\n".join(
                b["text"] for b in raw_content 
                if isinstance(b, dict) and "text" in b
            )
        else:
            reply = str(raw_content)
    else:
        reply = "Xin lỗi, có lỗi xảy ra."

    return ChatResponse(
        reply=reply,
        requires_confirmation=state.get("pending_action") is not None,
        pending_action=(
            PendingAction(**state["pending_action"])
            if state.get("pending_action")
            else None
        ),
    )


# ── Flow 3: Compatibility Commentary Endpoint ────────────────────────

# In-memory cache for compatibility results (TTL: 10 minutes)
import time as _time

_compatibility_cache: dict[str, tuple[float, CompatibilityResponse]] = {}
_CACHE_TTL = 600  # seconds


def _cache_key(user_id: str, target_id: str) -> str:
    return f"{user_id}:{target_id}"


def _get_cached(key: str) -> CompatibilityResponse | None:
    entry = _compatibility_cache.get(key)
    if entry and (_time.time() - entry[0]) < _CACHE_TTL:
        return entry[1]
    if entry:
        del _compatibility_cache[key]
    return None


@router.get("/compatibility")
async def get_compatibility(
    current_user_id: str = Query(..., description="ID of the current user"),
    target_profile_id: str = Query(..., description="ID of the target profile"),
) -> CompatibilityResponse:
    """Flow 3: Generate AI commentary for roommate compatibility.

    Results are cached in-memory for 10 minutes per user+target pair.

    Returns:
        Compatibility score (0-100), AI commentary, shared traits, and recommendation.
    """
    # Check cache first
    cache_k = _cache_key(current_user_id, target_profile_id)
    cached = _get_cached(cache_k)
    if cached:
        return cached

    client = MatchingClient()
    current_user = await client.get_profile_by_user(current_user_id)
    target_profile = await client.get_profile(target_profile_id)

    if not current_user:
        return CompatibilityResponse(
            score=0,
            commentary="Bạn chưa tạo profile roommate. Hãy tạo profile trước để xem mức độ tương thích!",
            shared_traits=[],
            recommendation="low_match",
        )

    if not target_profile:
        return CompatibilityResponse(
            score=0,
            commentary="Không tìm thấy profile người dùng này.",
            shared_traits=[],
            recommendation="low_match",
        )

    result = await generate_compatibility_commentary(current_user, target_profile)

    # Store in cache
    _compatibility_cache[cache_k] = (_time.time(), result)

    return result

