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
            Product(
                name="Планшет Samsung Tab S9",
                description="Экран 11\", 128 ГБ, S Pen в комплекте.",
                price=42990,
                image="https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400",
                category="Электроника",
            ),
            Product(
                name="Клавиатура механическая",
                description="Проводная, переключатели Cherry MX Red, подсветка RGB.",
                price=8990,
                image="https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=400",
                category="Электроника",
            ),
            Product(
                name="Мышь беспроводная",
                description="Эргономичная, до 70 дней работы, 16000 DPI.",
                price=3490,
                image="https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400",
                category="Электроника",
            ),
            Product(
                name="Шкаф-купе двухдверный",
                description="Ширина 180 см, глубина 60 см, система раздвижных дверей.",
                price=24990,
                image="https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=400",
                category="Мебель",
            ),
            Product(
                name="Полка настенная",
                description="Деревянная полка 80x25 см, 3 яруса.",
                price=4590,
                image="https://images.unsplash.com/photo-1532372320572-cda25653a26d?w=400",
                category="Мебель",
            ),
            Product(
                name="Диван угловой",
                description="Угловой диван с ящиком для белья, ткань велюр.",
                price=39990,
                image="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400",
                category="Мебель",
            ),
            Product(
                name="Люстра потолочная",
                description="Плафоны матовое стекло, 5 рожков, E27.",
                price=7990,
                image="https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=400",
                category="Освещение",
            ),
            Product(
                name="Торшер напольный",
                description="Высота 160 см, регулировка яркости, современный дизайн.",
                price=5990,
                image="https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400",
                category="Освещение",
            ),
            Product(
                name="Грунтовка универсальная",
                description="Грунт глубокого проникновения 10 л.",
                price=1290,
                image="https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=400",
                category="Ремонт",
            ),
            Product(
                name="Шпаклёвка финишная",
                description="Шпаклёвка полимерная 25 кг, белая.",
                price=890,
                image="https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=400",
                category="Ремонт",
            ),
            Product(
                name="Клей для обоев",
                description="Клей для флизелиновых обоев 250 г, 10 упаковок.",
                price=590,
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
