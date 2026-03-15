# Исправление «Failed to fetch» при загрузке файлов

Пошаговая инструкция для Fornex.

---

## Шаг 1. Подключиться к серверу

```bash
ssh root@79.132.137.145
```

---

## Шаг 2. Отредактировать конфиг nginx

```bash
sudo nano /etc/nginx/sites-available/angelo
```

(Если файл называется иначе — посмотрите в `/etc/nginx/sites-available/`.)

Внутри блока `server { ... }` добавьте **перед** закрывающей `}`:

```nginx
    client_max_body_size 512m;
    location /angelo-media/ {
        proxy_pass http://127.0.0.1:9000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # CORS для браузерного PUT (иначе на ПК будет "Failed to fetch")
        add_header Access-Control-Allow-Origin $http_origin always;
        add_header Access-Control-Allow-Methods "GET, PUT, POST, DELETE, OPTIONS" always;
        add_header Access-Control-Allow-Headers "Authorization, Content-Type, X-Amz-Date, X-Amz-Content-Sha256, X-Amz-Security-Token, X-Requested-With" always;
        add_header Access-Control-Expose-Headers "ETag, x-amz-request-id" always;

        if ($request_method = OPTIONS) {
            return 204;
        }

        proxy_request_buffering off;
        proxy_buffering off;
    }
```

Итоговый фрагмент должен выглядеть так:

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

    client_max_body_size 512m;
    location /angelo-media/ {
        proxy_pass http://127.0.0.1:9000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        add_header Access-Control-Allow-Origin $http_origin always;
        add_header Access-Control-Allow-Methods "GET, PUT, POST, DELETE, OPTIONS" always;
        add_header Access-Control-Allow-Headers "Authorization, Content-Type, X-Amz-Date, X-Amz-Content-Sha256, X-Amz-Security-Token, X-Requested-With" always;
        add_header Access-Control-Expose-Headers "ETag, x-amz-request-id" always;

        if ($request_method = OPTIONS) {
            return 204;
        }

        proxy_request_buffering off;
        proxy_buffering off;
    }
}
```

Сохранить: `Ctrl+O`, Enter, `Ctrl+X`.

---

## Шаг 3. Проверить backend/.env

```bash
cd /opt/angelo/backend
nano .env
```

Найти или добавить строку:

```
S3_PUBLIC_ENDPOINT_URL=https://angelo-test.ru
```

Без слэша в конце. Если домен другой — подставьте свой.

Сохранить: `Ctrl+O`, Enter, `Ctrl+X`.

---

## Шаг 4. Пересоздать контейнер API (restart не подхватывает новый .env)

```bash
cd /opt/angelo/backend
docker compose up -d --force-recreate api
```

---

## Шаг 5. Проверить nginx и перезагрузить

```bash
sudo nginx -t
sudo systemctl reload nginx
```

Если `nginx -t` выдаёт ошибку — проверьте синтаксис в конфиге.

---

## Шаг 6. Проверить загрузку

Откройте сайт в браузере, создайте публикацию с фото. Загрузка должна проходить без «Failed to fetch».

---

## Как проверить настройки (диагностика)

```bash
# 1. S3_PUBLIC_ENDPOINT_URL в .env
grep S3_PUBLIC_ENDPOINT_URL /opt/angelo/backend/.env
# Должно быть: S3_PUBLIC_ENDPOINT_URL=https://angelo-test.ru

# 2. Nginx: есть ли location /angelo-media/
grep -A2 "angelo-media" /etc/nginx/sites-available/angelo

# 3. MinIO слушает порт 9000
curl -s -o /dev/null -w "%{http_code}" --connect-timeout 2 http://127.0.0.1:9000/
# Любой ответ (200, 403) — порт доступен

# 4. Через домен (подставьте реальный путь после загрузки фото)
curl -sI "https://angelo-test.ru/angelo-media/uploads/..."
# Должен вернуть 200, не 404/502
```

В браузере: DevTools → Network → загрузить аватар → клик по запросу `presign` → вкладка Response. В ответе поле `url` должно начинаться с `https://angelo-test.ru/angelo-media/`, а не с `http://`.
