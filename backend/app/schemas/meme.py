from pydantic import BaseModel


class MemeResponse(BaseModel):
    id: str
    title: str
    image_url: str
    alt_text: str
