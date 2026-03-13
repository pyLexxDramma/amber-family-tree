#!/bin/bash
# Deploy Angelo to Fornex VPS. Run on server: ./deploy-fornex.sh
# Or via SSH: ssh user@host "cd /opt/angelo && ./deploy-fornex.sh"
# Override: PROJECT_DIR=/path WEB_ROOT=/var/www/angelo/dist ./deploy-fornex.sh
set -e

PROJECT_DIR="${PROJECT_DIR:-$(cd "$(dirname "$0")" && pwd)}"
WEB_ROOT="${WEB_ROOT:-/var/www/angelo/dist}"

cd "$PROJECT_DIR"
echo ">>> git pull"
git pull

echo ">>> backend: docker compose up -d --build"
cd backend
docker compose up -d --build
cd ..

echo ">>> frontend: npm run build"
export VITE_USE_MOCK_API=false
npm ci --silent 2>/dev/null || npm install
npm run build

echo ">>> copy dist to $WEB_ROOT"
sudo mkdir -p "$WEB_ROOT"
sudo cp -r dist/* "$WEB_ROOT/"

echo ">>> reload nginx"
sudo nginx -t 2>/dev/null && sudo systemctl reload nginx 2>/dev/null || true

echo ">>> done"
