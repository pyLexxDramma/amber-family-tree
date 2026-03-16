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

---

## Демо-режим (моки данных + реальный вход)

Для показа заказчику можно включить моки данных (лента/семья/профиль), но оставить реальную авторизацию через backend:

```bash
VITE_DEMO_MOCK_DATA=true VITE_USE_MOCK_API=false npm run dev
```

Для продакшена на Fornex `VITE_DEMO_MOCK_DATA` не задавать (или `false`).

### Стресс-тест (много фото и членов семьи)

```bash
npm run dev:stress
```

Запускает приложение с ~200 публикациями и 50 членами семьи для проверки производительности.

### Демо на удалённом сервере

Сборка и деплой демо (моки + стресс-данные, без бэкенда):

```bash
npm run build:demo
```

Деплой на сервер (выполнять на сервере или через SSH):

```bash
ssh root@79.132.137.145 "cd /opt/angelo && ./deploy-demo.sh"
```
