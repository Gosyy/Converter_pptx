#!/bin/bash
set -Eeuo pipefail

PROJECT_DIR="/Users/su4ka/Downloads/Converter_pptx_2"
BACKEND_DIR="$PROJECT_DIR/backend"

PATCH_DIR_DEFAULT="$PROJECT_DIR/refactor_patches"
PATCH_ZIP_DEFAULT="$PROJECT_DIR/refactor_patches.zip"
EXTRACTED_PATCH_DIR="$PROJECT_DIR/.tmp_refactor_patches"

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

PATCH_SOURCE="${1:-}"

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
    [ "$item" = "$needle" ] && return 0
  done
  return 1
}

require_cmd() {
  command -v "$1" >/dev/null 2>&1 || die "Не найдена команда: $1"
}

cleanup() {
  if [ -d "$EXTRACTED_PATCH_DIR" ]; then
    rm -rf "$EXTRACTED_PATCH_DIR"
  fi
}

on_error() {
  local exit_code=$?
  local line_no="${1:-unknown}"
  printf "\n[ERROR] Скрипт остановлен на строке %s с кодом %s\n" "$line_no" "$exit_code" >&2
  exit "$exit_code"
}

trap 'on_error $LINENO' ERR
trap cleanup EXIT

require_cmd git
require_cmd python3
require_cmd unzip

[ -d "$PROJECT_DIR" ] || die "Не найден каталог проекта: $PROJECT_DIR"
[ -d "$BACKEND_DIR" ] || die "Не найден backend: $BACKEND_DIR"
[ -d "$PROJECT_DIR/.git" ] || die "В $PROJECT_DIR нет .git. Это должен быть корень git-репозитория."

cd "$PROJECT_DIR"

if ! git diff --quiet || ! git diff --cached --quiet; then
  die "Рабочее дерево не чистое. Сначала закоммить или убери изменения."
fi

resolve_patch_dir() {
  if [ -n "$PATCH_SOURCE" ]; then
    if [ -d "$PATCH_SOURCE" ]; then
      PATCH_DIR="$PATCH_SOURCE"
      return 0
    fi

    if [ -f "$PATCH_SOURCE" ]; then
      rm -rf "$EXTRACTED_PATCH_DIR"
      mkdir -p "$EXTRACTED_PATCH_DIR"
      unzip -q "$PATCH_SOURCE" -d "$EXTRACTED_PATCH_DIR"
      PATCH_DIR="$EXTRACTED_PATCH_DIR"
      return 0
    fi

    die "Указанный источник патчей не найден: $PATCH_SOURCE"
  fi

  if [ -d "$PATCH_DIR_DEFAULT" ]; then
    PATCH_DIR="$PATCH_DIR_DEFAULT"
    return 0
  fi

  if [ -f "$PATCH_ZIP_DEFAULT" ]; then
    rm -rf "$EXTRACTED_PATCH_DIR"
    mkdir -p "$EXTRACTED_PATCH_DIR"
    unzip -q "$PATCH_ZIP_DEFAULT" -d "$EXTRACTED_PATCH_DIR"
    PATCH_DIR="$EXTRACTED_PATCH_DIR"
    return 0
  fi

  die "Не найдены ни папка $PATCH_DIR_DEFAULT, ни архив $PATCH_ZIP_DEFAULT"
}

resolve_patch_dir

log "Использую каталог патчей: $PATCH_DIR"

for patch in "${PATCHES[@]}"; do
  [ -f "$PATCH_DIR/$patch" ] || die "Не найден патч: $PATCH_DIR/$patch"
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
      python3 -m compileall -q src
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