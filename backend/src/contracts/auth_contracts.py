"""Контракты полноценной auth-системы (зарезервировано для следующего этапа).

Модуль не подключён в runtime, используется как спецификация API-контуров.
"""

from pydantic import BaseModel, EmailStr


class RegisterIn(BaseModel):
    email: EmailStr
    password: str
    name: str


class LoginIn(BaseModel):
    email: EmailStr
    password: str


class AuthOut(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class VerifyEmailIn(BaseModel):
    code: str


class OAuthCallbackIn(BaseModel):
    provider: str
    code: str
