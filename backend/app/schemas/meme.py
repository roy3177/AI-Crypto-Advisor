# @author: Roy Meoded
# @date: 27.08.2026
# @description: Pydantic response schema for a crypto meme.

from pydantic import BaseModel


class MemeResponse(BaseModel):
    id: str
    title: str
    image_url: str
    alt_text: str
    content_key: str
