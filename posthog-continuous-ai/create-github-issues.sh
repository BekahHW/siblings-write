#!/bin/bash

# create-github-issues.sh - Creates GitHub issues using GitHub API
set -e

# Load .env if it exists (for local testing)
if [ -f .env ]; then
  . .env
fi

# Input file containing Continue CLI analysis output
ANALYSIS_FILE="analysis-results.txt"

# Determine where the analysis file should be based on how we're being called
# If called from parent directory, files are created there
if [ "$(basename $(pwd))" != "posthog-continuous-ai" ] && [ -d "posthog-continuous-ai" ]; then
  echo "📁 Running from parent directory, analysis file should be here"
  # Analysis file is in current (parent) directory
elif [ "$(basename $(pwd))" == "posthog-continuous-ai" ] && [ -f "../$ANALYSIS_FILE" ]; then
  echo "📁 Running from posthog-continuous-ai, but analysis file is in parent"
  ANALYSIS_FILE="../$ANALYSIS_FILE"
fi

# Debug: Show environment
echo "🐛 DEBUG: Environment Check"
echo "  Working directory: $(pwd)"
echo "  Script directory: $(dirname "$0")"
echo "  Analysis file path: $ANALYSIS_FILE"
echo "  Analysis file exists: $([ -f "$ANALYSIS_FILE" ] && echo "✅ Yes" || echo "❌ No")"
echo "  Analysis file size: $([ -f "$ANALYSIS_FILE" ] && wc -c < "$ANALYSIS_FILE" || echo "0") bytes"
echo "  GitHub repo: ${GITHUB_OWNER:-[NOT SET]}/${GITHUB_REPO:-[NOT SET]}"
echo "  GH_PAT exists: $([ -n "$GH_PAT" ] && echo "✅ Yes (${#GH_PAT} chars)" || echo "❌ No")"

# Also check what files exist in current directory
echo "  Files in current directory:"
ls -la *.txt *.json 2>/dev/null | head -5 || echo "    No .txt or .json files found"

# Check required environment variables
if [ -z "$GITHUB_OWNER" ] || [ -z "$GITHUB_REPO" ]; then
  echo "❌ Missing GITHUB_OWNER or GITHUB_REPO environment variables"
  echo "GITHUB_OWNER: ${GITHUB_OWNER:-[NOT SET]}"
  echo "GITHUB_REPO: ${GITHUB_REPO:-[NOT SET]}"
  exit 1
fi

if [ -z "$GH_PAT" ]; then
  echo "❌ Missing GH_PAT (GitHub Personal Access Token)"
  echo "Set it in .env file or as environment variable"
  exit 1
fi

# Check if analysis file exists
if [ ! -f "$ANALYSIS_FILE" ]; then
  echo "❌ Analysis file not found: $ANALYSIS_FILE"
  echo "Contents of current directory:"
  ls -la
  exit 1
fi

# Show analysis file content for debugging
echo ""
echo "📄 DEBUG: Full analysis file content:"
echo "========================================="
cat "$ANALYSIS_FILE"
echo "========================================="
echo ""

# Function to create a GitHub issue using GitHub API
create_github_issue() {
  local title="$1"
  local body="$2"
  local labels="$3"

  echo ""
  echo "📝 DEBUG: Attempting to create issue:"
  echo "  Title: $title"
  echo "  Labels: $labels"
  echo "  Body preview (first 200 chars): ${body:0:200}..."
  echo "  Body length: ${#body} characters"
  echo "  Target repo: $GITHUB_OWNER/$GITHUB_REPO"

  # Create proper JSON body with escaped characters
  json_body=$(jq -n \
    --arg title "$title" \
    --arg body "$body" \
    --argjson labels "$labels" \
    '{title: $title, body: $body, labels: $labels}')
  
  echo "  📄 JSON request body:"
  echo "$json_body" | jq .

  # Make the API request
  echo "  🚀 Making API request..."
  
  # Use curl with error handling
  http_code=$(curl -s -o /tmp/github_response.json -w "%{http_code}" \
    -X POST \
    -H "Authorization: token $GH_PAT" \
    -H "Accept: application/vnd.github.v3+json" \
    -H "Content-Type: application/json" \
    -d "$json_body" \
    "https://api.github.com/repos/$GITHUB_OWNER/$GITHUB_REPO/issues")
  
  response=$(cat /tmp/github_response.json)
  
  echo "  HTTP Status Code: $http_code"
  
  # Check if issue was created successfully (201 Created)
  if [ "$http_code" = "201" ]; then
    issue_number=$(echo "$response" | jq -r '.number // empty')
    issue_url=$(echo "$response" | jq -r '.html_url // empty')
    echo "  ✅ Created issue #$issue_number: $issue_url"
    return 0
  else
    echo "  ❌ Failed to create issue (HTTP $http_code)"
    echo "  Response: $response"
    
    # Check for common errors
    error_message=$(echo "$response" | jq -r '.message // empty' 2>/dev/null || echo "")
    if [ -n "$error_message" ]; then
      echo "  Error message: $error_message"
    fi
    
    # Common error codes
    case $http_code in
      401) echo "  💡 Check your GH_PAT token permissions" ;;
      403) echo "  💡 Forbidden - check repo permissions or rate limits" ;;
      404) echo "  💡 Repository not found: $GITHUB_OWNER/$GITHUB_REPO" ;;
      422) echo "  💡 Invalid request - check JSON format" ;;
    esac
    
    return 1
  fi
}

# Extract and parse issues from analysis output
echo "🔍 Parsing analysis results for issues..."

# First, let's check what patterns we can find
echo ""
echo "🐛 DEBUG: Searching for issue patterns..."
echo "  Looking for '## Issue' pattern: $(grep -c "^## Issue" "$ANALYSIS_FILE" 2>/dev/null || echo "0") occurrences"
echo "  Looking for 'Priority' pattern: $(grep -c -E "(High|Medium|Low) Priority" "$ANALYSIS_FILE" 2>/dev/null || echo "0") occurrences"
echo "  Looking for '### ' pattern: $(grep -c "^### " "$ANALYSIS_FILE" 2>/dev/null || echo "0") occurrences"
echo ""

# Show lines that might be issues
echo "🐛 DEBUG: Lines containing 'Issue':"
grep -n "Issue" "$ANALYSIS_FILE" | head -10 || echo "  No lines with 'Issue' found"
echo ""

# Count the issues in the file by looking for the correct pattern
# The actual format is: ### N. **Title**
issue_count=$(grep -c "^### [0-9]\." "$ANALYSIS_FILE" 2>/dev/null || echo "0")

echo "📊 Found $issue_count potential issues to process"

# Parse the analysis output and create issues
# The Continue CLI output has numbered issues like: ### 1. **Title**
issues_created=0

# First, let's find where the actual analysis starts (skip the PostHog fetch output)
# Since the file now only contains the issues, start from line 1
analysis_start="1"
echo "🔍 Processing entire file as analysis content"

# Pattern 1: Look for ### N. **Title** format (what Continue CLI is actually outputting)
echo "🔍 Searching for '### [number]. **' pattern..."

# Process the file and extract issues
current_issue_num=0
current_title=""
current_body=""
current_priority=""

while IFS= read -r line; do
  # Check if this is a new issue header
  if [[ $line =~ ^###\ [0-9]+\.\ \*\*(.+)\*\* ]]; then
    # If we have a previous issue, create it
    if [ -n "$current_title" ] && [ -n "$current_body" ]; then
      # Determine labels
      if [[ "$current_priority" == "HIGH" ]]; then
        labels='["bug", "high-priority", "user-experience", "automated"]'
      elif [[ "$current_priority" == "MEDIUM" ]]; then
        labels='["enhancement", "medium-priority", "user-experience", "automated"]'
      else
        labels='["low-priority", "user-experience", "automated"]'
      fi
      
      if create_github_issue "🔍 UX Issue: $current_title" "$current_body" "$labels"; then
        ((issues_created++))
      else
        echo "  ⚠️  Failed to create issue #$current_issue_num"
      fi
    fi
    
    # Start new issue
    current_title="${BASH_REMATCH[1]}"
    current_body=""
    current_priority=""
    ((current_issue_num++))
    
    echo "  📌 Found issue #$current_issue_num: $current_title"
  else
    # This is part of the current issue body
    if [ $current_issue_num -gt 0 ]; then
      # Check for priority
      if [[ $line =~ \*\*Priority\*\*:\ \*\*(HIGH|MEDIUM|LOW)\*\* ]]; then
        current_priority="${BASH_REMATCH[1]}"
        echo "  Priority: $current_priority"
      fi
      current_body="${current_body}${line}"$'\n'
    fi
  fi
done < "$ANALYSIS_FILE"

# Don't forget the last issue
if [ -n "$current_title" ] && [ -n "$current_body" ]; then
  # Determine labels
  if [[ "$current_priority" == "HIGH" ]]; then
    labels='["bug", "high-priority", "user-experience", "automated"]'
  elif [[ "$current_priority" == "MEDIUM" ]]; then
    labels='["enhancement", "medium-priority", "user-experience", "automated"]'
  else
    labels='["low-priority", "user-experience", "automated"]'
  fi
  
  create_github_issue "🔍 UX Issue: $current_title" "$current_body" "$labels"
  ((issues_created++))
fi

# No need for fallback pattern - the main pattern should work

echo ""
echo "✅ GitHub issues creation process completed!"
echo "📊 Created $issues_created issue(s)"

# If still no issues created, show what we found
if [ $issues_created -eq 0 ]; then
  echo ""
  echo "⚠️  No issues were created. Here's what we found:"
  echo "  - Lines with '###': $(grep -c '^###' "$ANALYSIS_FILE")"
  echo "  - Lines with priority mentions: $(grep -ic 'priority' "$ANALYSIS_FILE")"
  echo ""
  echo "Sample of potential issue lines:"
  grep -E "^###.*\*\*|Priority.*:" "$ANALYSIS_FILE" | head -5
fi
