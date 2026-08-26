"""
Response schema for a successful login/signup: the access token plus the
safe user data the frontend needs to route the user correctly.
"""
from app.schemas.user import UserResponse
from pydantic import BaseModel


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    user: UserResponse
