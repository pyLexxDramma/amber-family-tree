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

### Коммит на GitHub совпадает с VPS, а сайт «как старый»

1. **Фронт собран с другими `VITE_*`, чем локально.** Локально это `.env.local`, на сервере при `./deploy-fornex.sh` — опциональный `/opt/angelo/.env.deploy` (см. `.env.example`). Без флагов вроде `VITE_VISION_IA_NAV` интерфейс будет как в базовом режиме при том же исходнике.
2. **Два деплоя в один каталог.** Workflow `.github/workflows/deploy.yml` после каждого push в `main` заливает **только** `dist/` по **FTP**. Если цель FTP — тот же `root`, что и у nginx на Fornex (`/var/www/angelo`), то сборка из GitHub Actions **перезапишет** фронт после вашего `./deploy-fornex.sh`. У Actions нет серверного `.env.deploy`, поэтому визуально снова «старая» сборка. Варианты: отключить/перенастроить FTP на другой хост, или добавить те же `VITE_*` в secrets/vars CI и шаг сборки там, или деплоить на VPS **последним** снова `./deploy-fornex.sh` после успешного workflow.
3. **Кэш HTML в браузере.** Жёсткое обновление (Ctrl+Shift+R) или приватное окно. На сервере в nginx лучше не кэшировать `index.html`, а ассеты из `/assets/` — с длинным кэшем; пример: `docs/nginx-angelo.conf`.

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
