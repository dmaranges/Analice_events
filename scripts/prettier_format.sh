#!/usr/bin/env bash

# Formats TypeScript and TSX source files with Prettier.

set -euo pipefail

log() {
    echo "[prettier-format] $*"
}

log "Starting in $(pwd)"

if ! command -v npx >/dev/null 2>&1; then
    echo " *** ERROR: npm/npx is required" >&2
    exit 1
fi

log "Node: $(node --version)"
log "npm: $(npm --version)"
log "npx: $(npx prettier --version)"

args=("$@")
options=()
paths=()

for arg in "${args[@]}"; do
    if [[ "$arg" == -* ]]; then
        options+=("$arg")
    else
        paths+=("$arg")
    fi
done

if [[ ${#args[@]} -eq 0 ]]; then
    options=(--write)
fi

log "Options: ${options[*]:-(none)}"

if [[ ${#paths[@]} -eq 0 ]]; then
    mapfile -d '' paths < <(
        find src -type f \( -name '*.ts' -o -name '*.tsx' \) -print0
    )
fi

if [[ ${#paths[@]} -eq 0 ]]; then
    echo " *** ERROR: no TypeScript or TSX source files found" >&2
    exit 1
fi

log "Formatting ${#paths[@]} file(s)"
printf '[prettier-format] Files: %s\n' "${paths[*]}"

set +e
npx prettier "${options[@]}" "${paths[@]}"
status=$?
set -e

if [[ $status -ne 0 ]]; then
    echo " *** ERROR: Prettier formatting failed with exit code $status" >&2
    echo " *** Working tree changes:" >&2
    git diff --stat >&2 || true
    git diff >&2 || true
    exit $status
fi

log "Formatting completed successfully"
