#!/usr/bin/env bash
# Run ON the Ubuntu droplet as root (after repo is cloned to APP_DIR).
# Usage: APP_DIR=/var/www/volunteer-events bash deploy/deploy-droplet.sh
set -euo pipefail

APP_DIR="${APP_DIR:-/var/www/volunteer-events}"
PHP_VERSION="${PHP_VERSION:-8.4}"

cd "$APP_DIR"
git fetch origin
git reset --hard "origin/${DEPLOY_BRANCH:-main}"

cd "$APP_DIR/backend"
composer install --no-dev --optimize-autoloader --no-interaction
php artisan migrate --force
php artisan config:cache
php artisan route:cache
php artisan view:cache

cd "$APP_DIR/frontend"
npm ci
npm run build

systemctl reload "php${PHP_VERSION}-fpm"
systemctl reload nginx

echo "Deploy finished. Test: curl -sS -o /dev/null -w '%{http_code}' http://127.0.0.1/up"
