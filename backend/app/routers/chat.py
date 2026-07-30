import uuid
from datetime import datetime

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.chatbot import get_reply
from app.database import get_db
from app.models import ChatMessage
from app.schemas import ChatRequest, ChatResponse, ChatMessageOut

router = APIRouter(tags=["chat"])


@router.post("/chat", response_model=ChatResponse)
def chat(payload: ChatRequest, db: Session = Depends(get_db)):
    session_id = payload.session_id or str(uuid.uuid4())

    # Persist the incoming user message.
    db.add(ChatMessage(session_id=session_id, role="user", content=payload.message))

    summary, table = get_reply(payload.message)

    # Persist the assistant's reply (table is stored as plain text for history purposes).
    db.add(ChatMessage(session_id=session_id, role="assistant", content=summary))
    db.commit()

    return ChatResponse(
        session_id=session_id,
        summary=summary,
        table=table,
        created_at=datetime.utcnow(),
    )


@router.get("/chat/{session_id}/history", response_model=list[ChatMessageOut])
def chat_history(session_id: str, db: Session = Depends(get_db)):
    """Optional helper: returns persisted history for a session (e.g. after a refresh)."""
    messages = (
        db.query(ChatMessage)
        .filter(ChatMessage.session_id == session_id)
        .order_by(ChatMessage.created_at.asc())
        .all()
    )
    return messages
