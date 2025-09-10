#!/bin/bash
# daily-analysis.sh - GitHub Actions only
set -e

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "🔍 Starting daily PostHog session analysis..."

# GitHub Actions only - use environment variables from secrets
echo "🤖 Running autonomous analysis with GitHub Actions secrets"

# Verify required variables are set
if [ -z "$POSTHOG_API_KEY" ] || [ -z "$GITHUB_PERSONAL_ACCESS_TOKEN" ] || [ -z "$GITHUB_OWNER" ] || [ -z "$GITHUB_REPO" ]; then
  echo "❌ Missing required environment variables:"
  echo "  POSTHOG_API_KEY: ${POSTHOG_API_KEY:+SET}"
  echo "  GITHUB_PERSONAL_ACCESS_TOKEN: ${GITHUB_PERSONAL_ACCESS_TOKEN:+SET}"  
  echo "  GITHUB_OWNER: ${GITHUB_OWNER:+SET}"
  echo "  GITHUB_REPO: ${GITHUB_REPO:+SET}"
  exit 1
fi

echo "✅ All GitHub Actions secrets configured"

# Run the session analysis
echo "🎬 Running PostHog session analysis..."
./analyze-sessions.sh > analysis-results.txt

# Create GitHub issues based on the analysis  
echo "📝 Creating GitHub issues from analysis..."
./create-github-issues.sh

echo "✅ Daily analysis complete!"
