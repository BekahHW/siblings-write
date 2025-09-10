#!/bin/bash
# daily-analysis.sh
set -e
set -x

echo "🔍 Starting daily PostHog session analysis..."

# Run the session analysis
./posthog-continuous-ai/analyze-sessions.sh > analysis-results.txt

# Create GitHub issues based on the analysis
./posthog-continuous-ai/create-github-issues.sh

echo "✅ Daily analysis complete!"