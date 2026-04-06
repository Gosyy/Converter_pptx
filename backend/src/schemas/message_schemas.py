from pydantic import BaseModel


class MessageInSchema(BaseModel):
    text: str
