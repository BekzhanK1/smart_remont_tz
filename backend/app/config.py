from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "postgresql+asyncpg://postgres:postgres@db:5432/catalog"
    sync_database_url: str = "postgresql://postgres:postgres@db:5432/catalog"
    cors_origins: str = "*"
    secret_key: str = "your-secret-key-change-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60

    class Config:
        env_file = ".env"


settings = Settings()
