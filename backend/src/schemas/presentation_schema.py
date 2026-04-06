from pydantic import BaseModel
from typing import Optional

class SavePresentationSchema(BaseModel):
    id: Optional[str]  # если есть — обновляем, если нет — создаём новую
    title: str
    content: list
    theme: Optional[dict] = None