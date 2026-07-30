from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field


class Agent(BaseModel):
    id: int
    name: str
    role: str
    description: str
    status: str  # "idle" | "active" | "done"
    permissions: List[str]


class TableData(BaseModel):
    columns: List[str]
    rows: List[List[str]]


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1)
    session_id: Optional[str] = None


class ChatMessageOut(BaseModel):
    role: str
    content: str
    created_at: datetime


class ChatResponse(BaseModel):
    session_id: str
    summary: str
    table: Optional[TableData] = None
    created_at: datetime
