# Стек и конфигурации Angelo (миграция с Fornex на Yandex Cloud)

## 1. Где находится разработка

- **Репозиторий:** GitHub (уточните URL)
- **Текущий хостинг:** Fornex VPS (79.132.137.145)
- **Домен:** angelo-test.ru
- **Способ деплоя:** перенос с Fornex (не с нуля)

---

## 2. Стек

| Компонент | Технология | Версия |
|-----------|------------|--------|
| Фронтенд | React + Vite + TypeScript | React 18.3, Vite 5.4 |
| Бэкенд | FastAPI (Python) | FastAPI 0.115, Python 3.11 |
| БД | PostgreSQL | 15-alpine |
| Хранилище файлов | MinIO (S3-совместимое) | RELEASE.2024-12-18 |
| Контейнеризация | Docker + Docker Compose | 3.9 |
| Веб-сервер | Nginx | — |

---

## 3. MVP Angelo: схема «1 VM + Managed DB + Object Storage»

**Оценка под ожидания:** 100 семей (~500 человек), медиахранилище ~3 TB.

**Идея схемы:** один сервер (VM) под фронтенд + backend, отдельно управляемая БД, медиа — в объектном хранилище. Самый простой и устойчивый MVP: обновления одной VM, бэкапы БД и хранение медиа раздельно.

| Компонент | Что запускаем | Рекомендуемый размер для MVP | Комментарий |
|-----------|---------------|------------------------------|-------------|
| **VM (Compute)** | nginx (раздаёт фронтенд), backend (API), docker/compose (опционально) | 4 vCPU / 8 GB RAM, SSD 80–120 GB | Диск под ОС, логи, кэш, временные файлы, деплой. Медиа на VM не храним — всё уходит в Object Storage. |
| **Managed PostgreSQL** | основные данные, публикации, связи, комментарии, ссылки на медиа (ключи/URL) | 2 vCPU / 4–8 GB RAM, SSD 50–100 GB | Бэкапы включить, retention 7–14 дней. Для 100 семей объём БД небольшой, основное место — медиа. При росте можно увеличить ресурсы без миграции. |
| **Object Storage** | фото/видео/аудио, превью (thumbnail) | Квота: 4 TB (3 TB + запас) | Рекомендуемый запас +25–35%. По ожиданиям реальное потребление ~3 TB, ставим 4 TB и смотрим динамику. |
| **CDN** | ускорение выдачи фото/видео | — | Опционально, можно не включать в MVP. Подключается позже при заметной нагрузке/географии. |
| **Мониторинг/логи** | ошибки API (5xx), latency, RPS, CPU/RAM/disk | Базовый мониторинг + алерты | Диск > 80%, 5xx, недоступность /api. В MVP достаточно базовых графиков и уведомлений. |

---

## 4. Архитектура приложения

- Один домен: фронт и API на одном origin
- API под префиксом `/api`
- Статика фронта: SPA (index.html, assets)
- Медиа: Object Storage (S3-совместимое), при текущем Fornex — MinIO через proxy `/angelo-media/`

---

## 5. Конфигурации

### 5.1. Backend: `backend/docker-compose.yml`

```yaml
version: "3.9"

services:
  api:
    build: .
    container_name: angelo-backend
    env_file:
      - .env
    depends_on:
      - db
      - minio
    ports:
      - "8000:8000"

  db:
    image: postgres:15-alpine
    container_name: angelo-postgres
    environment:
      POSTGRES_USER: angelo
      POSTGRES_PASSWORD: angelo
      POSTGRES_DB: angelo
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5433:5432"

  minio:
    image: minio/minio:RELEASE.2024-12-18T13-15-44Z
    container_name: angelo-minio
    environment:
      MINIO_ROOT_USER: angelo
      MINIO_ROOT_PASSWORD: angelo-secret-key
    command: server /data --console-address ":9001"
    volumes:
      - minio_data:/data
    ports:
      - "9000:9000"
      - "9001:9001"

volumes:
  postgres_data:
  minio_data:
```

### 5.2. Backend: `backend/Dockerfile`

```dockerfile
FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

RUN apt-get update && apt-get install -y build-essential && rm -rf /var/lib/apt/lists/*

COPY requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

COPY app /app/app

ENV APP_ENV=container

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### 5.3. Backend: `backend/requirements.txt`

```
fastapi==0.115.5
uvicorn[standard]==0.32.1
SQLAlchemy[asyncio]==2.0.36
asyncpg==0.30.0
alembic==1.14.0
pydantic==2.9.2
pydantic-settings==2.6.1
python-multipart==0.0.17
boto3==1.35.71
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
```

### 5.4. Backend: `backend/.env.example` (шаблон, без секретов)

```
APP_ENV=local
APP_DEBUG=true
APP_HOST=0.0.0.0
APP_PORT=8000

DATABASE_URL=postgresql+asyncpg://angelo:angelo@db:5432/angelo

JWT_SECRET=change-this-secret-in-prod
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=10080

S3_ENDPOINT_URL=http://minio:9000
S3_PUBLIC_ENDPOINT_URL=http://localhost:8080
S3_ACCESS_KEY=angelo
S3_SECRET_KEY=angelo-secret-key
S3_REGION=us-east-1
S3_BUCKET=angelo-media

OTP_EXPIRY_SECONDS=600
OTP_DEBUG_LOG_CODE=true
SMTP_ENABLED=false
SMTP_HOST=localhost
SMTP_PORT=587
SMTP_USERNAME=
SMTP_PASSWORD=
SMTP_USE_TLS=true
SMTP_USE_SSL=false
SMTP_FROM_EMAIL=no-reply@angelo.local
SMTP_FROM_NAME=Angelo
FRONTEND_URL=https://angelo-test.ru
```

### 5.5. Nginx (пример для Fornex, для Yandex — аналогично)

```nginx
server {
    listen 80;
    server_name angelo-test.ru;

    root /var/www/angelo;
    index index.html;
    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    client_max_body_size 1024m;
    location /angelo-media/ {
        proxy_pass http://127.0.0.1:9000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 5.6. Сборка фронта (переменные окружения)

```bash
export VITE_USE_MOCK_API=false
export SKIP_DEMO_FEED=true
npm ci
npm run build
```

Артефакты — в `dist/`. Раздача через nginx из каталога с содержимым `dist/`.

### 5.7. Скрипт деплоя `deploy-fornex.sh`

```bash
#!/bin/bash
set -e

PROJECT_DIR="${PROJECT_DIR:-$(cd "$(dirname "$0")" && pwd)}"
WEB_ROOT="${WEB_ROOT:-/var/www/angelo}"

cd "$PROJECT_DIR"
git fetch origin
git reset --hard origin/main

echo ">>> backend: docker compose up -d --build"
cd backend
docker compose up -d --build
cd ..

echo ">>> frontend: npm run build"
export VITE_USE_MOCK_API=false
export SKIP_DEMO_FEED=true
npm ci --silent 2>/dev/null || npm install
npm run build

echo ">>> copy dist to $WEB_ROOT"
sudo mkdir -p "$WEB_ROOT"
sudo cp -r dist/* "$WEB_ROOT/"

echo ">>> reload nginx"
sudo nginx -t 2>/dev/null && sudo systemctl reload nginx 2>/dev/null || true

echo ">>> done"
```

---

## 6. Порты

| Сервис | Порт | Назначение |
|--------|------|------------|
| API | 8000 | FastAPI |
| PostgreSQL | 5433 (внешний) / 5432 (внутри) | БД |
| MinIO API | 9000 | S3-совместимый API |
| MinIO Console | 9001 | Веб-интерфейс (опционально) |
| Nginx | 80, 443 | HTTP/HTTPS |

---

## 7. Миграции БД

Используется Alembic. При первом деплое на новом окружении — выполнить миграции. Дополнительно: если в таблице `likes` нет колонки `strength`:

```sql
ALTER TABLE likes ADD COLUMN IF NOT EXISTS strength SMALLINT NOT NULL DEFAULT 1;
```

---

## 8. Контакты / вопросы

[Укажите контакт для связи с Yandex]
