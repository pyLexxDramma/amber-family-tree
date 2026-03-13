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
    }
```

Итоговый фрагмент должен выглядеть так:

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

    client_max_body_size 512m;
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

## Шаг 4. Перезапустить backend (чтобы подхватить .env)

```bash
cd /opt/angelo/backend
docker compose restart api
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
