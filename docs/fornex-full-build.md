# Полная сборка и запуск проекта на Fornex

Документ описывает пошаговый деплой Angelo на VPS Fornex **с подключением backend**: фронт (статика) и API в Docker (PostgreSQL, MinIO) за одним доменом (например `https://angelo-test.ru/`).

Подробности архитектуры, локальный запуск и подводные камни — в [deploy-fornex.md](deploy-fornex.md).

---

## 1. Изменения в конфигурационных файлах

Перед первым запуском на сервере нужно внести следующие правки.

### 1.1. Backend: переменные окружения

**Файл:** `backend/.env` (создать на сервере, в репозитории его нет)

- Скопировать `backend/.env.example` в `backend/.env`.
- Задать продакшен-значения:
  - `APP_ENV=production`
  - `APP_DEBUG=false`
  - `JWT_SECRET` — надёжная случайная строка (не оставлять `change-this-secret-in-prod`).
  - Остальное можно оставить как в примере, если БД и MinIO в том же Docker Compose:
    - `DATABASE_URL=postgresql+asyncpg://angelo:angelo@db:5432/angelo`
    - `S3_ENDPOINT_URL=http://minio:9000`, `S3_ACCESS_KEY=angelo`, `S3_SECRET_KEY=angelo-secret-key`, `S3_BUCKET=angelo-media`
- Файл `.env` не коммитить в git (уже в `.gitignore`).

**Рекомендация:** на проде при желании сменить пароль PostgreSQL в `docker-compose.yml` (`POSTGRES_PASSWORD`) и подставить те же креды в `DATABASE_URL` в `.env`.

### 1.2. Backend: откуда брать переменные в Docker

**Файл:** `backend/docker-compose.yml`

- В сервисе **api** по умолчанию указано `env_file: .env.example`.
- **Для продакшена** заменить на:
  ```yaml
  env_file:
    - .env
  ```
  чтобы контейнер api использовал секреты из `backend/.env`, а не тестовые из `.env.example`.

### 1.3. Фронт: переменные при сборке

При сборке (`npm run build`) для прода необходимо:

- **Не задавать** `VITE_API_URL` — тогда в браузере будет использоваться текущий origin (ваш домен), запросы пойдут на `https://ваш-домен/api/...`.
- Задать **`VITE_USE_MOCK_API=false`** — иначе прод-сборка будет ходить в мок, а не в ваш API.
- Убедиться, что **`VITE_DEMO_MOCK_DATA` не задана** (или равна `false`) — иначе лента/семья/профиль останутся на моках.

**Варианты:** создать в корне проекта `.env.production` с содержимым `VITE_USE_MOCK_API=false` и без `VITE_API_URL`, либо передавать переменные в CI/команде сборки (например `VITE_USE_MOCK_API=false npm run build`).

### 1.4. Nginx: конфиг сайта

На сервере нужен конфиг nginx с вашим доменом, путём к статике и проксированием `/api`. Пример — в п. 5 ниже. Заменить `server_name` и при необходимости `root` на свои значения.

---

## 2. Размещение проекта на VPS

```bash
git clone <URL-репозитория> /opt/angelo
cd /opt/angelo
```

Либо загрузить архив проекта в выбранный каталог.

---

## 3. Запуск бэкенда (Docker)

### 3.1. Подготовка

```bash
cd /opt/angelo/backend
cp .env.example .env
# Отредактировать .env (см. п. 1.1)
# В docker-compose.yml у сервиса api указать env_file: .env (см. п. 1.2)
```

### 3.2. Запуск стека

```bash
docker compose up -d --build
```

Поднимаются сервисы:

- **api** — приложение (порт 8000 на хосте).
- **db** — PostgreSQL (порт 5433 на хосте; внутри контейнера — 5432). Креды по умолчанию: пользователь `angelo`, пароль `angelo`, база `angelo`.
- **minio** — хранилище (порты 9000, 9001 на хосте).

### 3.3. Проверка

С сервера:

```bash
curl http://127.0.0.1:8000/health
# Ожидается: {"status":"ok"}

curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:8000/api/docs
# Ожидается: 200
```

---

## 4. Сборка фронта

В корне проекта:

```bash
cd /opt/angelo
export VITE_USE_MOCK_API=false
# VITE_API_URL не задаём
npm install
npm run build
```

Артефакты появятся в каталоге `dist/`.

Если сборка выполняется не на VPS (локально или в CI), передать в окружении `VITE_USE_MOCK_API=false`, не задавать `VITE_API_URL`, затем скопировать содержимое `dist/` на сервер в каталог, откуда nginx раздаёт статику.

---

## 5. Nginx: статика и проксирование API

Установить nginx на VPS (если ещё не установлен). Создать конфиг виртуального хоста (например `/etc/nginx/sites-available/angelo`):

```nginx
server {
    listen 80;
    server_name angelo-test.ru;

    root /var/www/angelo/dist;
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
}
```

- **server_name** — подставить свой домен (например `angelo-test.ru`).
- **root** — путь к каталогу со сборкой фронта (см. п. 6).
- **proxy_pass** — если nginx запущен в Docker в одном compose с backend, заменить на `http://api:8000`.

Включить сайт, проверить конфиг и перезагрузить nginx:

```bash
sudo ln -s /etc/nginx/sites-available/angelo /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

После настройки SSL (Let's Encrypt/certbot) добавить `listen 443 ssl;` и директивы сертификатов.

---

## 6. Размещение статики фронта

Скопировать содержимое `dist/` в каталог, указанный в nginx как `root`:

```bash
sudo mkdir -p /var/www/angelo
sudo cp -r /opt/angelo/dist/* /var/www/angelo/dist/
```

При следующих обновлениях фронта — пересобрать `npm run build` и снова скопировать содержимое `dist/` в этот каталог.

---

## 7. DNS и SSL

- Настроить A-запись домена на IP VPS.
- Для HTTPS: выдать сертификат (например certbot) и добавить в конфиг nginx `listen 443 ssl` и пути к сертификатам.

---

## 8. Проверка

1. Открыть в браузере `https://angelo-test.ru/` (или ваш домен).
2. В DevTools → Сеть убедиться, что запросы к API уходят на `https://angelo-test.ru/api/...` и возвращают ответы от бэкенда.

---

## 9. Краткий порядок действий (чеклист)

| № | Действие |
|---|----------|
| 1 | Разместить проект на VPS (`git clone` или загрузка). |
| 2 | В `backend/`: создать `.env` из `.env.example`, задать продакшен-значения (п. 1.1). |
| 3 | В `backend/docker-compose.yml`: у сервиса api указать `env_file: .env` (п. 1.2). |
| 4 | В `backend/`: выполнить `docker compose up -d --build`. |
| 5 | В корне проекта: `VITE_USE_MOCK_API=false npm run build` (п. 1.3, 4). |
| 6 | Скопировать содержимое `dist/` в каталог nginx (п. 6). |
| 7 | Настроить nginx (п. 5), DNS и SSL (п. 7). |
| 8 | Проверить в браузере (п. 8). |

После этого приложение доступно по домену с полным подключением к backend в Docker.
