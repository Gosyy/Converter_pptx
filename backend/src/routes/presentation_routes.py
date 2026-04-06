from __future__ import annotations

import json
import time
from uuid import uuid4
from collections import defaultdict

from fastapi import APIRouter, Depends, File, Form, HTTPException, Request, Response, UploadFile, WebSocket, WebSocketDisconnect, Cookie
from fastapi.concurrency import run_in_threadpool
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from src.config import settings
from src.database import get_db
from src.routes.auth_routes import COOKIE_NAME
from src.schemas.presentation_schema import SavePresentationSchema
from src.schemas.presentation_schemas import EditSlideInSchema, GeneratePresInSchema
from src.schemas.user_schemas import Presentation
from src.services.convert_file_service import convert_uploaded_file_sync
from src.services.model_service import edit_one_slide, generate_presentation
from src.services.rust_sidecar_client import format_stream_chunk

router = APIRouter(prefix="/presentation")

_progress_clients: dict[str, set[WebSocket]] = defaultdict(set)
_rate_limiter: dict[str, list[float]] = defaultdict(list)


async def _broadcast_progress(client_id: str | None, stage: str, status: str):
    if not settings.FEATURE_PROGRESS_WS:
        return
    if not client_id:
        return
    payload = json.dumps({"stage": stage, "status": status}, ensure_ascii=False)
    dead: list[WebSocket] = []
    for ws in _progress_clients.get(client_id, set()):
        try:
            await ws.send_text(payload)
        except Exception:
            dead.append(ws)
    for ws in dead:
        _progress_clients[client_id].discard(ws)


def _check_rate_limit(client_key: str, limit: int = 5, window_sec: int = 60):
    now = time.time()
    _rate_limiter[client_key] = [t for t in _rate_limiter[client_key] if now - t <= window_sec]
    if len(_rate_limiter[client_key]) >= limit:
        raise HTTPException(status_code=429, detail="Rate limit exceeded for /presentation/generate")
    _rate_limiter[client_key].append(now)


@router.websocket("/progress/ws/{client_id}")
async def progress_ws(websocket: WebSocket, client_id: str):
    if not settings.FEATURE_PROGRESS_WS:
        await websocket.close(code=1008)
        return
    await websocket.accept()
    _progress_clients[client_id].add(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        _progress_clients[client_id].discard(websocket)


@router.get("/my-presentations")
def my_presentations(
    guest_mode: str | None = Cookie(default=None, alias=COOKIE_NAME),
    db: Session = Depends(get_db),
):
    if not guest_mode:
        raise HTTPException(status_code=401, detail="Guest session required")

    return db.query(Presentation).filter_by(owner_token=guest_mode).all()


@router.delete("/presentations/{presentation_id}")
def delete_presentation(
    presentation_id: str,
    guest_mode: str | None = Cookie(default=None, alias=COOKIE_NAME),
    db: Session = Depends(get_db),
):
    if not guest_mode:
        raise HTTPException(status_code=401, detail="Guest session required")

    pres = db.query(Presentation).filter_by(id=presentation_id, owner_token=guest_mode).first()
    if not pres:
        raise HTTPException(status_code=404, detail="Presentation not found")

    db.delete(pres)
    db.commit()
    return {"detail": "Presentation deleted"}


@router.post("/save-presentation")
def save_presentation(
    data: SavePresentationSchema,
    guest_mode: str | None = Cookie(default=None, alias=COOKIE_NAME),
    db: Session = Depends(get_db),
):
    if not guest_mode:
        raise HTTPException(status_code=401, detail="Guest session required")

    if not data.id:
        data.id = str(uuid4())
        pres = Presentation(
            id=data.id,
            user_id=None,
            owner_token=guest_mode,
            title=data.title,
            content=data.content,
            theme=data.theme,
        )
        db.add(pres)
    else:
        pres = db.query(Presentation).filter_by(id=data.id, owner_token=guest_mode).first()
        if not pres:
            pres = Presentation(
                id=data.id,
                user_id=None,
                owner_token=guest_mode,
                title=data.title,
                content=data.content,
                theme=data.theme,
            )
            db.add(pres)
        else:
            pres.title = data.title
            pres.content = data.content
            pres.theme = data.theme

    db.commit()
    db.refresh(pres)
    return {"id": pres.id, "message": "Presentation saved"}


@router.post("/generate", status_code=201)
async def generate(
    request: Request,
    text: str = Form(min_length=1),
    file: UploadFile = File(),
    model: str = Form(default=""),
    client_id: str = Form(default=""),
) -> Response:
    client_key = request.client.host if request.client else "unknown"
    _check_rate_limit(client_key)
    body = GeneratePresInSchema(text=text, model=model)

    await _broadcast_progress(client_id, "parsing", "started")
    content = await file.read()
    context = await run_in_threadpool(
        convert_uploaded_file_sync,
        file.filename or "document",
        content,
    )
    await _broadcast_progress(client_id, "parsing", "completed")
    await _broadcast_progress(client_id, "generation", "started")

    async def markdown_stream():
        async for chunk in generate_presentation(body.text, context, body.model):
            yield format_stream_chunk(chunk)
        await _broadcast_progress(client_id, "generation", "completed")

    return StreamingResponse(markdown_stream(), media_type="text/markdown")


@router.post("/edit", status_code=200)
async def edit(body: EditSlideInSchema) -> Response:
    model_res = edit_one_slide(body.text, body.slide.model_dump(), body.action, body.model)
    return Response(content=model_res, media_type="text/markdown")
