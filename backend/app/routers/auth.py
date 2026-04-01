import structlog
from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from fastapi.responses import RedirectResponse
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from ..core.auth import (
    build_frontend_url,
    clear_user_session,
    create_user_session,
    get_google_oauth_client,
    get_google_redirect_uri,
    sanitize_next_path,
)
from ..core.database import get_db
from ..crud.user import user
from ..dependencies import get_current_active_user
from ..models.user import User
from ..schemas.user import User as UserSchema

router = APIRouter()
logger = structlog.get_logger()


async def resolve_google_user_info(request: Request, google, token: dict) -> dict | None:
    user_info = token.get("userinfo")
    if user_info:
        return user_info

    try:
        userinfo_response = await google.get(
            "https://openidconnect.googleapis.com/v1/userinfo",
            token=token,
        )
        if userinfo_response.is_success:
            return userinfo_response.json()
    except Exception as exc:
        logger.warning(
            "Google userinfo endpoint failed",
            path=request.url.path,
            error_type=type(exc).__name__,
            error_message=str(exc),
        )

    if token.get("id_token"):
        return await google.parse_id_token(request, token)

    return None


@router.get("/google-login")
async def google_login(request: Request, next: str = "/"):
    try:
        google = get_google_oauth_client()
    except HTTPException:
        return RedirectResponse(
            url=build_frontend_url("/login", error="oauth_not_configured"),
            status_code=status.HTTP_302_FOUND,
        )

    request.session["auth_next"] = sanitize_next_path(next)
    redirect_uri = get_google_redirect_uri()
    return await google.authorize_redirect(request, redirect_uri)


@router.get("/google/callback", include_in_schema=False)
@router.get("/callback")
async def auth_callback(request: Request, db: AsyncSession = Depends(get_db)):
    google = get_google_oauth_client()
    next_path = sanitize_next_path(request.session.pop("auth_next", "/"))

    try:
        token = await google.authorize_access_token(request)
        user_info = await resolve_google_user_info(request, google, token)

        if not user_info:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Google user profile could not be resolved.",
            )

        google_id = user_info.get("sub")
        email = user_info.get("email")
        name = user_info.get("name") or "RCO2 User"
        email_verified = bool(user_info.get("email_verified", False))

        if not google_id or not email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Google account is missing a required identifier.",
            )

        db_user = await user.get_by_google_id(db, google_id=google_id)
        if not db_user:
            db_user = await user.get_by_email(db, email=email)

        if db_user:
            db_user.google_id = google_id
            db_user.name = name
            db_user.email = email
            db_user.is_verified = email_verified or db_user.is_verified
        else:
            real_users = (
                await db.execute(
                    select(func.count())
                    .select_from(User)
                    .where(~User.email.like("%@example.com"))
                )
            ).scalar_one()
            db_user = User(
                google_id=google_id,
                name=name,
                email=email,
                role="admin" if real_users == 0 else "farmer",
                is_verified=email_verified,
            )
            db.add(db_user)

        await db.commit()
        await db.refresh(db_user)

        create_user_session(request, str(db_user.id))
        return RedirectResponse(
            url=build_frontend_url(next_path),
            status_code=status.HTTP_302_FOUND,
        )
    except HTTPException:
        raise
    except Exception as exc:
        logger.error(
            "Google login callback failed",
            path=request.url.path,
            error_type=type(exc).__name__,
            error_message=str(exc),
        )
        clear_user_session(request)
        return RedirectResponse(
            url=build_frontend_url("/login", error="google_login_failed"),
            status_code=status.HTTP_302_FOUND,
        )


@router.get("/me", response_model=UserSchema)
async def read_users_me(current_user: User = Depends(get_current_active_user)):
    return current_user


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout(request: Request):
    clear_user_session(request)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
