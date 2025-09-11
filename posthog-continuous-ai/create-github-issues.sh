#!/bin/bash
# create-github-issues.sh - Creates GitHub issues using GitHub API
set -e
source .env

# Input file containing Continue CLI analysis output
ANALYSIS_FILE="analysis-results.txt"

# Check if analysis file exists
if [ ! -f "$ANALYSIS_FILE" ]; then
  echo "❌ Analysis file not found: $ANALYSIS_FILE"
  exit 1
fi

# Function to create a GitHub issue using GitHub API
create_github_issue() {
  local title="$1"
  local body="$2"
  local labels="$3"

  echo "Creating issue: $title"

  # Convert labels from JSON array to proper JSON array for API
  response=$(curl -s -X POST \
  -H "Authorization: token $GH_PAT" \
    -H "Accept: application/vnd.github.v3+json" \
    -H "Content-Type: application/json" \
    -d "{\"title\":\"$title\", \"body\":\"$body\", \"labels\":$labels}" \
    "https://api.github.com/repos/$GITHUB_OWNER/$GITHUB_REPO/issues")

  # Check if issue was created successfully
  issue_number=$(echo "$response" | jq -r '.number // empty')
  
  if [ -n "$issue_number" ] && [ "$issue_number" != "null" ]; then
    issue_url=$(echo "$response" | jq -r '.html_url')
    echo "✅ Created issue #$issue_number: $issue_url"
  else
    echo "❌ Failed to create issue"
    echo "Response: $response"
  fi
}

# Extract and parse issues from analysis output
echo "🔍 Parsing analysis results for issues..."

# Count the issues in the file by looking for patterns that suggest issues
issue_count=$(grep -c -E "(High Priority|Medium Priority|Low Priority)" "$ANALYSIS_FILE" 2>/dev/null || echo "0")

if [ "$issue_count" -eq 0 ]; then
  echo "ℹ️ No priority issues found in analysis output."
  exit 0
fi

echo "📊 Found $issue_count potential issues to process"

# Parse the analysis output and create issues
# Look for issue patterns in the Continue CLI output
while IFS= read -r line; do
  if [[ $line =~ ^###.*Priority.*Issue ]]; then
    # Found a priority issue - extract title
    issue_title=$(echo "$line" | sed 's/^### *//' | sed 's/: */: /')
    
    # Read the next several lines for the issue body
    issue_body=""
    while IFS= read -r body_line && [[ ! $body_line =~ ^### ]]; do
      if [ -n "$body_line" ]; then
        issue_body="$issue_body$body_line\n"
      fi
    done
    
    # Determine labels based on priority
    if [[ "$issue_title" =~ "High Priority" ]]; then
      labels='["bug", "high-priority", "user-experience"]'
    elif [[ "$issue_title" =~ "Medium Priority" ]]; then
      labels='["enhancement", "medium-priority", "user-experience"]'
    else
      labels='["low-priority", "user-experience"]'
    fi
    
    # Create the issue
    create_github_issue "$issue_title" "$issue_body" "$labels"
  fi
done < "$ANALYSIS_FILE"

echo "✅ GitHub issues creation process completed!"
