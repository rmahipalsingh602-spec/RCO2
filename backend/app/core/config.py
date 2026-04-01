from typing import Optional

from pydantic import model_validator
from pydantic_settings import BaseSettings, PydanticBaseSettingsSource, SettingsConfigDict

_DEFAULT_SQLITE_URL = "sqlite+aiosqlite:///./rco2.db"


def normalize_database_url(database_url: str | None) -> str:
    value = (database_url or _DEFAULT_SQLITE_URL).strip()

    if value.startswith("postgres://"):
        return f"postgresql+asyncpg://{value[len('postgres://'):]}"

    if value.startswith("postgresql://"):
        return f"postgresql+asyncpg://{value[len('postgresql://'):]}"

    return value


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore",
    )

    @classmethod
    def settings_customise_sources(
        cls,
        settings_cls: type[BaseSettings],
        init_settings: PydanticBaseSettingsSource,
        env_settings: PydanticBaseSettingsSource,
        dotenv_settings: PydanticBaseSettingsSource,
        file_secret_settings: PydanticBaseSettingsSource,
    ):
        return (
            init_settings,
            env_settings,
            dotenv_settings,
            file_secret_settings,
        )

    PROJECT_NAME: str = "RCO2"
    VERSION: str = "1.0.0"
    SECRET_KEY: str = "your-secret-key-change-in-prod"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    MARKET_PRICE_INR: float = 800.0
    
    # Database
    POSTGRES_URL: Optional[str] = None
    DATABASE_URL: str = _DEFAULT_SQLITE_URL
    
    # Google OAuth
    GOOGLE_CLIENT_ID: Optional[str] = None
    GOOGLE_CLIENT_SECRET: Optional[str] = None
    GOOGLE_REDIRECT_PATH: str = "/auth/google/callback"
    
    # Frontend / Backend URLs
    FRONTEND_URL: str = "http://127.0.0.1:5173"
    FRONTEND_URLS: str = ""
    FRONTEND_ORIGIN_REGEX: Optional[str] = None
    BACKEND_URL: str = "http://127.0.0.1:8001"

    # Auth cookies
    AUTH_COOKIE_NAME: str = "rco2_access_token"
    AUTH_COOKIE_SECURE: bool = False
    AUTH_COOKIE_SAME_SITE: str = "lax"

    @model_validator(mode="after")
    def normalize_runtime_settings(self):
        self.DATABASE_URL = normalize_database_url(self.POSTGRES_URL or self.DATABASE_URL)
        self.FRONTEND_URL = self.FRONTEND_URL.rstrip("/")
        self.BACKEND_URL = self.BACKEND_URL.rstrip("/")
        self.FRONTEND_URLS = ",".join(
            origin.strip().rstrip("/")
            for origin in self.FRONTEND_URLS.split(",")
            if origin.strip()
        )
        self.FRONTEND_ORIGIN_REGEX = (
            self.FRONTEND_ORIGIN_REGEX.strip() if self.FRONTEND_ORIGIN_REGEX else None
        )

        same_site = self.AUTH_COOKIE_SAME_SITE.lower().strip()
        self.AUTH_COOKIE_SAME_SITE = same_site if same_site in {"lax", "strict", "none"} else "lax"
        return self

    @property
    def cors_allowed_origins(self) -> list[str]:
        origins = [self.FRONTEND_URL]

        if self.FRONTEND_URLS:
            origins.extend(origin for origin in self.FRONTEND_URLS.split(",") if origin)

        unique_origins: list[str] = []
        for origin in origins:
            if origin and origin not in unique_origins:
                unique_origins.append(origin)

        return unique_origins

settings = Settings()

