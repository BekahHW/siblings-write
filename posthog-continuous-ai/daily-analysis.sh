#!/bin/bash
# daily-analysis.sh
set -e

echo "🔍 Starting daily PostHog session analysis..."

# Run the session analysis
./analyze-sessions.sh > analysis-results.txt

# Create GitHub issues based on the analysis
./create-github-issues.sh

echo "✅ Daily analysis complete!"