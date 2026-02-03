"""Скрипт для заполнения БД тестовыми товарами. Запуск: python scripts/seed_products.py"""
import os
from app.models import Product
from app.database import Base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy import text
import asyncio
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))


DATABASE_URL = os.environ.get(
    "DATABASE_URL",
    "postgresql+asyncpg://postgres:postgres@localhost:5432/catalog"
)


async def seed():
    engine = create_async_engine(DATABASE_URL)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async_session = sessionmaker(
        engine, class_=AsyncSession, expire_on_commit=False)
    async with async_session() as session:
        result = await session.execute(text("SELECT COUNT(*) FROM products"))
        if (result.scalar() or 0) > 0:
            print("Products already exist, skip seed.")
            await engine.dispose()
            return

        products = [
            Product(
                name="Смартфон Galaxy A54",
                description="Смартфон с AMOLED экраном 6.4\", 128 ГБ, 5G.",
                price=34990,
                image="https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400",
                category="Электроника",
            ),
            Product(
                name="Ноутбук ThinkPad E15",
                description="15.6\" FHD, Ryzen 5, 8 ГБ RAM, 256 ГБ SSD.",
                price=54990,
                image="https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400",
                category="Электроника",
            ),
            Product(
                name="Наушники Sony WH-1000XM5",
                description="Беспроводные наушники с шумоподавлением.",
                price=29990,
                image="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400",
                category="Электроника",
            ),
            Product(
                name="Кресло офисное",
                description="Офисное кресло с поддержкой поясницы, регулировка высоты.",
                price=12990,
                image="https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=400",
                category="Мебель",
            ),
            Product(
                name="Стол письменный",
                description="Письменный стол 120x60 см, массив дуба.",
                price=18990,
                image="https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=400",
                category="Мебель",
            ),
            Product(
                name="Лампа настольная LED",
                description="Настольная лампа с регулировкой яркости и цветовой температуры.",
                price=3490,
                image="https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400",
                category="Освещение",
            ),
            Product(
                name="Краска интерьерная белая",
                description="Водно-дисперсионная краска 10 л, матовая.",
                price=2990,
                image="https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=400",
                category="Ремонт",
            ),
            Product(
                name="Обои флизелиновые",
                description="Обои под покраску, рулон 1.06x25 м.",
                price=890,
                image="https://images.unsplash.com/photo-1615874959474-d609969a20ed?w=400",
                category="Ремонт",
            ),
        ]
        session.add_all(products)
        await session.commit()
        print(f"Added {len(products)} products.")
    await engine.dispose()


if __name__ == "__main__":
    asyncio.run(seed())
