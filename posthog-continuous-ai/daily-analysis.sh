#!/bin/bash
# daily-analysis.sh
set -e

# Load .env for local development
if [ -f .env ]; then
  echo "🔧 Loading .env file for local development..."
  source .env
fi

# Handle GitHub environment variables
# In GitHub Actions, use the automatic variables
# Locally, use .env values or detect from git
if [ -n "$GITHUB_ACTIONS" ]; then
  # Running in GitHub Actions
  echo "🚀 Running in GitHub Actions"
  export GITHUB_OWNER="${GITHUB_REPOSITORY_OWNER}"
  export GITHUB_REPO="${GITHUB_REPOSITORY##*/}"
else
  # Running locally
  echo "💻 Running locally"
  
  # If not set in .env, try to detect from git remote
  if [ -z "$GITHUB_OWNER" ] || [ -z "$GITHUB_REPO" ]; then
    if git remote get-url origin > /dev/null 2>&1; then
      REMOTE_URL=$(git remote get-url origin)
      if [[ $REMOTE_URL =~ github.com[:/]([^/]+)/([^/.]+)(\.git)?$ ]]; then
        export GITHUB_OWNER="${BASH_REMATCH[1]}"
        export GITHUB_REPO="${BASH_REMATCH[2]}"
        echo "📍 Detected from git: $GITHUB_OWNER/$GITHUB_REPO"
      fi
    fi
  fi
fi

# Validate all required environment variables
MISSING_VARS=()
[ -z "$CONTINUE_API_KEY" ] && MISSING_VARS+=("CONTINUE_API_KEY")
[ -z "$POSTHOG_API_KEY" ] && MISSING_VARS+=("POSTHOG_API_KEY")
[ -z "$POSTHOG_PROJECT_ID" ] && MISSING_VARS+=("POSTHOG_PROJECT_ID")
[ -z "$POSTHOG_HOST" ] && MISSING_VARS+=("POSTHOG_HOST")
[ -z "$GITHUB_OWNER" ] && MISSING_VARS+=("GITHUB_OWNER")
[ -z "$GITHUB_REPO" ] && MISSING_VARS+=("GITHUB_REPO")

if [ ${#MISSING_VARS[@]} -ne 0 ]; then
  echo "❌ Missing required environment variables:"
  for var in "${MISSING_VARS[@]}"; do
    echo "  - $var"
  done
  echo ""
  echo "For local development, add these to your .env file:"
  echo "GITHUB_OWNER=your-github-username"
  echo "GITHUB_REPO=your-repo-name"
  exit 1
fi

# Check GitHub CLI authentication
if ! gh auth status > /dev/null 2>&1; then
  echo "❌ GitHub CLI not authenticated"
  echo "Run: gh auth login"
  exit 1
fi

echo "✅ GitHub CLI authenticated"

# Run the analysis
echo "🎬 Running PostHog session analysis..."
if ! bash ./analyze-sessions.sh; then
  echo "❌ Analysis failed"
  exit 1
fi

# Create GitHub issues
echo "📝 Creating GitHub issues from analysis..."
if ! bash ./create-github-issues.sh; then
  echo "❌ Issue creation failed"
  exit 1
fi

echo "✅ Daily analysis complete!"

# Show created issues
echo ""
echo "📊 Recent issues in $GITHUB_OWNER/$GITHUB_REPO:"
gh issue list --repo "$GITHUB_OWNER/$GITHUB_REPO" --limit 5 --label "automated"