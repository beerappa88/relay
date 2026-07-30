"""Small rule-based chatbot. No external LLM calls: it pattern-matches the
incoming message and returns a canned-but-relevant answer about the RELAY
pipeline, optionally with a data table.

Kept deliberately simple per the assignment brief ("rule-based only" is an
accepted option) - the frontend is what's being evaluated.
"""

import re
from typing import Optional

from app.agents_data import AGENTS
from app.schemas import TableData

STATUS_LABEL = {"idle": "Idle", "active": "Active", "done": "Done"}


def _agents_table() -> TableData:
    return TableData(
        columns=["#", "Agent", "Role", "Status"],
        rows=[
            [f"{a['id']:02d}", a["name"], a["role"], STATUS_LABEL[a["status"]]]
            for a in AGENTS
        ],
    )


def _permissions_table() -> TableData:
    return TableData(
        columns=["Agent", "Permissions"],
        rows=[[a["name"], ", ".join(a["permissions"])] for a in AGENTS],
    )


def _find_agent(text: str) -> Optional[dict]:
    for agent in AGENTS:
        short_name = agent["name"].split(" ")[0].lower()  # "intake", "extraction", ...
        if short_name in text or agent["name"].lower() in text:
            return agent
    return None


def get_reply(message: str) -> tuple[str, Optional[TableData]]:
    """Returns (summary_text, optional_table)."""
    text = message.strip().lower()

    if not text:
        return "Send a message and I'll help you understand the pipeline.", None

    # Greetings
    if re.search(r"\b(hi|hello|hey)\b", text):
        return (
            "Hey! I'm the RELAY assistant. Ask me things like "
            "\"what agents are there\", \"what does the validation agent do\", "
            "or \"how does the pipeline work\".",
            None,
        )

    # Thanks
    if re.search(r"\b(thanks|thank you|cheers)\b", text):
        return "Anytime. Let me know if you want details on any of the 4 agents.", None

    # Ask for permissions specifically
    if "permission" in text:
        return "Here's what each agent is allowed to do:", _permissions_table()

    # Ask for status
    if "status" in text:
        active = [a for a in AGENTS if a["status"] == "active"]
        summary = (
            f"{active[0]['name']} is currently active on the in-flight task. "
            "Here's the full status board:"
            if active
            else "No agent is currently active. Here's the full status board:"
        )
        return summary, _agents_table()

    # Ask about a specific agent
    agent = _find_agent(text)
    if agent:
        return (
            f"{agent['name']} ({agent['role']}, step {agent['id']:02d}/04) — "
            f"{agent['description']} Current status: {STATUS_LABEL[agent['status']]}.",
            None,
        )

    # List / how many agents
    if re.search(r"(list|show).*agent|how many agent|which agent|all agent", text):
        return f"RELAY runs a task through {len(AGENTS)} agents, in order:", _agents_table()

    # How the pipeline works
    if "pipeline" in text or "how does it work" in text or "flow" in text:
        order = " -> ".join(f"{a['id']:02d} {a['name']}" for a in AGENTS)
        return (
            "A task moves through the pipeline in a fixed order: "
            f"{order}. Each agent hands its output to the next one, and the "
            "Approval Agent either closes the task automatically or flags it "
            "for a human to review.",
            None,
        )

    # Help / fallback
    return (
        "I can answer questions about the RELAY pipeline — try \"list the agents\", "
        "\"what does the extraction agent do\", \"what's the status\", "
        "\"show permissions\", or \"how does the pipeline work\".",
        None,
    )
