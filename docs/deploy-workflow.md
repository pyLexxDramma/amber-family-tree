# Порядок деплоя

## 1. Проверка локально

```bash
cd backend
docker compose up --build
```

В другом терминале: `npm run dev`. Проверить в браузере.

## 2. GitHub

```bash
git add .
git commit -m "описание"
git push
```

## 3. Деплой на Fornex

По SSH на VPS (через VPN):

```bash
ssh root@79.132.137.145
```

На сервере:

```bash
cd /opt/angelo
./deploy-fornex.sh
```

Скрипт делает: `git fetch` + `git reset --hard origin/main` (локальные коммиты на VPS **не** хранить), пересборка backend в Docker, фронт, nginx.

**Ошибка `column likes.strength does not exist`:** после деплоя один раз применить миграцию к Postgres в Docker:

```bash
docker exec angelo-postgres psql -U angelo -d angelo -c "ALTER TABLE likes ADD COLUMN IF NOT EXISTS strength SMALLINT NOT NULL DEFAULT 1;"
```

Либо файл `docs/sql/likes_strength.sql` скопировать на сервер и выполнить через `psql -f`.

На сервере **не** делать `git add .` — в каталог могут попасть артефакты Docker (`sha256:*`, `transferring` и т.д.); деплой-клон только обновлять через `deploy-fornex.sh`.

### Если уже закоммичен мусор на VPS

```bash
cd /opt/angelo
git fetch origin
git reset --hard origin/main
git clean -fd
```

Перед `git clean` проверь `git status`: не потеряй нужные **не** из репозитория файлы.

## 4. Seed reference (если нужно)

```bash
TOKEN=$(curl -s -X POST "https://angelo-test.ru/api/auth/verify" \
  -H "Content-Type: application/json" \
  -d '{"identifier":"alina.fadeeva@angelo-demo.ru","code":"0000"}' | python3 -c "import sys, json; print(json.load(sys.stdin)['access_token'])")

curl -s -X POST "https://angelo-test.ru/api/debug/seed-reference" \
  -H "Authorization: Bearer $TOKEN"
```

## 5. Проверка

- https://angelo-test.ru/api/docs
- https://angelo-test.ru
