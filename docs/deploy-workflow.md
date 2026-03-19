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

Скрипт сам сделает: git pull, пересоберёт backend в Docker, пересоберёт фронт и перезагрузит nginx.

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
