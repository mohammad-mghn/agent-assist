#!/usr/bin/env bash
set -euo pipefail

RESET="\033[0m"
BOLD="\033[1m"
BLUE="\033[34m"
CYAN="\033[36m"
RED="\033[31m"
GREEN="\033[32m"
YELLOW="\033[33m"
GREY="\033[90m"

ACTIONS=(
  "dev"
  "dev-firefox"
  "build"
  "compile"
  "install"
  "zip-chrome"
  "zip-firefox"
  "zip-both"
)

ACTION_DESCRIPTIONS=(
  "WXT dev server (Chrome MV3)"
  "WXT dev server (Firefox)"
  "Production build"
  "Typecheck only (tsc --noEmit)"
  "Install dependencies"
  "Build, zip, copy to outputs/ (-1, -2, -3, …)"
  "Build, zip, copy to outputs/ (-1, -2, -3, …)"
  "Both browsers; copies to outputs/ with numeric suffix when needed"
)

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
EXT_DIR="$ROOT"
OUT_DIR="$(cd "$ROOT/.." && pwd)/outputs"

###########################################################
# ENSURE BUN IS AVAILABLE
###########################################################

ensure_bun() {
  if command -v bun &>/dev/null; then
    return 0
  fi

  echo -e "${YELLOW}⚠ bun not found — installing globally…${RESET}"

  if command -v curl &>/dev/null; then
    curl -fsSL https://bun.sh/install | bash
  elif command -v wget &>/dev/null; then
    wget -qO- https://bun.sh/install | bash
  else
    echo -e "${RED}❌ Neither curl nor wget found. Please install bun manually: https://bun.sh${RESET}" >&2
    exit 1
  fi

  export BUN_INSTALL="${BUN_INSTALL:-$HOME/.bun}"
  export PATH="$BUN_INSTALL/bin:$PATH"

  if ! command -v bun &>/dev/null; then
    echo -e "${RED}❌ bun installation finished but 'bun' is still not in PATH.${RESET}" >&2
    echo -e "${GREY}   Add the following to your shell profile and re-run:${RESET}" >&2
    echo -e "${GREY}   export BUN_INSTALL=\"\$HOME/.bun\"${RESET}" >&2
    echo -e "${GREY}   export PATH=\"\$BUN_INSTALL/bin:\$PATH\"${RESET}" >&2
    exit 1
  fi

  echo -e "${GREEN}✔ bun $(bun --version) installed successfully.${RESET}"
}

###########################################################
# ZIP → outputs/ (numbered copies)
###########################################################

next_numbered_dest() {
  local base="$1"
  local ext stem n dest

  base="$(basename "$base")"
  ext="${base##*.}"
  stem="${base%.*}"

  n=1
  while true; do
    dest="${OUT_DIR}/${stem}-${n}.${ext}"
    [[ ! -f "$dest" ]] && { echo "$dest"; return; }
    ((n++))
  done
}

copy_zips_since() {
  local marker="$1"

  mkdir -p "$OUT_DIR"

  local found=0
  while IFS= read -r -d '' f; do
    [[ -f "$f" ]] || continue
    found=1
    local dest
    dest="$(next_numbered_dest "$f")"
    cp "$f" "$dest"
    echo -e "${GREEN}Copied:${RESET} ${GREY}$dest${RESET}"
  done < <(
    find "$EXT_DIR/.output" -name '*.zip' -type f -newer "$marker" -print0 2>/dev/null
  )

  if [[ $found -eq 0 ]]; then
    echo -e "${YELLOW}⚠ No new .zip under .output after zip. If WXT wrote elsewhere, copy manually.${RESET}" >&2
  fi
}

run_zip_chrome() {
  bun run build "$@"
  local marker
  marker="$(mktemp)"
  touch "$marker"
  sleep 1
  bun run zip "$@"
  copy_zips_since "$marker"
  rm -f "$marker"
}

run_zip_firefox() {
  bun run build:firefox "$@"
  local marker
  marker="$(mktemp)"
  touch "$marker"
  sleep 1
  bun run zip:firefox "$@"
  copy_zips_since "$marker"
  rm -f "$marker"
}

run_zip_both() {
  local marker

  marker="$(mktemp)"
  touch "$marker"
  sleep 1
  bun run build && bun run zip
  copy_zips_since "$marker"
  rm -f "$marker"

  marker="$(mktemp)"
  touch "$marker"
  sleep 1
  bun run build:firefox && bun run zip:firefox
  copy_zips_since "$marker"
  rm -f "$marker"
}

###########################################################
# MENU
###########################################################

menu() {
  local title="$1"
  shift
  local items=("$@")

  local index=0
  tput civis

  while true; do
    tput clear
    printf "${CYAN}${BOLD}%s${RESET}\n\n" "$title"

    for i in "${!items[@]}"; do
      local item="${items[$i]}"
      local desc="${ACTION_DESCRIPTIONS[$i]}"
      local cursor="  "

      [[ $i -eq $index ]] && cursor=" ❯"

      printf "%s %-18s ${GREY}%s${RESET}\n" "$cursor" "$item" "$desc"
    done

    read -rsn1 key

    if [[ $key == $'\x1b' ]]; then
      read -rsn2 key
      case "$key" in
        "[A") ((index--)) ;;
        "[B") ((index++)) ;;
      esac
    elif [[ $key == "" ]]; then
      tput cnorm
      REPLY="${items[$index]}"
      return
    fi

    ((index < 0)) && index=$(( ${#items[@]} - 1 ))
    ((index >= ${#items[@]})) && index=0
  done
}

###########################################################
# USAGE
###########################################################

usage() {
  cat <<EOF
${BOLD}Extension (host — no Docker)${RESET}

  Runs commands in ${GREY}extension/${RESET} using ${BOLD}bun${RESET}.
  ${GREY}build${RESET} / ${GREY}zip-*${RESET} use WXT production mode.
  Zip actions copy ${GREY}.output/*.zip${RESET} to ${GREY}outputs/${RESET} with a numeric suffix (${GREY}-1${RESET}, ${GREY}-2${RESET}, ${GREY}-3${RESET}, …).

${BOLD}Usage:${RESET}
  ./extension.sh [action] [extra args — forwarded where supported]

${BOLD}Actions:${RESET}
EOF
  local i
  for i in "${!ACTIONS[@]}"; do
    printf "  %-12s %s\n" "${ACTIONS[$i]}" "${ACTION_DESCRIPTIONS[$i]}"
  done
  cat <<EOF

${BOLD}Examples:${RESET}
  ./extension.sh
  ./extension.sh dev
  ./extension.sh zip-chrome
  ./extension.sh zip-both
EOF
}

###########################################################
# MAIN
###########################################################

if [[ ! -d "$EXT_DIR" ]]; then
  echo -e "${RED}❌ Not found: $EXT_DIR${RESET}" >&2
  exit 1
fi

if [[ "${1:-}" == "-h" || "${1:-}" == "--help" ]]; then
  usage
  exit 0
fi

ensure_bun

ACTION="${1:-}"

if [[ -z "$ACTION" ]]; then
  menu "Choose action:" "${ACTIONS[@]}"
  ACTION="$REPLY"
else
  shift
fi

clear
echo -e "${GREEN}${BOLD}Extension (local)${RESET}"
echo
echo "Directory : $EXT_DIR"
echo "Runtime   : bun $(bun --version)"
echo "Action    : $ACTION"
if [[ "$ACTION" == zip-chrome || "$ACTION" == zip-firefox || "$ACTION" == zip-both ]]; then
  echo "Zip copy  : $OUT_DIR (-1, -2, -3, … suffix)"
fi
echo

cd "$EXT_DIR"

case "$ACTION" in
  dev)
    exec bun run dev
    ;;
  dev-firefox)
    exec bun run dev:firefox "$@"
    ;;
  build)
    exec bun run build "$@"
    ;;
  compile)
    exec bun run compile "$@"
    ;;
  install)
    exec bun install "$@"
    ;;
  zip-chrome)
    run_zip_chrome "$@"
    ;;
  zip-firefox)
    run_zip_firefox "$@"
    ;;
  zip-both)
    run_zip_both
    ;;
  *)
    echo -e "${RED}Unknown action: $ACTION${RESET}" >&2
    echo "Run ./extension.sh --help" >&2
    exit 1
    ;;
esac
