"""Скрипт для добавления пользователя. Запуск: python scripts/create_user.py <email> <password>
Из контейнера: python scripts/create_user.py admin@example.com secret123
"""
import asyncio
import os
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from sqlalchemy import select
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

from app.database import Base
from app.models import User
from app.auth import hash_password

DATABASE_URL = os.environ.get(
    "DATABASE_URL",
    "postgresql+asyncpg://postgres:postgres@localhost:5432/catalog",
)


async def create_user(email: str, password: str) -> None:
    engine = create_async_engine(DATABASE_URL)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    async with async_session() as session:
        result = await session.execute(select(User).where(User.email == email))
        existing = result.scalar_one_or_none()
        if existing:
            print(f"Пользователь с email {email} уже существует (id={existing.id}).")
            await engine.dispose()
            return
        user = User(email=email, hashed_password=hash_password(password))
        session.add(user)
        await session.commit()
        await session.refresh(user)
        print(f"Создан пользователь: id={user.id}, email={user.email}")
    await engine.dispose()


def main() -> None:
    if len(sys.argv) != 3:
        print("Использование: python scripts/create_user.py <email> <password>")
        sys.exit(1)
    email = sys.argv[1].strip()
    password = sys.argv[2]
    if len(password) < 6:
        print("Пароль должен быть не короче 6 символов.")
        sys.exit(1)
    if not email:
        print("Укажите непустой email.")
        sys.exit(1)
    asyncio.run(create_user(email, password))


if __name__ == "__main__":
    main()
