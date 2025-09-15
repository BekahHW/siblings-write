#!/bin/bash
# analyze-sessions.sh
set -e

# Load .env if it exists (for local testing), otherwise use GitHub Actions environment
if [ -f .env ]; then
    source .env
fi

# Check for required environment variables
if [ -z "$POSTHOG_API_KEY" ] || [ -z "$POSTHOG_PROJECT_ID" ] || [ -z "$POSTHOG_HOST" ]; then
    echo "❌ Missing required environment variables"
    echo "POSTHOG_API_KEY: ${POSTHOG_API_KEY:+[SET]}"
    echo "POSTHOG_PROJECT_ID: ${POSTHOG_PROJECT_ID:+[SET]}"
    echo "POSTHOG_HOST: ${POSTHOG_HOST:+[SET]}"
    exit 1
fi

echo "🎬 Fetching session recordings from PostHog..."

# Fetch recent session recordings with potential issues
curl -s -H "Authorization: Bearer $POSTHOG_API_KEY" \
  "$POSTHOG_HOST/api/projects/$POSTHOG_PROJECT_ID/session_recordings/?limit=20" \
  | jq '.results[] | {
      id: .id,
      duration: .recording_duration,
      start_url: .start_url,
      click_count: .click_count,
      console_error_count: .console_error_count,
      person_distinct_id: .person.distinct_ids[0],
      start_time: .start_time
    }' > sessions.json

echo "📊 Found $(cat sessions.json | jq -s length) sessions"

# Filter for problematic sessions (errors or long durations)
cat sessions.json | jq -s 'map(select(.console_error_count > 0 or .recording_duration > 300))' > problem-sessions.json

echo "🚨 Found $(cat problem-sessions.json | jq length) problematic sessions"



if [ -n "$CONTINUE_API_KEY" ]; then
    echo "🔑 Logging in to Continue CLI..."
    echo "$CONTINUE_API_KEY" | cn login
fi

# Analyze with Continue CLI - save output to file for issue creation
cat problem-sessions.json | cn -p "
Analyze these PostHog session recordings and create exactly 3 GitHub issues for the most critical user experience problems.

Session data format:
- duration: session length in seconds
- start_url: starting page URL
- click_count: total clicks in session
- console_error_count: JavaScript errors

Format your response with EXACTLY 3 issues using this structure:

### 1. **Widespread JavaScript Errors**
**Problem**: Every session shows console errors affecting user experience
**Technical Causes**: Broken dependencies, missing resources, or initialization failures
**Affected Pages**: /blog/last-show/, /works/, /blog/viewing/
**Recommended Fix**:
- Add error monitoring (Sentry)
- Audit browser console on each page
- Fix broken dependencies
**Priority**: **HIGH**
**Impact**: Affects 100% of sessions

### 2. **[Second Issue Title]**
**Problem**: [One sentence problem description]
**Technical Causes**: [Technical explanation]
**Affected Pages**: [List URLs from the data]
**Recommended Fix**:
- [Specific action 1]
- [Specific action 2]
**Priority**: **[HIGH/MEDIUM/LOW]**
**Impact**: [Quantified impact]

### 3. **[Third Issue Title]**
**Problem**: [One sentence problem description]
**Technical Causes**: [Technical explanation]
**Affected Pages**: [List URLs from the data]
**Recommended Fix**:
- [Specific action 1]
- [Specific action 2]
**Priority**: **[HIGH/MEDIUM/LOW]**
**Impact**: [Quantified impact]

Base all issues on actual patterns in the provided session data. Focus on problems that affect multiple sessions or show critical failures.
" > analysis-results.txt 2>&1

echo "✅ Analysis complete! Check the output above for optimization opportunities."