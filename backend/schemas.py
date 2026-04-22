from pydantic import BaseModel, ConfigDict


class GuidelineOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str | None = None
    category: str | None = None
    content: str | None = None
