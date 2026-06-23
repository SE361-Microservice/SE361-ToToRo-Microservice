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
    """Flow 1: Conversational Search Agent.

    Supports SSE streaming for real-time token delivery.
    Returns streamed JSON events for each chunk of the AI response.
    """
    thread_id = request.thread_id
    agent = get_search_agent()

    # Load or init thread state
    state = _thread_states[thread_id]
    state["user_id"] = request.user_id

    # Handle user confirmation for pending write action
    if request.confirm_action is not None and state.get("pending_action"):
        state["confirmed"] = request.confirm_action
        if request.confirm_action:
            # Re-run from the pending state
            user_msg = HumanMessage(content="Có, tôi xác nhận.")
        else:
            user_msg = HumanMessage(content="Không, hủy bỏ.")
        state["messages"].append(user_msg)
    else:
        # Normal user message
        user_msg = HumanMessage(content=request.message)
        state["messages"].append(user_msg)
        state["pending_action"] = None
        state["confirmed"] = None

    async def stream_response():
        """SSE event stream."""
        try:
            # Run the agent graph
            result = await agent.ainvoke(
                {
                    "messages": state["messages"],
                    "user_id": state["user_id"],
                    "pending_action": state.get("pending_action"),
                    "confirmed": state.get("confirmed"),
                },
                config={"configurable": {"user_id": state["user_id"]}}
            )

            # Update thread state with new messages
            state["messages"] = list(result["messages"])
            state["pending_action"] = result.get("pending_action")
            state["confirmed"] = result.get("confirmed")

            # Extract the final AI response
            ai_messages = [m for m in result["messages"] if isinstance(m, AIMessage)]
            if ai_messages:
                last_ai = ai_messages[-1]
                raw_content = last_ai.content or ""
                if isinstance(raw_content, list):
                    reply = "\n".join(
                        b["text"] for b in raw_content 
                        if isinstance(b, dict) and "text" in b
                    )
                else:
                    reply = str(raw_content)

                # Build response
                response = ChatResponse(
                    reply=reply,
                    requires_confirmation=state.get("pending_action") is not None,
                    pending_action=(
                        PendingAction(**state["pending_action"])
                        if state.get("pending_action")
                        else None
                    ),
                )

                # Stream the reply in chunks for SSE effect
                chunk_size = 20  # characters per chunk
                for i in range(0, len(reply), chunk_size):
                    chunk = reply[i:i + chunk_size]
                    event_data = json.dumps({
                        "type": "token",
                        "content": chunk,
                    }, ensure_ascii=False)
                    yield f"data: {event_data}\n\n"
                    await asyncio.sleep(0.03)  # Simulate typing effect

                # Send final complete response
                final_data = json.dumps({
                    "type": "done",
                    "reply": reply,
                    "requires_confirmation": response.requires_confirmation,
                    "pending_action": response.pending_action.model_dump() if response.pending_action else None,
                    "search_results": [r.model_dump() for r in response.search_results],
                }, ensure_ascii=False)
                yield f"data: {final_data}\n\n"
            else:
                error_data = json.dumps({"type": "error", "content": "Xin lỗi, có lỗi xảy ra."})
                yield f"data: {error_data}\n\n"

        except Exception as e:
            error_data = json.dumps({
                "type": "error",
                "content": f"Lỗi: {str(e)}",
            }, ensure_ascii=False)
            yield f"data: {error_data}\n\n"

    return StreamingResponse(
        stream_response(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
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

