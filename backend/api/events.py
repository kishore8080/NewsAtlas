from fastapi import APIRouter
from typing import Optional
from pydantic import BaseModel
import uuid

router = APIRouter()

class EventTrackingPayload(BaseModel):
    event: str
    timestamp: Optional[str] = None
    isTracking: bool
    location: Optional[str] = None

class EventTrackingResponse(BaseModel):
    success: bool
    trackingId: str
    message: str

@router.post("/events/track", response_model=EventTrackingResponse)
async def track_events(payload: EventTrackingPayload):
    tracking_id = f"trk_{uuid.uuid4().hex[:12]}"
    action = "Started" if payload.isTracking else "Stopped"
    return {
        "success": True,
        "trackingId": tracking_id,
        "message": f"{action} tracking global events successfully"
    }

@router.post("/events/unsubscribe", response_model=EventTrackingResponse)
async def unsubscribe_events():
    return {
        "success": True,
        "trackingId": f"unsub_{uuid.uuid4().hex[:12]}",
        "message": "Unsubscribed from global events tracking"
    }
