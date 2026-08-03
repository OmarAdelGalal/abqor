#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd -- "${SCRIPT_DIR}/.." && pwd)"

cd "${PROJECT_DIR}"

if docker compose version >/dev/null 2>&1; then
  COMPOSE=(docker compose)
elif command -v docker-compose >/dev/null 2>&1; then
  COMPOSE=(docker-compose)
else
  echo "ERROR: Docker Compose not found (need 'docker compose' or 'docker-compose')." >&2
  exit 1
fi

if [[ ! -f docker-compose.yml ]]; then
  echo "ERROR: docker-compose.yml not found in ${PROJECT_DIR}" >&2
  exit 1
fi

if [[ ! -d .git ]]; then
  echo "ERROR: ${PROJECT_DIR} is not a git checkout (.git missing). Cannot safely 'git pull'." >&2
  echo "Tip: deploy by cloning the repo on the server, or update code manually, then re-run." >&2
  exit 1
fi

if [[ -f .env ]]; then
  set -a
  # shellcheck disable=SC1091
  source ./.env
  set +a
fi

mkdir -p _backups
ts="$(date +%F_%H%M%S)"
backup_file="_backups/mysql_${ts}.sql.gz"

echo "==> Ensuring database container is up..."
"${COMPOSE[@]}" up -d database >/dev/null

echo "==> Waiting for MySQL to be ready..."
ready=0
for _ in $(seq 1 60); do
  if "${COMPOSE[@]}" exec -T database sh -lc 'mysqladmin ping -uroot -p"$MYSQL_ROOT_PASSWORD" --silent' >/dev/null 2>&1; then
    ready=1
    break
  fi
  sleep 2
done

if [[ "${ready}" != "1" ]]; then
  echo "ERROR: MySQL did not become ready in time." >&2
  exit 1
fi

echo "==> Backing up MySQL to ${backup_file} (no volumes are removed)..."
"${COMPOSE[@]}" exec -T database sh -lc 'mysqldump -uroot -p"$MYSQL_ROOT_PASSWORD" --single-transaction --routines --triggers --events "$MYSQL_DATABASE"' \
  | gzip -9 > "${backup_file}"

echo "==> Updating code (fast-forward only)..."
if [[ -n "$(git status --porcelain)" ]]; then
  echo "ERROR: Working tree has local changes; refusing to pull." >&2
  git status --porcelain >&2
  exit 1
fi

git fetch --all --prune
git pull --ff-only

if [[ -n "${STD_ZOOM_PATH:-}" && ! -d "${STD_ZOOM_PATH}" ]]; then
  echo "ERROR: STD_ZOOM_PATH does not exist: ${STD_ZOOM_PATH}" >&2
  echo "Fix your .env in ${PROJECT_DIR} and re-run." >&2
  exit 1
fi

echo "==> Rebuilding + restarting backend + std_zoom (DB data is kept)..."
"${COMPOSE[@]}" up -d --build app app_ws app_queue app_schdule std_zoom

echo "==> Running migrations + caches..."
"${COMPOSE[@]}" exec -T app php artisan migrate --force
"${COMPOSE[@]}" exec -T app php artisan config:cache
"${COMPOSE[@]}" exec -T app php artisan route:cache || true
"${COMPOSE[@]}" exec -T app php artisan view:cache || true

echo "==> Restarting nginx..."
"${COMPOSE[@]}" restart nginx >/dev/null

echo "==> Status"
"${COMPOSE[@]}" ps

echo "==> Quick checks"
if command -v curl >/dev/null 2>&1; then
  curl -fsSI http://localhost/std_zoom/ | head -n 5 || true
  curl -fsSI http://localhost/admin_portal/ | head -n 5 || true
  curl -fsSI http://localhost/api/user/general/app_config | head -n 5 || true
fi

echo "Done. Backup saved at ${PROJECT_DIR}/${backup_file}"
