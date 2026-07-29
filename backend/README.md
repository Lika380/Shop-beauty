# Online Shop — Backend

REST API интернет-магазина. Node.js + Express + PostgreSQL, JWT-авторизация.

## Запуск

```bash
npm install
cp .env.example .env
createdb online_shop
npm run migrate
npm run seed
npm start
```

Сервер: `http://localhost:3000`

## Тестовые пользователи (после seed)

- `admin@shop.test` / `admin123` — админ
- `customer1@shop.test` / `customer123` — покупатель

## Основные эндпоинты

- `POST /auth/register`, `/auth/verify`, `/auth/login` — авторизация
- `GET /products` — каталог (поиск, фильтр, пагинация)
- `GET/POST /cart` — корзина (только customer)
- `POST /orders` — оформить заказ
- `GET /orders` — свои заказы (админ — все)
- Админ: CRUD товаров, категорий, смена статуса заказа

## Структура

```
src/
  models/       SQL-запросы
  controllers/  логика
  routes/       эндпоинты
  middleware/   авторизация, валидация
```
