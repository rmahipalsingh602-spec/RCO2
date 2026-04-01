from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi.errors import RateLimitExceeded
from starlette.middleware.sessions import SessionMiddleware

from .core.config import settings
from .core.database import init_db
from .routers import admin, auth, credits, earnings, farmer, land, market, marketplace
from .middleware import limiter, log_requests, error_middleware, rate_limit_handler

app = FastAPI(title="RCO2 API", version="1.0.0")
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, rate_limit_handler)

# Session middleware keeps Google OAuth state plus the signed-in user session.
app.add_middleware(
    SessionMiddleware,
    secret_key=settings.SECRET_KEY,
    same_site=settings.AUTH_COOKIE_SAME_SITE,
    https_only=settings.AUTH_COOKIE_SECURE,
    max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    session_cookie="rco2_session",
)

# Middleware
app.middleware("http")(error_middleware)
app.middleware("http")(log_requests)

# Rate limit example usage: @limiter.limit("5/minute")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_allowed_origins,
    allow_origin_regex=settings.FRONTEND_ORIGIN_REGEX,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(land.router, prefix="/land", tags=["land"])
app.include_router(credits.router, prefix="/credits", tags=["credits"])
app.include_router(earnings.router, prefix="/earnings", tags=["earnings"])
app.include_router(market.router, prefix="/market", tags=["market"])
app.include_router(farmer.router, prefix="/farmer", tags=["farmer"])
app.include_router(marketplace.router, prefix="/marketplace", tags=["marketplace"])
app.include_router(admin.router, prefix="/admin", tags=["admin"])

@app.on_event("startup")
async def startup_event():
    await init_db()

@app.get("/")
def read_root():
    return {"message": "RCO2 - Rathore Carbon Network API"}


@app.get("/health")
def health_check():
    return {"status": "ok"}
