#!/usr/bin/env bash
set -e
cd "$(dirname "$0")"
PORT="${1:-4173}"
if command -v python3 >/dev/null 2>&1; then
  echo "BalanceBot Wiring Studio: http://127.0.0.1:${PORT}"
  python3 -m http.server "$PORT" --bind 127.0.0.1
elif command -v python >/dev/null 2>&1; then
  echo "BalanceBot Wiring Studio: http://127.0.0.1:${PORT}"
  python -m http.server "$PORT" --bind 127.0.0.1
else
  echo "Python not found. Use VS Code Live Server / Go Live."
  exit 1
fi
