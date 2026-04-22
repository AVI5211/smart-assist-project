from fastapi import APIRouter
from fastapi.encoders import jsonable_encoder

from database import SessionLocal
from models import Guideline

router = APIRouter()


@router.get("/guidelines")
def get_guidelines():
    with SessionLocal() as session:
        data = session.query(Guideline).all()
        return jsonable_encoder(data)
