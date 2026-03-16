#!/bin/bash
# Deploy Angelo demo (mock data, stress mode) to server. No backend needed.
# Run on server: ./deploy-demo.sh
# Or: ssh root@79.132.137.145 "cd /opt/angelo && ./deploy-demo.sh"
# Override: PROJECT_DIR=/path WEB_ROOT=/var/www/angelo ./deploy-demo.sh
set -e

PROJECT_DIR="${PROJECT_DIR:-$(cd "$(dirname "$0")" && pwd)}"
WEB_ROOT="${WEB_ROOT:-/var/www/angelo}"

cd "$PROJECT_DIR"
echo ">>> git pull"
git pull

echo ">>> frontend: npm run build:demo"
npm ci --silent 2>/dev/null || npm install
npm run build:demo

echo ">>> copy dist to $WEB_ROOT"
sudo mkdir -p "$WEB_ROOT"
sudo cp -r dist/* "$WEB_ROOT/"

echo ">>> reload nginx"
sudo nginx -t 2>/dev/null && sudo systemctl reload nginx 2>/dev/null || true

echo ">>> done"
