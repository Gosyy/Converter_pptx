from fastapi import APIRouter, Response, HTTPException, Cookie
from pydantic import BaseModel, EmailStr

router = APIRouter(prefix="/auth", tags=["Auth"])

COOKIE_NAME = "guest_mode"


class LoginSchema(BaseModel):
    email: EmailStr
    password: str
    guest: bool = False


@router.post("/login")
def login(data: LoginSchema, response: Response):
    """
    Гостевой вход с минимальной валидацией.
    """
    if not data.guest or data.password != "guest":
        raise HTTPException(status_code=401, detail="Доступ разрешён только для гостевого входа")

    response.set_cookie(
        key=COOKIE_NAME,
        value="enabled",
        httponly=True,
        max_age=60 * 60 * 24,
        secure=False,
        samesite="lax",
    )
    return {
        "msg": "Guest mode enabled",
        "user_id": 0,
        "email": data.email,
        "name": "Local Guest",
        "is_verified": True,
        "provider": "guest",
        "avatar": None,
    }


@router.get("/me")
def me(guest_mode: str | None = Cookie(default=None, alias=COOKIE_NAME)):
    if guest_mode != "enabled":
        raise HTTPException(status_code=401, detail="Гостевой режим не активирован")

    return {
        "user_id": 0,
        "email": "guest@local",
        "name": "Local Guest",
        "is_verified": True,
        "provider": "guest",
        "avatar": None,
    }


@router.post("/logout")
def logout(response: Response):
    response.delete_cookie(COOKIE_NAME)
    return {"msg": "Guest mode disabled"}
