#!/usr/bin/env bash
set -euo pipefail

# Downloads local ASR/NLP models used by transformers.js and saves them under public/models.
# Requires: python (venv recommended) and huggingface_hub installed.

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
VENV_BIN="$ROOT_DIR/.venv/bin"

python_bin() {
  if [[ -x "$VENV_BIN/python" ]]; then
    echo "$VENV_BIN/python"
  else
    command -v python3
  fi
}

PYTHON_BIN="$(python_bin)"
if [[ -z "$PYTHON_BIN" ]]; then
  echo "Python not found. Please install Python 3 and retry." >&2
  exit 1
fi

"$PYTHON_BIN" - <<'PY'
from pathlib import Path
from huggingface_hub import snapshot_download

root = Path(__file__).resolve().parent.parent
dest_root = root / "public" / "models"
dest_root.mkdir(parents=True, exist_ok=True)

models = {
    "distilbart-cnn-12-6": "Xenova/distilbart-cnn-12-6",  # summarization
    "distilbert-base-uncased-mnli": "Xenova/distilbert-base-uncased-mnli",  # zero-shot classifier
}

for folder, repo in models.items():
    dest = dest_root / folder
    dest.mkdir(parents=True, exist_ok=True)
    print(f"Downloading {repo} -> {dest}")
    snapshot_download(repo_id=repo, local_dir=dest, local_dir_use_symlinks=False)

print("All models downloaded to", dest_root)
PY
