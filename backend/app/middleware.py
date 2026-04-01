import traceback

import structlog
from fastapi import Request
from fastapi.responses import JSONResponse
from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

# Logger
logger = structlog.get_logger()

# Rate limiter
limiter = Limiter(key_func=get_remote_address)


def _ascii_safe(value: str) -> str:
    return value.encode("ascii", errors="backslashreplace").decode("ascii")


def _serialize_exception(exc: Exception) -> dict[str, str]:
    formatted_traceback = "".join(
        traceback.format_exception(type(exc), exc, exc.__traceback__)
    )
    return {
        "error_type": type(exc).__name__,
        "error_message": _ascii_safe(str(exc)),
        "traceback": _ascii_safe(formatted_traceback),
    }

async def rate_limit_handler(request: Request, exc: RateLimitExceeded):
    logger.warning("Rate limit exceeded", ip=get_remote_address(request), limit=exc.limit)
    return JSONResponse(status_code=429, content={"detail": "Rate limit exceeded"})

async def log_requests(request: Request, call_next):
    logger.info("Request", method=request.method, path=request.url.path, client_ip=get_remote_address(request))
    response = await call_next(request)
    logger.info("Response", status_code=response.status_code, path=request.url.path)
    return response

async def error_middleware(request: Request, call_next):
    try:
        return await call_next(request)
    except Exception as e:
        logger.error("Unhandled error", path=request.url.path, **_serialize_exception(e))
        return JSONResponse(
            status_code=500,
            content={"detail": "Internal Server Error"}
        )

