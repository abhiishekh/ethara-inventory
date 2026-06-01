from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://postgres:postgres@db:5432/inventory_db"
    ALLOWED_ORIGINS: str = "http://localhost:5173,http://localhost:3000, http://localhost:80"

    class Config:
        env_file = ".env"


settings = Settings()
