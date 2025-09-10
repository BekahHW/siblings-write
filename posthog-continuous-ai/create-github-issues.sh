#!/bin/bash
# create-github-issues.sh - Creates GitHub issues from Continue CLI analysis output
set -e
source .env

# Input file containing Continue CLI analysis output
ANALYSIS_FILE="analysis-results.txt"

# File to track created issues to prevent duplicates
ISSUE_TRACKING_FILE=".created_issues.json"

# Check if analysis file exists
if [ ! -f "$ANALYSIS_FILE" ]; then
  echo "❌ Analysis file not found: $ANALYSIS_FILE"
  exit 1
fi

# Check if GitHub CLI is installed
if ! command -v gh &> /dev/null; then
  echo "❌ GitHub CLI (gh) not found. Please install it first:"
  echo "  https://cli.github.com/manual/installation"
  exit 1
fi

# Make sure gh is authenticated
if ! gh auth status &> /dev/null; then
  echo "❌ GitHub CLI not authenticated. Please run 'gh auth login' first."
  exit 1
fi

# Create issue tracking file if it doesn't exist
if [ ! -f "$ISSUE_TRACKING_FILE" ]; then
  echo "[]" > "$ISSUE_TRACKING_FILE"
fi

# Function to check if an issue with this title already exists
issue_exists() {
  local title="$1"
  local issue_hash=$(echo "$title" | md5sum | cut -d' ' -f1)
  
  # Check in our tracking file
  if grep -q "\"$issue_hash\"" "$ISSUE_TRACKING_FILE"; then
    return 0  # Issue exists
  fi
  
  # Also check actual GitHub issues to be doubly sure
  if gh issue list --repo "$GITHUB_OWNER/$GITHUB_REPO" --search "$title in:title" --json title | grep -q "$title"; then
    # Add to tracking file if found on GitHub but not in our tracking
    local tracking_data=$(cat "$ISSUE_TRACKING_FILE")
    echo "$tracking_data" | jq --arg hash "$issue_hash" '. += [$hash]' > "$ISSUE_TRACKING_FILE"
    return 0  # Issue exists
  fi
  
  return 1  # Issue doesn't exist
}

# Function to record that we created an issue
record_issue() {
  local title="$1"
  local issue_hash=$(echo "$title" | md5sum | cut -d' ' -f1)
  
  local tracking_data=$(cat "$ISSUE_TRACKING_FILE")
  echo "$tracking_data" | jq --arg hash "$issue_hash" '. += [$hash]' > "$ISSUE_TRACKING_FILE"
}

# Function to create a GitHub issue using GitHub CLI
create_github_issue() {
  local title="$1"
  local body="$2"
  local labels="$3"
  
  # Check if this issue already exists
  if issue_exists "$title"; then
    echo "ℹ️ Issue already exists: $title"
    return 0
  fi

  echo "Creating issue: $title"
  
  # Convert labels from JSON array format to comma-separated list
  # Remove brackets, quotes, and add commas
  labels_list=$(echo $labels | sed 's/\[//g' | sed 's/\]//g' | sed 's/"//g' | sed 's/,/,/g')
  
  # Create issue using GitHub CLI
  issue_url=$(gh issue create \
    --repo "$GITHUB_OWNER/$GITHUB_REPO" \
    --title "$title" \
    --body "$body" \
    --label "$labels_list" \
    --web)
  
  if [ $? -eq 0 ]; then
    echo "✅ Created issue: $issue_url"
    # Record that we created this issue
    record_issue "$title"
  else
    echo "❌ Failed to create issue"
  fi
}

# Extract and parse issues from analysis output
echo "🔍 Parsing analysis results for issues..."

# Count the issues in the file by looking for ## Issue pattern
issue_count=$(grep -c "^## Issue" "$ANALYSIS_FILE" || echo 0)

if [ "$issue_count" -eq 0 ]; then
  echo "ℹ️ No issues found in analysis output."
  exit 0
fi

echo "📊 Found $issue_count potential issues to process"

# Process each issue section
while IFS= read -r line || [[ -n "$line" ]]; do
  if [[ $line =~ ^## ]]; then
    # If we have a previous issue, create it
    if [ -n "${issue_title:-}" ] && [ -n "${issue_body:-}" ]; then
      # Determine appropriate labels based on priority in the issue body
      if [[ "$issue_body" =~ "High Priority" ]]; then
        labels="[\"bug\", \"high-priority\", \"user-experience\"]"
      elif [[ "$issue_body" =~ "Medium Priority" ]]; then
        labels="[\"enhancement\", \"medium-priority\", \"user-experience\"]"
      else
        labels="[\"low-priority\", \"user-experience\"]"
      fi
      
      # Create the issue
      create_github_issue "$issue_title" "$issue_body" "$labels"
    fi
    
    # Start a new issue
    issue_title="UX Issue: ${line#\#\# Issue }"
    issue_body=""
  elif [ -n "${issue_title:-}" ]; then
    # Add line to current issue body
    if [ -n "$issue_body" ]; then
      issue_body="$issue_body\n$line"
    else
      issue_body="$line"
    fi
  fi
done < <(sed -n '/^## Issue/,/^## Issue\|^$/p' "$ANALYSIS_FILE")

# Create the last issue if there is one
if [ -n "${issue_title:-}" ] && [ -n "${issue_body:-}" ]; then
  # Determine appropriate labels based on priority in the issue body
  if [[ "$issue_body" =~ "High Priority" ]]; then
    labels="[\"bug\", \"high-priority\", \"user-experience\"]"
  elif [[ "$issue_body" =~ "Medium Priority" ]]; then
    labels="[\"enhancement\", \"medium-priority\", \"user-experience\"]"
  else
    labels="[\"low-priority\", \"user-experience\"]"
  fi
  
  # Create the issue
  create_github_issue "$issue_title" "$issue_body" "$labels"
fi

echo "✅ GitHub issues creation process completed!"