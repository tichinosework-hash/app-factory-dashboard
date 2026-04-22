#!/bin/bash
# VPS deploy — git pull → build → restore standalone static → restart
#
# 前提: /root/app-factory-dashboard で、root 権限で実行。
#
# なぜ cp が必要か:
#   Next.js の `output: "standalone"` モードは server.js のみを生成し、
#   .next/static と public は自動コピーしない。手動で standalone の中に
#   入れないと CSS/画像が 404 になる（Next.js 公式ドキュメント記載の仕様）。
#
# Usage: bash scripts/deploy.sh

set -e

REPO=/root/app-factory-dashboard
SERVICE=app-factory-dashboard
STANDALONE="$REPO/.next/standalone/app-factory-dashboard"

cd "$REPO"

echo "[1/4] git pull"
git pull --ff-only

echo "[2/4] next build"
npx next build

echo "[3/4] restore .next/static + public into standalone"
rm -rf "$STANDALONE/.next/static" "$STANDALONE/public"
cp -r .next/static "$STANDALONE/.next/"
[ -d public ] && cp -r public "$STANDALONE/"

echo "[4/4] restart $SERVICE"
systemctl restart "$SERVICE"
sleep 2
systemctl is-active "$SERVICE"

echo "--- smoke test ---"
curl -sS -o /dev/null -w "  /         HTTP %{http_code}\n" http://127.0.0.1:3101/
curl -sS -o /dev/null -w "  /skills   HTTP %{http_code}\n" http://127.0.0.1:3101/skills
curl -sS -o /dev/null -w "  /api/apps HTTP %{http_code}\n" http://127.0.0.1:3101/api/apps
echo "deploy done"
