#!/usr/bin/env bash

# Formats TypeScript and TSX source files with Prettier.

set -euo pipefail

if ! command -v npx >/dev/null 2>&1; then
    echo " *** ERROR: npm/npx is required" >&2
    exit 1
fi

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

if [[ ${#paths[@]} -eq 0 ]]; then
    mapfile -d '' paths < <(
        find src -type f \( -name '*.ts' -o -name '*.tsx' \) -print0
    )
fi

if [[ ${#paths[@]} -eq 0 ]]; then
    echo " *** ERROR: no TypeScript or TSX source files found" >&2
    exit 1
fi

npx prettier "${options[@]}" "${paths[@]}" || {
    echo " *** ERROR: Prettier formatting failed" >&2
    exit 1
}
