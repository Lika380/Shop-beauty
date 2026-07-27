# Shop

Интернет-магазин: backend (Node/Express + PostgreSQL) + frontend (React/Vite).

- [`frontend/`](frontend/) — витрина, корзина, заказы, админка. Деплоится автоматически на GitHub Pages при пуше в `main` (см. `.github/workflows/deploy-pages.yml`).
- [`backend/`](backend/) — REST API. GitHub Pages статику отдаёт, но Node.js/PostgreSQL не запускает — backend нужно поднимать отдельно (Render, Railway, Fly.io и т.п.) и указать его адрес во фронте (`VITE_API_URL`).

## GitHub Pages

Сайт: `https://Lika380.github.io/shop/`

Чтобы деплой заработал (один раз, вручную):
1. Settings → Pages → Source → **GitHub Actions**.
2. Settings → Secrets and variables → Actions → **Variables** → добавить `VITE_API_URL` со ссылкой на реально работающий backend (когда он будет где-то развёрнут). Пока backend не задеплоен, фронт соберётся, но запросы к API будут падать — это ожидаемо.

Дальше при каждом пуше в `main`, затрагивающем `frontend/`, GitHub Actions сам соберёт и выложит сайт.

## Локальный запуск

См. README внутри каждой папки:
- [`frontend/README.md`](frontend/README.md)
- [`backend/README.md`](backend/README.md)
