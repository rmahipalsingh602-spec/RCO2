from urllib.parse import urlencode

from authlib.integrations.starlette_client import OAuth
from fastapi import HTTPException, Request, status

from .config import settings

oauth = OAuth()

_PLACEHOLDER_VALUES = {
    "",
    "your_client_id",
    "your_secret",
    "your_secret_key",
    "your-google-oauth-client-id.apps.googleusercontent.com",
    "your-google-oauth-client-secret",
}


def google_oauth_configured() -> bool:
    return bool(
        settings.GOOGLE_CLIENT_ID
        and settings.GOOGLE_CLIENT_SECRET
        and settings.GOOGLE_CLIENT_ID not in _PLACEHOLDER_VALUES
        and settings.GOOGLE_CLIENT_SECRET not in _PLACEHOLDER_VALUES
    )


if google_oauth_configured():
    oauth.register(
        name="google",
        client_id=settings.GOOGLE_CLIENT_ID,
        client_secret=settings.GOOGLE_CLIENT_SECRET,
        server_metadata_url="https://accounts.google.com/.well-known/openid-configuration",
        client_kwargs={"scope": "openid email profile"},
    )


def sanitize_next_path(next_path: str | None) -> str:
    if not next_path or not next_path.startswith("/") or next_path.startswith("//"):
        return "/"
    return next_path


def build_frontend_url(path: str = "/", **query: str) -> str:
    normalized_path = path if path.startswith("/") else f"/{path}"
    clean_query = {key: value for key, value in query.items() if value}
    base_url = settings.FRONTEND_URL.rstrip("/")

    if not clean_query:
        return f"{base_url}{normalized_path}"

    return f"{base_url}{normalized_path}?{urlencode(clean_query)}"


def build_backend_url(path: str) -> str:
    normalized_path = path if path.startswith("/") else f"/{path}"
    return f"{settings.BACKEND_URL.rstrip('/')}{normalized_path}"


def get_google_redirect_uri() -> str:
    return build_backend_url(settings.GOOGLE_REDIRECT_PATH)


def get_google_oauth_client():
    client = oauth.create_client("google")
    if client is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Google OAuth is not configured on the server.",
        )
    return client


def create_user_session(request: Request, user_id: str) -> None:
    request.session["user_id"] = user_id


def clear_user_session(request: Request) -> None:
    request.session.clear()
