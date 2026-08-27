#!/usr/bin/env bash
set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_DIR"

if [[ -n "${PYTHON_BIN:-}" ]]; then
  exec env PYTHONUNBUFFERED=1 "$PYTHON_BIN" main.py
fi

# Replit's managed Python environment is one directory above this project.
if [[ -x "$PROJECT_DIR/../.pythonlibs/bin/python" ]]; then
  exec env PYTHONUNBUFFERED=1 "$PROJECT_DIR/../.pythonlibs/bin/python" main.py
fi

# On a VPS, uv uses this folder's pyproject.toml and lockfile.
if command -v uv >/dev/null 2>&1; then
  exec env PYTHONUNBUFFERED=1 uv run python main.py
fi

if command -v python3 >/dev/null 2>&1; then
  exec env PYTHONUNBUFFERED=1 python3 main.py
fi

echo "Python 3 is required. Install Python 3.13 or set PYTHON_BIN." >&2
exit 1