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
elif [ "$GITHUB_ACTIONS" = "true" ]; then
  # GitHub Actions - use GitHub secrets via gh CLI
  echo "✅ Running in GitHub Actions - using GitHub secrets"
  export POSTHOG_API_KEY=$(gh secret list --json name,value | jq -r '.[] | select(.name=="POSTHOG_API_KEY") | .value')
  export POSTHOG_PROJECT_ID=$(gh secret list --json name,value | jq -r '.[] | select(.name=="POSTHOG_PROJECT_ID") | .value')
  export POSTHOG_HOST="https://us.posthog.com"
  export GITHUB_OWNER="$GITHUB_REPOSITORY_OWNER"
  export GITHUB_REPO="${GITHUB_REPOSITORY##*/}"
elif [ -n "$POSTHOG_API_KEY" ]; then
  # Environment variables already set
  echo "✅ Using environment variables"
else
  echo "❌ No configuration found. Please:"
  echo "  - Create .env file for local development, OR"
  echo "  - Set environment variables, OR" 
  echo "  - Run in GitHub Actions with secrets configured"
  exit 1
fi

# Check if GitHub CLI is authenticated
if ! gh auth status &> /dev/null; then
  echo "❌ GitHub CLI not authenticated. Please run 'gh auth login' first."
  exit 1
fi

# Run the session analysis
echo "🎬 Running PostHog session analysis..."
./analyze-sessions.sh > analysis-results.txt

# Create GitHub issues based on the analysis  
echo "📝 Creating GitHub issues from analysis..."
./create-github-issues.sh

echo "✅ Daily analysis complete!"
