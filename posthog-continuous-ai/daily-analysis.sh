#!/bin/bash
# daily-analysis.sh - GitHub Actions only with debugging
set -e

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "🔍 Starting daily PostHog session analysis..."
echo "🤖 Running autonomous analysis with GitHub Actions secrets"

# Debug: Show what environment variables are available
echo "🐛 DEBUG: Environment variable status:"
echo "  POSTHOG_API_KEY: ${POSTHOG_API_KEY:+SET} ${POSTHOG_API_KEY:-MISSING}"
echo "  POSTHOG_PROJECT_ID: ${POSTHOG_PROJECT_ID:+SET} ${POSTHOG_PROJECT_ID:-MISSING}"
echo "  GH_PAT: ${GH_PAT:+SET} ${GH_PAT:-MISSING}"
echo "  GITHUB_OWNER: ${GITHUB_OWNER:+SET} ${GITHUB_OWNER:-MISSING}"
echo "  GITHUB_REPO: ${GITHUB_REPO:+SET} ${GITHUB_REPO:-MISSING}"

# Debug: Show all environment variables containing GITHUB
echo "🐛 DEBUG: All GITHUB environment variables:"
env | grep GITHUB || echo "No GITHUB environment variables found"

# Verify required variables are set
if [ -z "$POSTHOG_API_KEY" ] || [ -z "$GH_PAT" ] || [ -z "$GITHUB_OWNER" ] || [ -z "$GITHUB_REPO" ]; then
  echo "❌ Missing required environment variables"
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


