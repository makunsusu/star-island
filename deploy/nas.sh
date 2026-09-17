#!/usr/bin/env bash
set -euo pipefail
: "${DATA_DIR:?}" "${APP_PORT:?}" "${APP_ORIGIN:?}" "${IMAGE_TAG:?}"
[[ "$DATA_DIR" = /*/star-island && "$DATA_DIR" != *..* ]] || { echo 'DATA_DIR must be an absolute dedicated star-island directory'; exit 1; }
[[ "$APP_PORT" =~ ^[0-9]+$ ]] && (( APP_PORT > 1024 && APP_PORT < 65536 ))
[[ "$APP_ORIGIN" =~ ^https?://[a-zA-Z0-9.:-]+$ ]]
[[ "$IMAGE_TAG" =~ ^[a-zA-Z0-9._-]+$ ]]
export DATA_DIR APP_PORT APP_ORIGIN IMAGE_TAG
umask 077
mkdir -p "$DATA_DIR/config" "$DATA_DIR/backups"
config="$DATA_DIR/config/runtime.env"
if [[ ! -f "$config" ]]; then
  password=$(od -An -N32 -tx1 /dev/urandom | tr -d ' \n')
  printf 'POSTGRES_PASSWORD=%s\n' "$password" > "$config"
fi
export SESSION_COOKIE_SECURE=false
[[ "$APP_ORIGIN" != https://* ]] || export SESSION_COOKIE_SECURE=true
compose() { docker compose --env-file "$config" -f compose.nas.yaml "$@"; }
previous=$(docker inspect --format '{{.Config.Image}}' "$(compose ps -q app)" 2>/dev/null || true)
compose build app
if [[ -n "$(compose ps -q db)" ]]; then
  compose exec -T db pg_dump -U star star_island > "$DATA_DIR/backups/$(date +%Y%m%d-%H%M%S).sql"
fi
started=true
compose up -d --wait --wait-timeout 120 || started=false
for attempt in $(seq 1 30); do
  if "$started" && curl -fsS "http://127.0.0.1:$APP_PORT/api/health" && curl -fsS "http://127.0.0.1:$APP_PORT/" -o /dev/null; then
    echo "Deployment healthy: $APP_ORIGIN"
    exit 0
  fi
  sleep 2
done
if [[ "$previous" == star-island:* ]]; then
  export IMAGE_TAG="${previous#star-island:}"
  compose up -d --no-build app
  echo 'Restored previous application image; database backup retained.'
fi
echo 'Health check failed.'
exit 1
