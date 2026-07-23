#!/bin/zsh

PROJECT_DIRECTORY="$(cd "$(dirname "$0")" && pwd)"

if command -v node >/dev/null 2>&1; then
  NODE_BINARY="$(command -v node)"
elif [ -x "$HOME/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node" ]; then
  NODE_BINARY="$HOME/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node"
elif [ -x "/opt/homebrew/bin/node" ]; then
  NODE_BINARY="/opt/homebrew/bin/node"
elif [ -x "/usr/local/bin/node" ]; then
  NODE_BINARY="/usr/local/bin/node"
else
  echo "The Question Editor needs Node.js, but it could not be found."
  echo "Install Node.js or open this project in Codex, then try again."
  read -r "?Press Return to close."
  exit 1
fi

cd "$PROJECT_DIRECTORY" || exit 1
"$NODE_BINARY" scripts/music-concepts/question-editor-server.js
