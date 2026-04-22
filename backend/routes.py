import threading
import time

from fastapi import APIRouter, Query
from fastapi.encoders import jsonable_encoder

from database import SessionLocal
from models import Guideline
from schemas import GuidelineOut

router = APIRouter()

_CACHE_TTL_SECONDS = 30
_cache_lock = threading.Lock()
_guidelines_cache: dict[tuple, tuple[float, list[GuidelineOut]]] = {}


@router.get("/guidelines", response_model=list[GuidelineOut])
def get_guidelines(
    category: str | None = None,
    limit: int = Query(default=100, ge=1, le=500),
    offset: int = Query(default=0, ge=0),
):
    cache_key = (category, limit, offset)
    now = time.time()

    with _cache_lock:
        cached = _guidelines_cache.get(cache_key)
        if cached and now - cached[0] < _CACHE_TTL_SECONDS:
            return jsonable_encoder(cached[1])

    with SessionLocal() as session:
        query = session.query(Guideline).order_by(Guideline.id)
        if category:
            query = query.filter(Guideline.category == category)
        data = query.offset(offset).limit(limit).all()

    with _cache_lock:
        _guidelines_cache[cache_key] = (now, data)

    return jsonable_encoder(data)
