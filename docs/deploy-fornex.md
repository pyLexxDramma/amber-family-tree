# Деплой Angelo на Fornex и запуск на локали

Документ описывает схему развёртывания с **одним доменом** (фронт и API на одном домене, API под префиксом `/api`), **текущее состояние кода** (внесённые изменения), а также особенности запуска приложения **локально** и на **Fornex**.

---

## 1. Архитектура: один домен + /api

| Среда      | Фронт                    | API                          |
|-----------|---------------------------|------------------------------|
| Локально  | `http://localhost:8080/`  | `http://localhost:8080/api` → proxy → backend:8000 |
| Fornex    | `https://yourdomain.com/` | `https://yourdomain.com/api` → nginx → backend:8000 |

И фронт, и API для браузера — один origin. Запросы к API идут на пути `/api/...`. CORS для своих запросов не требуется. **Ограничение:** если позже появятся другие клиенты с другого origin (мобильное приложение, отдельный фронт на другом домене), запросы к `https://yourdomain.com/api` станут cross-origin — на бэкенде нужно будет включить CORS (разрешённые origins, методы, заголовки).

---

## 2. Изменения в коде (архитектура один домен + /api)

Часть изменений **уже внесена** в репозиторий; ниже — что реализовано и что остаётся справочным или требующим доработки.

### 2.1. Бэкенд: префикс `/api` — **реализовано**

**Файл:** `backend/app/main.py`

Роутеры подключены с общим префиксом `/api`:

```python
app.include_router(auth.router, prefix="/api")
app.include_router(family.router, prefix="/api")
app.include_router(feed.router, prefix="/api")
app.include_router(media.router, prefix="/api")
app.include_router(profile.router, prefix="/api")
```

Эндпоинты доступны по путям `/api/auth/me`, `/api/feed`, `/api/profile/me`, `/api/profile/me/media` и т.д.

Маршрут **GET /health** объявлен на уровне приложения (без префикса `/api`) — по пути `/health`. Его удобно использовать для Docker healthcheck (`http://backend:8000/health`). Через nginx (проксирующий только `/api`) запросы на `https://yourdomain.com/health` до бэкенда не попадают; при необходимости можно добавить отдельно `GET /api/health`.

### 2.2. Фронт: базовый URL и префикс `/api` — **реализовано**

**Файл:** `src/integrations/request.ts`

- **BASE_URL:** если задана `VITE_API_URL` — используется она; иначе в браузере — `window.location.origin`; иначе (тесты, сборка без браузера) — `'http://localhost:8000'`.
- **Префикс путей:** константа `API_PREFIX = '/api'`; в `buildUrl` к путям добавляется `/api`, с нормализацией ведущего слэша (избегается двойной слэш).

В dev при открытии фронта (по умолчанию `http://localhost:8080`) запросы идут на `http://localhost:8080/api/...`; в проде при открытии `https://yourdomain.com` — на `https://yourdomain.com/api/...`.

### 2.3. Локальная разработка: Vite proxy — **реализовано**

**Файл:** `vite.config.ts`

Настроен proxy: сначала правило для **`/api/openai`** (запросы к OpenAI), затем общее правило **`/api`** на бэкенд `http://localhost:8000`. Запросы на `/api/openai` идут в OpenAI, остальные `/api/...` — на backend. Локально схема URL совпадает с продакшеном (один домен, API под `/api`).

### 2.4. Переменные окружения

| Переменная           | Локально (dev)        | Сборка для Fornex (prod) |
|----------------------|------------------------|----------------------------|
| `VITE_USE_MOCK_API`  | `false` (реальный API)| `false`                    |
| `VITE_API_URL`       | не задавать            | не задавать                |

При незаданном `VITE_API_URL` используется текущий origin, запросы идут на `/api/...` того же домена.

### 2.5. Фронт: путь «мои медиа» в profile — **реализовано**

**Файл:** `src/integrations/api.ts`

В `realApi.profile.listMyMedia()` используется путь **`/profile/me/media`** — запрос уходит на `/api/profile/me/media`, бэкенд его обрабатывает. Дополнительных правок не требуется.

---

## 3. Известные несоответствия фронт/бэкенд

Эти моменты не связаны с префиксом `/api`, но при переходе на реальный API без доработок приведут к ошибкам или нерабочим сценариям. Имеет смысл учесть их при доработке фронта и бэкенда.

### 3.1. Auth: эндпоинты и сохранение токена

- **Бэкенд:** есть `POST /auth/send-code` (отправка кода), `POST /auth/verify` (проверка кода, в ответе — `access_token` и `user`), `GET /auth/me`.
- **Фронт:** вызываются `POST /auth/login` и `POST /auth/register` — таких эндпоинтов на бэкенде **нет** (будет 404). Кроме того, ответ `verify` содержит `access_token`, но фронт нигде не записывает его в `localStorage` под ключом `token`, поэтому последующие запросы не отправляют заголовок `Authorization` и бэкенд отвечает 401.

**Что сделать:** либо перевести фронт на сценарий send-code → verify, сохранять токен из ответа `verify` в `localStorage` и использовать его в `request.ts`; либо добавить на бэкенде эндпоинты `login`/`register` под текущий контракт фронта (и определиться, где и когда сохранять токен).

### 3.2. Feed list: имена query-параметров

- **Бэкенд** (`backend/app/api/feed.py`): ожидает параметры **`author_id`**, **`topic_tag`** (snake_case).
- **Фронт** (`FeedListParams`, `api.ts`): передаёт **`authorId`**, **`topicTag`** (camelCase). В URL уходит `?authorId=...&topicTag=...`, бэкенд их не учитывает — фильтрация по автору и тегу не работает.

**Что сделать:** либо в `api.ts` при вызове `feed.list(params)` формировать объект query с ключами `author_id` и `topic_tag` (маппинг из camelCase); либо на бэкенде принять оба варианта (alias или отдельные параметры).

### 3.3. Profile PATCH: формат тела

- **Бэкенд** (`ProfileUpdate`): ожидает поля в **snake_case** (`first_name`, `last_name` и т.д.).
- **Фронт:** в `updateMyProfile(patch: Partial<FamilyMember>)` передаётся объект в **camelCase** (`firstName`, `lastName` и т.д.). Pydantic по умолчанию не принимает camelCase без настройки alias.

**Что сделать:** либо фронт при PATCH отправляет snake_case; либо в схеме `ProfileUpdate` на бэкенде включить поддержку camelCase (alias или `populate_by_name` и т.п.).

---

## 4. Запуск на локали

Ниже предполагается, что бэкенд и фронт настроены как в разделе 2 (префикс `/api`, proxy, BASE_URL) — эти изменения в репозитории **уже внесены**. Запуск локально повторяет схему деплоя на Fornex (один домен, API под `/api`).

### 4.1. Требования

- Node.js и npm (для фронта)
- Docker и Docker Compose (для бэкенда, БД и MinIO)

### 4.2. Запуск бэкенда

```bash
cd backend
cp .env.example .env
# При необходимости отредактировать .env (пароли, JWT_SECRET и т.д.)
docker compose up --build
```

После запуска:

- API: http://localhost:8000  
- Документация API: http://localhost:8000/docs  
- Эндпоинты доступны по путям `/api/...` (например, http://localhost:8000/api/auth/me). Проверка живости: http://localhost:8000/health (без префикса `/api`).

Поднимаются сервисы: **api** (порт 8000), **db** (PostgreSQL, порт 5433), **minio** (порты 9000, 9001).

### 4.3. Запуск фронта

В корне проекта (каталог `amber-family-tree`):

```bash
npm install
npm run dev
```

Фронт откроется по адресу http://localhost:8080 (порт задаётся в `vite.config.ts`, по умолчанию 8080).

### 4.4. Режим API на локали

- Чтобы проверять работу с реальным бэкендом: в `.env` или `.env.development` задать `VITE_USE_MOCK_API=false` (или не задавать переменную, если по умолчанию используется реальный API).
- Все запросы к API пойдут на `http://localhost:8080/api/...` и через Vite proxy — на `http://localhost:8000/api/...`.

### 4.5. Проверка

1. Убедиться, что бэкенд запущен (`docker compose up` в `backend/`).
2. Открыть http://localhost:8080.
3. Во вкладке «Сеть» (DevTools) проверить, что запросы уходят на `http://localhost:8080/api/...` и возвращают ответы от бэкенда.
4. Пройти сценарии: лента, профиль, семья и т.д. **Примечание:** полный сценарий «вход/регистрация» заработает только после устранения несоответствий из раздела 3 (в частности, 3.1 — эндпоинты и сохранение токена). До этого при реальном API эти экраны дадут 404 или отсутствие авторизации. Можно проверять ленту и профиль, вручную подставив токен в `localStorage` под ключом `token` (значение из ответа `POST /api/auth/verify`).

---

## 5. Деплой на Fornex

### 5.1. Особенности Fornex

- **VPS** с возможностью установки своего ПО (Docker, nginx и т.д.).
- Поддержка **Docker** через **Portainer** — удобно поднимать стек (api, db, minio) из `docker-compose.yml`.
- Рекомендуется: один домен, порты 80/443 открыты; 8000, 5433, 9000 — только внутри сервера или Docker-сети.

### 5.2. Подготовка бэкенда

- В репозитории уже есть `backend/Dockerfile` и `backend/docker-compose.yml`.
- В `docker-compose.yml` по умолчанию указано `env_file: .env.example`. **Для продакшена** нужно подставлять переменные из файла с реальными секретами: либо заменить в compose на `env_file: .env`, либо скопировать `backend/.env.example` в `backend/.env`, заполнить в `.env` продакшен-значения (в т.ч. надёжный `JWT_SECRET`) и в compose указать `env_file: .env`. Иначе контейнер возьмёт `.env.example` и будут использоваться тестовые пароли и `JWT_SECRET=change-this-secret-in-prod`. Файл `.env` не коммитить в git (в репозитории он уже в `.gitignore`).
- На сервере в каталоге с проектом создать `backend/.env` на основе `backend/.env.example` и задать:
  - `APP_ENV=production`
  - `APP_DEBUG=false`
  - Надёжный `JWT_SECRET`
  - `DATABASE_URL` (если БД в том же docker-compose — оставить вид `postgresql+asyncpg://...@db:5432/angelo`)
  - Параметры S3/MinIO (если MinIO в том же compose — оставить `http://minio:9000` и т.д.)

### 5.3. Подготовка фронта

- Сборку можно выполнять на VPS, в CI или локально. При сборке **не задавать** `VITE_API_URL` (или оставить пустой) — тогда в браузере будет использоваться текущий origin и запросы пойдут на `/api/...` того же домена; при смене домена пересборка не понадобится.
- В режиме production:
  ```bash
  npm run build
  ```
- Артефакты сборки — в каталоге `dist/`.

### 5.4. Nginx (на VPS Fornex)

Один server block на ваш домен (например, `yourdomain.com`):

- **Корень `/`** — раздача статики из каталога с содержимым `dist/` (index.html, assets/ и т.д.), для SPA — `try_files $uri $uri/ /index.html`.
- **Путь `/api`** — proxy_pass на контейнер с API. Выбор адреса зависит от того, где запущен nginx:
  - **Nginx на хосте** (установлен на VPS, контейнер api публикует порт 8000:8000): используйте `http://127.0.0.1:8000` — запросы с хоста дойдут до контейнера.
  - **Nginx в Docker** (в одном docker-compose с backend): используйте `http://api:8000` — имя сервиса и общая сеть; `127.0.0.1` внутри контейнера nginx указывает на сам контейнер, до api так не достучаться.

Пример (nginx на хосте, без SSL — его можно добавить через certbot):

```nginx
server {
    listen 80;
    server_name yourdomain.com;

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

После настройки SSL (Let's Encrypt) — добавить `listen 443 ssl;` и директивы сертификатов.

### 5.5. Запуск на сервере

1. Разместить проект на VPS (git clone или загрузка файлов).
2. Настроить `backend/.env` и в `backend/docker-compose.yml` указать `env_file: .env` (см. п. 5.2).
3. Собрать фронт (`npm run build` в корне проекта — на VPS нужны Node.js и npm, либо сборка в CI/локально, затем копирование `dist/` на сервер).
4. Запустить бэкенд-стек:
   ```bash
   cd backend
   docker compose up -d --build
   ```
5. Скопировать содержимое `dist/` в каталог, указанный в nginx как `root` (например, `/var/www/angelo/dist`).
6. Перезагрузить nginx.
7. Настроить DNS: A-запись домена на IP VPS.

### 5.6. Дополнительно для Fornex

- **Файрвол:** открыть 80, 443 (и при необходимости 22 для SSH); порты 8000, 5433, 9000 наружу не открывать.
- **Резервные копии:** использовать снапшоты/бэкапы VPS в панели Fornex; при необходимости настроить дампы PostgreSQL (cron + выгрузка в хранилище).
- **Portainer:** можно деплоить стек через «Stack» (вставить содержимое `docker-compose.yml`), подставить `.env` и при обновлении делать pull и перезапуск сервисов.
- **Healthcheck для api (по желанию):** чтобы Docker перезапускал контейнер при падении приложения, в `docker-compose.yml` для сервиса `api` можно добавить:
  ```yaml
  healthcheck:
    test: ["CMD", "python", "-c", "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')"]
    interval: 30s
    timeout: 10s
    retries: 3
    start_period: 10s
  ```
  Либо с curl, если образ его содержит: `test: ["CMD", "curl", "-f", "http://localhost:8000/health"]`.

---

## 6. Краткий чеклист

| Шаг | Локально | Fornex |
|-----|-----------|--------|
| Бэкенд с префиксом `/api` | Уже в коде (`main.py`) | То же |
| Фронт: BASE_URL и префикс `/api` | Уже в коде (`request.ts`) | То же |
| Proxy /api → backend | Vite proxy в dev (`vite.config.ts`) | nginx proxy |
| Переменные окружения | `VITE_USE_MOCK_API=false`, без `VITE_API_URL` | Без `VITE_API_URL` при сборке |
| Запуск бэкенда | `cd backend && docker compose up --build` | `docker compose up -d --build` на VPS |
| Запуск фронта | `npm run dev` | Сборка `npm run build`, раздача `dist/` через nginx |
| Проверка | http://localhost:8080, запросы на /api/... | https://yourdomain.com, запросы на /api/... |

Локальный запуск повторяет схему деплоя на Fornex (один домен, API под `/api`).

---

## 7. Подводные камни и ограничения

| № | Тема | Риск | Что учесть |
|---|------|------|------------|
| 1 | env_file в docker-compose | На проде подставляется .env.example, а не .env с секретами | Для прода использовать `env_file: .env`, не коммитить `.env` (см. п. 5.2). |
| 2 | Порядок proxy в Vite | Правила под `/api/...` перехватываются общим `'/api'` | Любой более специфичный путь под `/api` объявлять в proxy **раньше** правила `'/api'` (п. 2.3). |
| 3 | Формат путей при префиксе /api | Путь без ведущего `/` или двойной слэш даёт неверный URL | Пути с ведущим `/`, при добавлении `/api` избегать двойного слэша (п. 2.2). |
| 4 | Nginx в Docker vs на хосте | При nginx в контейнере `127.0.0.1:8000` не подходит | Nginx на хосте → `127.0.0.1:8000`; nginx в compose с api → `http://api:8000` (п. 5.4). |
| 5 | Место сборки фронта | Неочевидно, где собирать под прод | Сборка на VPS, в CI или локально; не задавать `VITE_API_URL` (п. 5.3, 5.5). |
| 6 | Запуск на локали | Раньше требовались правки из раздела 2 | Изменения из раздела 2 уже в коде; запуск по п. 4 корректен. |
| 7 | CORS при других клиентах | Другой origin — понадобится CORS | Схема «один домен» не требует CORS; при появлении мобильного приложения или другого фронта — настроить CORS на API (п. 1). |
| 8 | Проверка входа до правок по 3.1 | Вход/регистрация не работают с реальным API | До устранения несоответствий из п. 3.1 проверять ленту/профиль с ручной подстановкой токена (п. 4.5). |
| 9 | Healthcheck в compose | Нет автоматической проверки живости api | По желанию добавить `healthcheck` для сервиса api (п. 5.6). |
