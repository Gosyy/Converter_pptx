#!/bin/bash
set -Eeuo pipefail

PROJECT_DIR="/Users/su4ka/Downloads/Converter_pptx_2"
BACKEND_DIR="$PROJECT_DIR/backend"

PATCH_DIR_DEFAULT="$PROJECT_DIR/refactor_patches"
PATCH_ZIP_DEFAULT="$PROJECT_DIR/refactor_patches.zip"
EXTRACTED_PATCH_DIR="$PROJECT_DIR/.tmp_refactor_patches"

PATCH_SOURCE="${1:-}"
PATCH_DIR=""
TMP_PATCH="$PROJECT_DIR/.tmp_current_patch.patch"

PATCHES=(
  "backend__src__services__model_service.py.patch"
  "backend__src__services__convert_file_service.py.patch"
  "backend__src__services__rust_sidecar_client.py.patch"
  "backend__src__modules__models__slide_content_generator.py.patch"
  "backend__src__routes__auth_routes.py.patch"
  "backend__src__schemas__user_schemas.py.patch"
  "backend__src__routes__presentation_routes.py.patch"
  "backend__src__database.py.patch"
  "backend__src__main.py.patch"
  "backend__src__services__tempfile_service.py.patch"
  "backend__src__utils__model_api_utils.py.patch"
  "backend__src__config.py.patch"
  "backend__src__schemas__presentation_schemas.py.patch"
  "docker-compose.yml.patch"
  "nginx__nginx.prod.conf.patch"
  "nginx__conf.d__prod.conf.patch"
)

BACKEND_PATCHES=(
  "backend__src__services__model_service.py.patch"
  "backend__src__services__convert_file_service.py.patch"
  "backend__src__services__rust_sidecar_client.py.patch"
  "backend__src__modules__models__slide_content_generator.py.patch"
  "backend__src__routes__auth_routes.py.patch"
  "backend__src__schemas__user_schemas.py.patch"
  "backend__src__routes__presentation_routes.py.patch"
  "backend__src__database.py.patch"
  "backend__src__main.py.patch"
  "backend__src__services__tempfile_service.py.patch"
  "backend__src__utils__model_api_utils.py.patch"
  "backend__src__config.py.patch"
  "backend__src__schemas__presentation_schemas.py.patch"
)

DOCKER_PATCHES=(
  "docker-compose.yml.patch"
  "nginx__nginx.prod.conf.patch"
  "nginx__conf.d__prod.conf.patch"
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
    [ "$item" = "$needle" ] && return 0
  done
  return 1
}

require_cmd() {
  command -v "$1" >/dev/null 2>&1 || die "Не найдена команда: $1"
}

cleanup() {
  [ -d "$EXTRACTED_PATCH_DIR" ] && rm -rf "$EXTRACTED_PATCH_DIR"
  [ -f "$TMP_PATCH" ] && rm -f "$TMP_PATCH"
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
require_cmd sed

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

      if [ -d "$EXTRACTED_PATCH_DIR/refactor_patches" ]; then
        PATCH_DIR="$EXTRACTED_PATCH_DIR/refactor_patches"
      else
        PATCH_DIR="$EXTRACTED_PATCH_DIR"
      fi
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

    if [ -d "$EXTRACTED_PATCH_DIR/refactor_patches" ]; then
      PATCH_DIR="$EXTRACTED_PATCH_DIR/refactor_patches"
    else
      PATCH_DIR="$EXTRACTED_PATCH_DIR"
    fi
    return 0
  fi

  die "Не найдены ни папка $PATCH_DIR_DEFAULT, ни архив $PATCH_ZIP_DEFAULT"
}

resolve_patch_dir

log "Использую каталог патчей: $PATCH_DIR"

for patch in "${PATCHES[@]}"; do
  [ -f "$PATCH_DIR/$patch" ] || die "Не найден патч: $PATCH_DIR/$patch"
done

prepare_backend_patch() {
  local patch_path="$1"
  sed \
    -e 's#^--- backend/#--- #' \
    -e 's#^+++ backend/#+++ #' \
    "$patch_path" > "$TMP_PATCH"
}

apply_backend_patch() {
  local patch_path="$1"
  prepare_backend_patch "$patch_path"

  (
    cd "$BACKEND_DIR"
    git apply --check "$TMP_PATCH"
    git apply "$TMP_PATCH"
    python3 -m compileall -q src
  )
}

apply_root_patch() {
  local patch_path="$1"
  git apply --check "$patch_path"
  git apply "$patch_path"
}

apply_one_patch() {
  local patch="$1"
  local patch_path="$PATCH_DIR/$patch"
  local commit_msg="Apply ${patch%.patch}"

  log "Проверка патча: $patch"

  if contains "$patch" "${BACKEND_PATCHES[@]}"; then
    log "Применение backend-патча из каталога backend: $patch"
    apply_backend_patch "$patch_path"
  else
    log "Применение root/deploy-патча из корня проекта: $patch"
    apply_root_patch "$patch_path"
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