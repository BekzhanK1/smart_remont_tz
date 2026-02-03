# Интерактивный каталог товаров

Фронтенд (Next.js) и бэкенд (FastAPI) по ТЗ: каталог с фильтрацией, сортировкой, поиском, пагинацией и корзиной.

## Стек

- **Backend:** FastAPI, PostgreSQL, SQLAlchemy (async), Pydantic, Docker
- **Frontend:** Next.js 14, Tailwind CSS, Zustand, react-toastify

## Backend

### Локально с Docker

```bash
cd backend
docker compose up --build
```

API: http://localhost:8000  
Swagger: http://localhost:8000/docs

### Сид данных (после первого запуска)

При необходимости заполнить БД тестовыми товарами (при локальной БД на порту 5432):

```bash
cd backend
pip install -r requirements.txt
python scripts/seed_products.py
```

### Переменные окружения

См. `backend/.env.example`. Для CORS укажите домен фронтенда в `CORS_ORIGINS`.

## Frontend

```bash
cd frontend
npm install
cp .env.local.example .env.local
# В .env.local задать NEXT_PUBLIC_API_URL=http://localhost:8000
npm run dev
```

Приложение: http://localhost:3000

## API (кратко)

- `GET /api/products/` — список с фильтрами `category`, `min_price`, `max_price`, `search`, `sort_by`, `sort_order`, `limit`, `offset`
- `GET /api/products/{id}/` — товар по id
- `POST /api/cart/` — добавить в корзину (body: `product_id`, `quantity`), заголовок `X-Session-ID` обязателен
- `GET /api/cart/` — содержимое корзины
- `PUT /api/cart/{item_id}/` — изменить количество
- `DELETE /api/cart/{item_id}/` — удалить из корзины

Корзина привязана к `X-Session-ID` (фронт хранит его в localStorage и передаёт в заголовке).

## Деплой

- **Фронт:** Vercel (`frontend/`), в настройках задать `NEXT_PUBLIC_API_URL` на URL бэкенда.
- **Бэкенд:** VPS с Docker: поднять `docker compose` в `backend/`, перед ним поставить Nginx + SSL (Let's Encrypt) и в `CORS_ORIGINS` указать домен фронта на Vercel.
