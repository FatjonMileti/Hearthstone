"""Video router. Port of Video/video.router.ts + video.controller.ts.

The Hearthstone.mp4 does not ship in the repo (Node would 404 too) — stream it
when present, else 404 "Video not found".
"""

from pathlib import Path
from typing import Any

from fastapi import APIRouter, Request
from fastapi.responses import FileResponse, PlainTextResponse

router = APIRouter(prefix="/video", tags=["video"])

CANDIDATES = (
    Path("app/api/Video/Hearthstone.mp4"),
    Path("server_fastapi/app/api/Video/Hearthstone.mp4"),
)


@router.get("", status_code=200)
@router.get("/", status_code=200, include_in_schema=False)
async def stream_video(request: Request) -> Any:
    _ = request
    for candidate in CANDIDATES:
        if candidate.is_file():
            return FileResponse(
                path=str(candidate), media_type="video/mp4", filename="Hearthstone.mp4"
            )
    return PlainTextResponse("Video not found", status_code=404)
