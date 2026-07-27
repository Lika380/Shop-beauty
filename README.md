# Online Shop — Frontend

Фронтенд для интернет-магазина на React + Vite + TypeScript. Работает поверх REST API
бэкенда (Node/Express + PostgreSQL), описанного в соответствующем ТЗ.

Без UI-библиотек и CSS-фреймворков — обычный CSS с переменными (поддержка светлой/тёмной темы).

## Стек

- React 19 + TypeScript
- Vite
- React Router v7 (client-side routing, защищённые маршруты)
- Обычный CSS (без Tailwind/UI-кита), переменные для тем
- `fetch` напрямую (без axios/react-query) — простой типизированный клиент в `src/api/client.ts`

## Запуск

```bash
npm install
cp .env.example .env   # указать адрес backend API, см. ниже
npm run dev
```

Приложение поднимется на `http://localhost:5173` (или следующем свободном порту).

### Переменные окружения (`.env`)

```
VITE_API_URL=http://localhost:3000
```

Адрес, на котором слушает backend (без завершающего слэша, без префикса `/api`).

### Сборка

```bash
npm run build      # tsc -b && vite build → dist/
npm run preview    # локальный просмотр production-сборки
```

## Структура

```
src/
  api/            — типизированные функции-обёртки над эндпоинтами backend
    client.ts     — общий fetch-клиент: JWT-заголовок, разбор { error: { message, code } }
    auth.ts, products.ts, categories.ts, cart.ts, orders.ts
  types/          — TS-типы, зеркалящие схему backend
  context/
    AuthContext.tsx  — JWT в localStorage, текущий user, login/register/logout
    CartContext.tsx  — состояние корзины, только для role=customer
  components/     — переиспользуемые UI-блоки (Header, ProductCard, Pagination, guard-роуты…)
  hooks/
    useCategories.ts — кэш списка категорий (для фильтра и отображения названия категории в карточке товара)
  pages/          — маршруты витрины: каталог, товар, логин/регистрация, корзина, заказы
    admin/        — админ-раздел: CRUD товаров, категории, все заказы + смена статуса
  utils/
    format.ts       — money()/toNumber() — NUMERIC-поля Postgres иногда приходят строкой, а не числом
    orderStatus.ts  — русские подписи статусов заказа
    productImage.ts — заглушки-изображения товаров (product-01..20.jpg по id)
    productNames.ts — заглушки-названия товаров по id
```

## Роли и доступ

- `customer` (по умолчанию после регистрации): каталог, корзина, оформление заказа, свои заказы.
- `admin`: не видит корзину/оформление заказа (это операции покупателя), зато получает
  `/admin/products`, `/admin/categories`, `/admin/orders` — CRUD товаров, создание категорий,
  просмотр всех заказов с фильтрами и сменой статуса.

Маршруты защищены на клиенте (`ProtectedRoute` / `AdminRoute` в `src/components/ProtectedRoute.tsx`),
но окончательная проверка прав — на backend; фронт просто не показывает недоступные разделы и
корректно показывает ошибки 401/403, если backend их всё же вернёт.

## Разделы (маршруты)

| Путь | Доступ | Описание |
|---|---|---|
| `/` | публичный | Каталог: поиск, фильтр по категории, сортировка по цене, пагинация |
| `/products/:id` | публичный | Карточка товара, добавление в корзину (для customer) |
| `/login`, `/register` | публичный | Вход / регистрация |
| `/cart` | customer | Корзина, изменение количества, удаление, оформление заказа |
| `/orders`, `/orders/:id` | авторизован | Мои заказы / заказ (admin видит чужие заказы и может менять статус) |
| `/admin/products` (+`/new`, `/:id/edit`) | admin | CRUD товаров |
| `/admin/categories` | admin | Список + создание категорий |
| `/admin/orders` | admin | Все заказы, фильтр по статусу и user_id, переход к деталям |

## Замечания по контракту API

Фронтенд рассчитан на реальные ответы backend (проверено вручную через запущенный сервер):

- Списки (`GET /products`, `GET /orders`) возвращают `{ data: [...], pagination: { page, limit, total, totalPages } }`.
- Фильтр `GET /products?category=` принимает **числовой `category_id`**, а не название категории.
- Элементы корзины/заказа отдают название товара в поле `name` (не `product_name`).
- Ошибки — всегда `{ error: { message, code } }`; фронт показывает `message` пользователю как есть.
- Числовые поля (`price`, `total`, `price_at_purchase`) Postgres может отдавать строкой — везде отображение
  идёт через `utils/format.ts#money`, а не напрямую.
- Необязательные строковые поля товара (`description`, `image_url`) при создании/редактировании
  отправляются только если непустые — backend не принимает пустую строку как валидный URL.

Если контракт backend изменится, эти места (`src/api/*.ts`, `src/types/index.ts`) — первое, что нужно поправить.
