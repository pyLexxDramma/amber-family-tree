# Angelo — Amber Family Tree

[![Deploy to Reg.ru](https://github.com/pyLexxDramma/amber-family-tree/actions/workflows/deploy.yml/badge.svg)](https://github.com/pyLexxDramma/amber-family-tree/actions/workflows/deploy.yml)

**Angelo** — семейная сеть для хранения воспоминаний и общения с близкими. Дерево семьи, лента публикаций (фото, видео, аудио), профили родственников и голосовой помощник.

**Подробная инструкция по использованию:** [Инструкция пользователя →](docs/USAGE.md)

---

## Информация о проекте

- **Приложение:** `https://angelo-test.ru`

---

## Локальный запуск (фронт + бэк)

### Backend (Docker)

```bash
cd backend
cp .env.example .env
docker compose up --build
```

API: `http://localhost:8000`  
Swagger: `http://localhost:8000/docs`

### Frontend (Vite)

```bash
npm install
VITE_USE_MOCK_API=false npm run dev
```

Фронт: `http://localhost:8080`  
Запросы к API идут на `/api/...` и в dev проксируются на backend:8000.

---

## Деплой на Fornex (VPS)

- **Основная схема**: один домен, API под `/api` через nginx.
- Документация: `docs/deploy-fornex.md`, `docs/fornex-full-build.md`.
