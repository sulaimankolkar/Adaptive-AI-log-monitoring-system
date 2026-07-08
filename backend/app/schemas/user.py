from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None
    is_active: Optional[bool] = True

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    password: Optional[str] = None

class RoleBase(BaseModel):
    name: str
    description: Optional[str] = None

class Role(RoleBase):
    id: str
    class Config:
        from_attributes = True

class User(UserBase):
    id: str
    role_id: Optional[str] = None
    created_at: datetime
    role: Optional[Role] = None

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenPayload(BaseModel):
    sub: Optional[str] = None
