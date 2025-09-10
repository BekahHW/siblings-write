#!/bin/bash
# daily-analysis.sh
set -e

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "🔍 Starting daily PostHog session analysis..."

# Check if running locally or in GitHub Actions
if [ -f ".env" ]; then
  # Local development - use .env file
  source .env
  echo "✅ Loaded local .env file"
elif [ -n "$POSTHOG_API_KEY" ]; then
  # Environment variables already set (GitHub Actions)
  echo "✅ Using environment variables"
else
  echo "❌ No configuration found. Please:"
  echo "  - Create .env file for local development, OR"
  echo "  - Set environment variables manually"
  exit 1
fi

# Verify required variables are set
if [ -z "$POSTHOG_API_KEY" ] || [ -z "$GITHUB_PERSONAL_ACCESS_TOKEN" ] || [ -z "$GITHUB_OWNER" ] || [ -z "$GITHUB_REPO" ]; then
  echo "❌ Missing required environment variables:"
  echo "  POSTHOG_API_KEY, GITHUB_PERSONAL_ACCESS_TOKEN, GITHUB_OWNER, GITHUB_REPO"
  exit 1
fi

echo "✅ All environment variables configured"

# Run the session analysis
echo "🎬 Running PostHog session analysis..."
./analyze-sessions.sh > analysis-results.txt

# Create GitHub issues based on the analysis  
echo "📝 Creating GitHub issues from analysis..."
./create-github-issues.sh

echo "✅ Daily analysis complete!"


