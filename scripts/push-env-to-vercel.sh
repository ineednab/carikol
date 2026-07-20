#!/usr/bin/env bash
# Push all vars from .env to Vercel (all environments)
# Run from project root: bash scripts/push-env-to-vercel.sh

set -e
cd "$(dirname "$0")/.."

ENV_FILE=".env"
if [ ! -f "$ENV_FILE" ]; then
  echo "❌ .env not found"
  exit 1
fi

while IFS= read -r line || [[ -n "$line" ]]; do
  # skip comments and blank lines
  [[ "$line" =~ ^[[:space:]]*# ]] && continue
  [[ -z "${line// }" ]] && continue
  # split on first =
  key="${line%%=*}"
  value="${line#*=}"
  [[ -z "$key" ]] && continue

  echo "→ $key"
  printf '%s' "$value" | vercel env add "$key" production --force 2>/dev/null || true
  printf '%s' "$value" | vercel env add "$key" preview   --force 2>/dev/null || true
  printf '%s' "$value" | vercel env add "$key" development --force 2>/dev/null || true
done < "$ENV_FILE"

echo ""
echo "✓ Done. Run: vercel --prod"
