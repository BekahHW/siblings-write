#!/bin/bash
# daily-analysis.sh
set -e

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "🔍 Starting daily PostHog session analysis..."

# Check if .env file exists
if [ ! -f ".env" ]; then
  echo "❌ .env file not found. Please create it with your API keys."
  exit 1
fi

# Check if GitHub CLI is authenticated
if ! gh auth status &> /dev/null; then
  echo "❌ GitHub CLI not authenticated. Please run 'gh auth login' first."
  exit 1
fi

# Run the session analysis
./analyze-sessions.sh > analysis-results.txt

# Create GitHub issues based on the analysis  
./create-github-issues.sh

echo "✅ Daily analysis complete!"
