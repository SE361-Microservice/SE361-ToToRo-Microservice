"""
Flow 1: Conversational Search Agent
LangGraph state machine with tool calling, confirm gate for write actions, and SSE streaming.
"""

from __future__ import annotations

import operator
from typing import Annotated, Sequence

from langchain_core.messages import BaseMessage, HumanMessage, SystemMessage, AIMessage
from langchain_google_genai import ChatGoogleGenerativeAI
from langgraph.graph import StateGraph, END
from langgraph.prebuilt import ToolNode
from typing_extensions import TypedDict

from app.config import get_settings
from app.prompts.search_system import SEARCH_AGENT_SYSTEM_PROMPT
from app.agents.swipe_commentary import WRITE_ACTION_TOOLS

# Import all tools
from app.tools.search_listings import search_listings
from app.tools.get_listing_detail import get_listing_detail
from app.tools.save_listing import save_listing
from app.tools.search_roommates import search_roommates
from app.tools.get_compatibility import get_compatibility_score
from app.tools.initiate_chat import initiate_chat
from app.tools.get_reviews import get_reviews
from app.tools.compare_listings import compare_listings

# ── All available tools ──────────────────────────────────────────────

ALL_TOOLS = [
    search_listings,
    get_listing_detail,
    save_listing,
    search_roommates,
    get_compatibility_score,
    initiate_chat,
    get_reviews,
    compare_listings,
]


# ── Agent State ──────────────────────────────────────────────────────

class SearchAgentState(TypedDict):
    """State maintained throughout the conversation."""
    messages: Annotated[Sequence[BaseMessage], operator.add]
    user_id: str
    pending_action: dict | None       # Write action waiting for user confirm
    confirmed: bool | None            # User's response to pending action


# ── Helper: check for write action tool calls ────────────────────────

def _has_write_tool_call(message: BaseMessage) -> bool:
    """Check if an AI message contains a call to a write-action tool."""
    if not hasattr(message, "tool_calls") or not message.tool_calls:
        return False
    return any(tc["name"] in WRITE_ACTION_TOOLS for tc in message.tool_calls)


def _get_write_tool_calls(message: BaseMessage) -> list[dict]:
    """Extract write-action tool calls from an AI message."""
    if not hasattr(message, "tool_calls") or not message.tool_calls:
        return []
    return [tc for tc in message.tool_calls if tc["name"] in WRITE_ACTION_TOOLS]


def _get_read_tool_calls(message: BaseMessage) -> list[dict]:
    """Extract read-only tool calls from an AI message."""
    if not hasattr(message, "tool_calls") or not message.tool_calls:
        return []
    return [tc for tc in message.tool_calls if tc["name"] not in WRITE_ACTION_TOOLS]


# ── Build the Agent Graph ────────────────────────────────────────────

def build_search_agent():
    """Build and compile the conversational search agent graph.

    Graph flow:
        agent → (has write tool calls?) → confirm_gate → (user confirmed?) → tools → agent
        agent → (has read tool calls?) → tools → agent
        agent → (no tool calls) → END
    """
    settings = get_settings()

    llm = ChatGoogleGenerativeAI(
        model=settings.gemini_model,
        google_api_key=settings.gemini_api_key,
        temperature=0.3,
    ).bind_tools(ALL_TOOLS)

    tool_node = ToolNode(ALL_TOOLS)

    # ── Node: agent ──────────────────────────────────────────────
    async def agent_node(state: SearchAgentState) -> dict:
        """LLM processes messages and decides next action."""
        messages = list(state["messages"])

        confirmed = state.get("confirmed")
        pending = state.get("pending_action")

        if confirmed is True and pending:
            action_name = pending["action_type"]
            target_id = pending["target_id"]
            import uuid
            tool_call_id = f"call_{uuid.uuid4().hex}"

            args = {}
            if action_name == "save_listing":
                args = {"listing_id": target_id}
            elif action_name == "initiate_chat":
                args = {"target_id": target_id}

            ai_msg = AIMessage(
                content=f"Đang thực hiện {action_name}...",
                tool_calls=[{
                    "name": action_name,
                    "args": args,
                    "id": tool_call_id,
                }]
            )
            return {"messages": [ai_msg]}

        if confirmed is False and pending:
            cancel_msg = AIMessage(content=(
                "Đã hủy! Không sao, bạn có thể quyết định sau. "
                "Còn muốn tìm kiếm gì khác không? 😊"
            ))
            return {
                "messages": [cancel_msg],
                "pending_action": None,
                "confirmed": None,
            }

        # Inject system prompt if not already present
        if not messages or not isinstance(messages[0], SystemMessage):
            messages.insert(0, SystemMessage(content=SEARCH_AGENT_SYSTEM_PROMPT))

        response = await llm.ainvoke(messages)
        return {"messages": [response]}

    # ── Node: confirm_gate ───────────────────────────────────────
    async def confirm_gate(state: SearchAgentState) -> dict:
        """Handle write action confirmation flow.

        When agent wants to do a write action:
        1. If not confirmed yet → ask user for confirmation
        2. If confirmed=True → let tool execute
        3. If confirmed=False → cancel and inform user
        """
        last_msg = state["messages"][-1]
        write_calls = _get_write_tool_calls(last_msg)

        if not write_calls:
            return {}

        # Check if user already confirmed
        if state.get("confirmed") is True:
            # User confirmed → proceed (will route to tools)
            return {"confirmed": None}

        if state.get("confirmed") is False:
            # User rejected → cancel the action
            cancel_msg = AIMessage(content=(
                "Đã hủy! Không sao, bạn có thể quyết định sau. "
                "Còn muốn tìm kiếm gì khác không? 😊"
            ))
            return {
                "messages": [cancel_msg],
                "pending_action": None,
                "confirmed": None,
            }

        # First time → ask for confirmation
        action = write_calls[0]
        action_name = action["name"]
        action_args = action.get("args", {})

        if action_name == "save_listing":
            confirm_msg = AIMessage(content=(
                f"Bạn muốn **lưu phòng** (ID: {action_args.get('listing_id', '?')}) "
                f"vào danh sách yêu thích không?\n\n"
                f"👉 Trả lời **Có** để lưu hoặc **Không** để bỏ qua."
            ))
        elif action_name == "initiate_chat":
            confirm_msg = AIMessage(content=(
                f"Bạn muốn **mở cuộc trò chuyện** với người dùng "
                f"(ID: {action_args.get('target_id', '?')}) không?\n\n"
                f"👉 Trả lời **Có** để mở chat hoặc **Không** để bỏ qua."
            ))
        else:
            confirm_msg = AIMessage(content="Bạn xác nhận thực hiện hành động này? (Có/Không)")

        return {
            "messages": [confirm_msg],
            "pending_action": {
                "action_type": action_name,
                "target_id": action_args.get("listing_id") or action_args.get("target_id", ""),
                "description": confirm_msg.content,
            },
        }

    # ── Routing logic ────────────────────────────────────────────
    def route_after_agent(state: SearchAgentState) -> str:
        """Determine next step after agent node."""
        last_msg = state["messages"][-1]

        if not hasattr(last_msg, "tool_calls") or not last_msg.tool_calls:
            return END

        if _has_write_tool_call(last_msg):
            return "confirm_gate"

        return "tools"

    def route_after_confirm(state: SearchAgentState) -> str:
        """Determine next step after confirm gate."""
        if state.get("confirmed") is True:
            return "tools"
        # If confirmed is False or None (just asked), end to wait for user response
        return END

    # ── Build graph ──────────────────────────────────────────────
    graph = StateGraph(SearchAgentState)

    graph.add_node("agent", agent_node)
    graph.add_node("tools", tool_node)
    graph.add_node("confirm_gate", confirm_gate)

    graph.set_entry_point("agent")
    graph.add_conditional_edges("agent", route_after_agent)
    graph.add_edge("tools", "agent")
    graph.add_conditional_edges("confirm_gate", route_after_confirm)

    return graph.compile()


# ── Singleton agent instance ─────────────────────────────────────────

_agent_instance = None


def get_search_agent():
    """Get or create the singleton search agent."""
    global _agent_instance
    if _agent_instance is None:
        _agent_instance = build_search_agent()
    return _agent_instance
