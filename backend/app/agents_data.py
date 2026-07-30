"""Hardcoded pipeline definition. Each task moves through these 4 agents,
in order, id 1 -> 4."""

AGENTS = [
    {
        "id": 1,
        "name": "Intake Agent",
        "role": "Receiver",
        "description": "Receives the incoming request and marks it as new.",
        "status": "done",
        "permissions": ["read:requests", "write:ticket"],
    },
    {
        "id": 2,
        "name": "Extraction Agent",
        "role": "Parser",
        "description": "Pulls out the key details from the request: invoice number, amount, customer.",
        "status": "active",
        "permissions": ["read:ticket", "write:extracted_fields"],
    },
    {
        "id": 3,
        "name": "Validation Agent",
        "role": "Checker",
        "description": "Checks whether the extracted details are correct and consistent.",
        "status": "idle",
        "permissions": ["read:extracted_fields", "read:invoice_records"],
    },
    {
        "id": 4,
        "name": "Approval Agent",
        "role": "Decision maker",
        "description": "Approves the request automatically, or flags it for a human to review.",
        "status": "idle",
        "permissions": ["read:validation_result", "write:decision", "escalate:human"],
    },
]
