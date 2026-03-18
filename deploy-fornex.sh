#!/bin/bash
# Deploy Angelo to Fornex VPS. Run on server: ./deploy-fornex.sh
# Or via SSH: ssh user@host "cd /opt/angelo && ./deploy-fornex.sh"
# Override: PROJECT_DIR=/path WEB_ROOT=/var/www/angelo ./deploy-fornex.sh
set -e

PROJECT_DIR="${PROJECT_DIR:-$(cd "$(dirname "$0")" && pwd)}"
WEB_ROOT="${WEB_ROOT:-/var/www/angelo}"

cd "$PROJECT_DIR"
echo ">>> git pull"
git pull

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

echo ">>> verify demo media"
for f in demo/media/photo1.jpg demo/avatars/t-anna.png; do
  [ -f "$WEB_ROOT/$f" ] && echo "  OK $f" || echo "  MISSING $f"
done

echo ">>> fix nginx root (if needed)"
for f in /etc/nginx/sites-available/angelo /etc/nginx/sites-available/angelo-test.ru; do
  [ -f "$f" ] && sudo sed -i 's|root /var/www/angelo/dist|root /var/www/angelo|' "$f" 2>/dev/null || true
done

echo ">>> reload nginx"
sudo nginx -t 2>/dev/null && sudo systemctl reload nginx 2>/dev/null || true

echo ">>> done"
