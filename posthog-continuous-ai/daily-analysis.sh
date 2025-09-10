#!/bin/bash
# daily-analysis.sh
set -e

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "🔍 Starting daily PostHog session analysis..."

# Load .env file if it exists (for local development)
if [ -f ".env" ]; then
  source .env
  echo "✅ Loaded local .env file"
elif [ -n "$POSTHOG_API_KEY" ]; then
  echo "✅ Using environment variables (GitHub Actions)"
else
  echo "❌ No .env file found and no environment variables set"
  exit 1
fi

# Rest of script...