- name: Set up environment
  run: |
    echo "POSTHOG_API_KEY=${{ secrets.POSTHOG_API_KEY }}" >> .env
    echo "POSTHOG_PROJECT_ID=${{ secrets.POSTHOG_PROJECT_ID }}" >> .env
    echo "POSTHOG_HOST=https://us.posthog.com" >> .env
    echo "GITHUB_OWNER=${{ github.repository_owner }}" >> .env
    echo "GITHUB_REPO=$(echo ${{ github.repository }} | cut -d'/' -f2)" >> .env

- name: Install dependencies
  run: |
    sudo apt-get update
    sudo apt-get install -y jq curl
    npm install -g @continuedev/cli

- name: Authenticate GitHub CLI
  run: |
    echo "${{ secrets.GITHUB_TOKEN }}" | gh auth login --with-token

- name: Run analysis
  run: ./daily-analysis.sh
#!/bin/bash
# daily-analysis.sh
set -e

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "🔍 Starting daily PostHog session analysis..."

# Run the session analysis
./analyze-sessions.sh > analysis-results.txt

# Create GitHub issues based on the analysis  
./create-github-issues.sh

echo "✅ Daily analysis complete!"#!/bin/bash
# daily-analysis.sh
set -e

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "🔍 Starting daily PostHog session analysis..."

# Run the session analysis
./analyze-sessions.sh > analysis-results.txt

# Create GitHub issues based on the analysis  
./create-github-issues.sh

echo "✅ Daily analysis complete!"#!/bin/bash
# daily-analysis.sh
set -e

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "🔍 Starting daily PostHog session analysis..."

# Run the session analysis
./analyze-sessions.sh > analysis-results.txt

# Create GitHub issues based on the analysis  
./create-github-issues.sh

echo "✅ Daily analysis complete!"