from fastapi import APIRouter

from app.agents_data import AGENTS
from app.schemas import Agent

router = APIRouter(tags=["agents"])


@router.get("/agents", response_model=list[Agent])
def list_agents():
    """Returns the 4 hardcoded pipeline agents, their status and permissions."""
    return AGENTS
