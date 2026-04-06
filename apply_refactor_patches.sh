#!/usr/bin/env bash
set -Eeuo pipefail

PATCH_DIR="${1:-refactor_patches}"
BACKEND_DIR="backend"

PATCHES=(
  "01_model_service.patch"
  "02_convert_file_service.patch"
  "03_rust_sidecar_client.patch"
  "04_slide_content_generator.patch"
  "05_auth_routes.patch"
  "06_user_schemas.patch"
  "07_presentation_routes.patch"
  "08_database.patch"
  "09_main.patch"
  "10_tempfile_service.patch"
  "11_model_api_utils.patch"
  "12_config.patch"
  "13_presentation_schemas.patch"
  "14_docker-compose.patch"
  "15_nginx_prod_conf.patch"
  "16_nginx_conf_d_prod.patch"
)

BACKEND_PATCHES=(
  "01_model_service.patch"
  "02_convert_file_service.patch"
  "03_rust_sidecar_client.patch"
  "04_slide_content_generator.patch"
  "05_auth_routes.patch"
  "06_user_schemas.patch"
  "07_presentation_routes.patch"
  "08_database.patch"
  "09_main.patch"
  "10_tempfile_service.patch"
  "11_model_api_utils.patch"
  "12_config.patch"
  "13_presentation_schemas.patch"
)

DOCKER_PATCHES=(
  "14_docker-compose.patch"
  "15_nginx_prod_conf.patch"
  "16_nginx_conf_d_prod.patch"
)

log() {
  printf "\n[%s] %s\n" "$(date '+%H:%M:%S')" "$*"
}

die() {
  printf "\n[ERROR] %s\n" "$*" >&2
  exit 1
}

contains() {
  local needle="$1"
  shift
  local item
  for item in "$@"; do
    [[ "$item" == "$needle" ]] && return 0
  done
  return 1
}

require_cmd() {
  command -v "$1" >/dev/null 2>&1 || die "Не найдена команда: $1"
}

on_error() {
  local exit_code=$?
  local line_no=${1:-unknown}
  printf "\n[ERROR] Скрипт остановлен на строке %s с кодом %s\n" "$line_no" "$exit_code" >&2
  exit "$exit_code"
}
trap 'on_error $LINENO' ERR

require_cmd git
require_cmd python

[[ -d "$PATCH_DIR" ]] || die "Каталог с патчами не найден: $PATCH_DIR"
[[ -d ".git" ]] || die "Скрипт нужно запускать из корня git-репозитория"
[[ -d "$BACKEND_DIR" ]] || die "Не найден каталог backend: $BACKEND_DIR"

if ! git diff --quiet || ! git diff --cached --quiet; then
  die "Рабочее дерево не чистое. Сначала закоммить или убери изменения."
fi

log "Проверяю наличие патчей"
for patch in "${PATCHES[@]}"; do
  [[ -f "$PATCH_DIR/$patch" ]] || die "Не найден патч: $PATCH_DIR/$patch"
done

apply_one_patch() {
  local patch="$1"
  local patch_path="$PATCH_DIR/$patch"
  local commit_msg="Apply ${patch%.patch}"

  log "Проверка патча: $patch"
  git apply --check "$patch_path"

  log "Применение патча: $patch"
  git apply "$patch_path"

  if contains "$patch" "${BACKEND_PATCHES[@]}"; then
    log "Проверка Python backend после $patch"
    (
      cd "$BACKEND_DIR"
      python -m compileall -q src
    )
  fi

  if contains "$patch" "${DOCKER_PATCHES[@]}"; then
    if command -v docker >/dev/null 2>&1; then
      log "Проверка docker compose после $patch"
      docker compose config >/dev/null
    else
      log "docker не найден, пропускаю docker compose config"
    fi
  fi

  log "Коммит: $commit_msg"
  git add .
  git commit -m "$commit_msg" >/dev/null

  log "Успешно: $patch"
}

log "Начинаю последовательное применение патчей"
for patch in "${PATCHES[@]}"; do
  apply_one_patch "$patch"
done

log "Все патчи успешно применены"

if command -v docker >/dev/null 2>&1; then
  log "Финальная проверка docker compose"
  docker compose config >/dev/null || die "docker compose config завершился с ошибкой"

  if docker compose run --rm nginx nginx -t >/dev/null 2>&1; then
    log "nginx -t прошёл успешно"
  else
    log "nginx -t не выполнен или завершился с ошибкой; проверь контейнер nginx отдельно"
  fi
else
  log "docker не найден, финальная docker/nginx проверка пропущена"
fi

log "Готово"